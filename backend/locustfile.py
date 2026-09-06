"""
Locust load test for Star Poultry AI Copilot backend.

Query types are segmented into three distinct Locust request names:
  - [simple-intent]  /ai/chat   — single Gemini call via safe_generate
  - [function-call]  /ai/chat   — two sequential Gemini calls via gemini_function_agent
  - [expense-draft]  /ai/chat   — Gemini function-calling → in-memory draft (no second LLM call)

This lets Locust compute p50/p95/p99 separately per query type.

Credential safety:
  Admin password is read from LOADTEST_ADMIN_PASSWORD env var.
  Set it before running:  export LOADTEST_ADMIN_PASSWORD="your-password"

Usage:
  # Tier 1 — realistic load, extended duration for statistical validity
  locust -f locustfile.py --headless --users 5 --spawn-rate 1 --run-time 5m \\
    --host https://star-poultry-backend.onrender.com --csv=load_test_tier1_results

  # Tier 2 — stress test
  locust -f locustfile.py --headless --users 50 --spawn-rate 5 --run-time 60s \\
    --host https://star-poultry-backend.onrender.com --csv=load_test_tier2_results
"""

import os
import random
import statistics
import time
from datetime import datetime, timedelta

from locust import HttpUser, task, between, events

# ---------------------------------------------------------------------------
# Credentials — never hardcoded; read from environment
# ---------------------------------------------------------------------------
ADMIN_EMAIL = os.environ.get("LOADTEST_ADMIN_EMAIL", "admin@starpoultry.com")
ADMIN_PASSWORD = os.environ.get("LOADTEST_ADMIN_PASSWORD")

if not ADMIN_PASSWORD:
    raise RuntimeError(
        "LOADTEST_ADMIN_PASSWORD env var is required. "
        "Set it before running:  export LOADTEST_ADMIN_PASSWORD='your-password'"
    )

# ---------------------------------------------------------------------------
# Query types — segmented by code path for accurate latency reporting
# ---------------------------------------------------------------------------

# Group 1: Simple intent queries → intent detection → single safe_generate() call
SIMPLE_INTENT_QUERIES = [
    "What is my total revenue this month?",
    "Show me profit and loss summary",
    "How many orders do I have?",
    "What are my total expenses?",
]

# Group 2: Function-calling queries → business_agent → gemini_function_agent
#   (Gemini call #1: function selection, execute DB queries, Gemini call #2: answer generation)
FUNCTION_CALLING_QUERIES = [
    "Who are my top customers?",
    "Compare May and June revenue",
    "Show me dormant customers",
    "How healthy is my business?",
]

# Group 3: Expense draft queries → gemini_function_agent → create_expense_draft
#   (Gemini call #1: parse NL into structured draft, returns JSON directly — no second LLM call)
EXPENSE_DRAFT_QUERIES = [
    "Add expense: Bought 50kg feed for ₹2500 today",
    "Record electricity bill ₹1800 for August",
    "Log medicine purchase ₹900 for poultry vitamins",
    "Add transport expense ₹1200 for egg delivery",
]

# Locust request name labels (appear in stats breakdown)
LABEL_SIMPLE   = "[simple-intent] /ai/chat"
LABEL_FUNCCALL = "[function-call] /ai/chat"
LABEL_DRAFT    = "[expense-draft] /ai/chat"

# ---------------------------------------------------------------------------
# Expense CRUD templates (for direct API testing)
# ---------------------------------------------------------------------------
EXPENSE_TEMPLATES = [
    {"title": "[LOAD_TEST] Feed Purchase - Layer Mash", "category": "Feed", "amount": 4500, "description": "50kg layer mash from local supplier"},
    {"title": "[LOAD_TEST] Poultry Medicine - Vitamins", "category": "Medicine", "amount": 1200, "description": "Vitamin supplements for broilers"},
    {"title": "[LOAD_TEST] Electricity Bill - August", "category": "Electricity", "amount": 3800, "description": "Monthly electricity bill"},
    {"title": "[LOAD_TEST] Transport - Egg Delivery", "category": "Transport", "amount": 2200, "description": "Delivery truck fuel and tolls"},
    {"title": "[LOAD_TEST] Daily Labor Wages", "category": "Labor", "amount": 5000, "description": "Farm workers daily wages"},
    {"title": "[LOAD_TEST] Shed Repair", "category": "Maintenance", "amount": 7500, "description": "Roof repair on shed #3"},
    {"title": "[LOAD_TEST] New Feeder Trays", "category": "Equipment", "amount": 9000, "description": "10 new automatic feeder trays"},
    {"title": "[LOAD_TEST] Miscellaneous Supplies", "category": "Miscellaneous", "amount": 800, "description": "Cleaning supplies and gloves"},
]

# ---------------------------------------------------------------------------
# Latency split collector (populated from response headers)
# ---------------------------------------------------------------------------
timing_data = {
    LABEL_SIMPLE:   {"total_ms": [], "backend_ms": [], "gemini_ms": []},
    LABEL_FUNCCALL: {"total_ms": [], "backend_ms": [], "gemini_ms": []},
    LABEL_DRAFT:    {"total_ms": [], "backend_ms": [], "gemini_ms": []},
}


def _collect_timing(label, response):
    """Extract timing headers from a /ai/chat response."""
    try:
        total = float(response.headers.get("X-Total-Time-Ms", 0))
        backend = float(response.headers.get("X-Backend-Time-Ms", 0))
        gemini = float(response.headers.get("X-Gemini-Time-Ms", 0))
        if total > 0:
            timing_data[label]["total_ms"].append(total)
            timing_data[label]["backend_ms"].append(backend)
            timing_data[label]["gemini_ms"].append(gemini)
    except (ValueError, TypeError):
        pass


def _percentile(data, p):
    """Return the p-th percentile of a sorted list."""
    if not data:
        return 0
    sorted_data = sorted(data)
    k = (len(sorted_data) - 1) * (p / 100)
    f = int(k)
    c = f + 1
    if c >= len(sorted_data):
        return sorted_data[f]
    return sorted_data[f] + (k - f) * (sorted_data[c] - sorted_data[f])


def _send_chat(client, message, label):
    """Send a /ai/chat request with a specific Locust name label."""
    with client.post(
        "/ai/chat",
        json={"message": message},
        name=label,
        catch_response=True,
    ) as response:
        if response.status_code == 200:
            _collect_timing(label, response)
            response.success()
        elif response.status_code == 429:
            response.failure(f"Rate limited (429): {response.text[:200]}")
        else:
            response.failure(f"HTTP {response.status_code}: {response.text[:200]}")


# ---------------------------------------------------------------------------
# User classes
# ---------------------------------------------------------------------------

class CopilotUser(HttpUser):
    """
    Simulates users hitting the AI copilot chat endpoint.
    Weight=3: 75% of simulated traffic goes here (the headline feature).

    Three task types with equal weight so each query group gets ~equal samples.
    """
    weight = 3
    wait_time = between(2, 5)

    def on_start(self):
        """Warmup request to handle Render cold-start."""
        self.client.get("/api/health", name="[warmup] /api/health")

    @task(2)
    def simple_intent_query(self):
        """Single Gemini call via safe_generate — revenue, profit, orders, expenses."""
        message = random.choice(SIMPLE_INTENT_QUERIES)
        _send_chat(self.client, message, LABEL_SIMPLE)

    @task(2)
    def function_calling_query(self):
        """Two sequential Gemini calls via gemini_function_agent — customers, comparisons."""
        message = random.choice(FUNCTION_CALLING_QUERIES)
        _send_chat(self.client, message, LABEL_FUNCCALL)

    @task(1)
    def expense_draft_query(self):
        """Gemini function-calling → in-memory create_expense_draft — no second LLM call."""
        message = random.choice(EXPENSE_DRAFT_QUERIES)
        _send_chat(self.client, message, LABEL_DRAFT)


class ExpenseAPIUser(HttpUser):
    """
    Simulates admin users performing expense CRUD operations.
    Weight=1: 25% of simulated traffic.
    """
    weight = 1
    wait_time = between(1, 2)
    token = None

    def on_start(self):
        """Authenticate as admin to get a JWT token."""
        self.client.get("/api/health", name="[warmup] /api/health")

        resp = self.client.post(
            "/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            name="POST /api/auth/login",
        )
        if resp.status_code == 200:
            self.token = resp.json().get("token")
        else:
            print(f"[ERROR] Admin login failed: {resp.status_code} {resp.text[:200]}")
            self.token = None

    def _auth_headers(self):
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}

    @task(3)
    def create_expense(self):
        if not self.token:
            return
        template = random.choice(EXPENSE_TEMPLATES)
        days_ago = random.randint(0, 30)
        expense_date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
        payload = {
            **template,
            "expenseDate": expense_date,
            "amount": template["amount"] + random.randint(-500, 500),
        }
        self.client.post(
            "/api/expenses",
            json=payload,
            headers=self._auth_headers(),
            name="POST /api/expenses",
        )

    @task(2)
    def list_expenses(self):
        if not self.token:
            return
        self.client.get(
            "/api/expenses",
            headers=self._auth_headers(),
            name="GET /api/expenses",
        )

    @task(1)
    def get_kpis(self):
        if not self.token:
            return
        self.client.get(
            "/api/expenses/kpis",
            headers=self._auth_headers(),
            name="GET /api/expenses/kpis",
        )


# ---------------------------------------------------------------------------
# Summary report on test completion
# ---------------------------------------------------------------------------
@events.quitting.add_listener
def print_timing_summary(environment, **kwargs):
    """Print a per-query-type latency-split summary table when the test finishes."""
    print("\n" + "=" * 80)
    print("  PER-QUERY-TYPE LATENCY REPORT — AI Copilot Endpoint")
    print("=" * 80)

    for label in [LABEL_SIMPLE, LABEL_FUNCCALL, LABEL_DRAFT]:
        data = timing_data[label]
        n = len(data["total_ms"])
        print(f"\n  [{label}]  (n={n})")

        if n == 0:
            print("    No timing data collected.")
            continue

        if n < 20:
            print("    ⚠️  LOW CONFIDENCE — fewer than 20 samples")

        print(f"    {'Metric':<15} {'Total (E2E)':>12} {'Backend':>12} {'Gemini API':>12}")
        print("    " + "-" * 55)

        for pct_label, pct in [("p50", 50), ("p95", 95), ("p99", 99)]:
            total = _percentile(data["total_ms"], pct)
            backend = _percentile(data["backend_ms"], pct)
            gemini = _percentile(data["gemini_ms"], pct)
            confidence = "" if n >= 20 else " ⚠️"
            print(f"    {pct_label:<15} {total:>9.0f} ms  {backend:>9.0f} ms  {gemini:>9.0f} ms{confidence}")

        avg_total = statistics.mean(data["total_ms"])
        avg_gemini = statistics.mean(data["gemini_ms"])
        gemini_pct = (avg_gemini / avg_total * 100) if avg_total > 0 else 0
        print(f"    {'Average':<15} {avg_total:>9.0f} ms  {statistics.mean(data['backend_ms']):>9.0f} ms  {avg_gemini:>9.0f} ms")
        print(f"    Gemini share: {gemini_pct:.1f}% of E2E latency")

    print("\n" + "=" * 80 + "\n")
