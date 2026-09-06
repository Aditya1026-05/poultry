"""
Locust load test for Star Poultry ORDER CREATION endpoint.

This tests pure backend throughput (no Gemini API calls) by hitting:
  - POST /api/orders         — create order (any authenticated user)
  - GET  /api/orders/mine    — list user's orders (lightweight read)

Test data is tagged via a dedicated test user whose businessName starts
with "[LOAD_TEST]", so all orders created can be identified and cleaned up.

Credential safety:
  Admin password is read from LOADTEST_ADMIN_PASSWORD env var.
  Set it before running:  export LOADTEST_ADMIN_PASSWORD="your-password"

Usage:
  export LOADTEST_ADMIN_PASSWORD="admin123"

  # Tier 1 — 10 users, 60s
  locust -f locustfile_orders.py --headless --users 10 --spawn-rate 5 --run-time 60s \\
    --host https://star-poultry-backend.onrender.com --csv=orders_tier1

  # Tier 2 — 20 users, 60s
  locust -f locustfile_orders.py --headless --users 20 --spawn-rate 5 --run-time 60s \\
    --host https://star-poultry-backend.onrender.com --csv=orders_tier2

  # Tier 3 — 30 users, 60s
  locust -f locustfile_orders.py --headless --users 30 --spawn-rate 5 --run-time 60s \\
    --host https://star-poultry-backend.onrender.com --csv=orders_tier3

  # Tier 4 — 50 users, 60s
  locust -f locustfile_orders.py --headless --users 50 --spawn-rate 5 --run-time 60s \\
    --host https://star-poultry-backend.onrender.com --csv=orders_tier4
"""

import os
import random
import uuid
from datetime import datetime, timedelta

from locust import HttpUser, task, between, events

# ---------------------------------------------------------------------------
# Credentials — never hardcoded; read from environment
# ---------------------------------------------------------------------------
ADMIN_PASSWORD = os.environ.get("LOADTEST_ADMIN_PASSWORD")

if not ADMIN_PASSWORD:
    raise RuntimeError(
        "LOADTEST_ADMIN_PASSWORD env var is required. "
        "Set it before running:  export LOADTEST_ADMIN_PASSWORD='your-password'"
    )

# Test user credentials — each Locust user registers its own account
# so auth tokens don't collide
TEST_USER_PASSWORD = "loadtest123"


class OrderUser(HttpUser):
    """
    Simulates a customer creating orders and checking their order list.
    Each Locust user registers a unique test account on startup.
    
    Task weights: 70% order creation, 30% order listing (realistic mixed traffic).
    """
    wait_time = between(0.5, 1.5)
    token = None

    def on_start(self):
        """Register a unique test user and get a JWT token."""
        # Warmup
        self.client.get("/api/health", name="[warmup] /api/health")

        # Create a unique test user per Locust worker
        unique_id = uuid.uuid4().hex[:8]
        self.test_email = f"loadtest_{unique_id}@test.starpoultry.com"
        self.test_business = f"[LOAD_TEST] Test Business {unique_id}"

        resp = self.client.post(
            "/api/auth/signup",
            json={
                "email": self.test_email,
                "password": TEST_USER_PASSWORD,
                "businessName": self.test_business,
                "phone": f"90000{random.randint(10000, 99999)}",
            },
            name="POST /api/auth/signup",
        )

        if resp.status_code == 200:
            data = resp.json()
            self.token = data.get("token")
            self.user_id = data.get("user", {}).get("id")
        elif resp.status_code == 400:
            # Account might already exist (unlikely with UUID), try login
            login_resp = self.client.post(
                "/api/auth/login",
                json={"email": self.test_email, "password": TEST_USER_PASSWORD},
                name="POST /api/auth/login",
            )
            if login_resp.status_code == 200:
                data = login_resp.json()
                self.token = data.get("token")
                self.user_id = data.get("user", {}).get("id")
            else:
                print(f"[ERROR] Login failed for {self.test_email}: {login_resp.status_code}")
                self.token = None
        else:
            print(f"[ERROR] Signup failed: {resp.status_code} {resp.text[:200]}")
            self.token = None

    def _auth_headers(self):
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}

    @task(7)
    def create_order(self):
        """POST /api/orders — create a new order with realistic payload."""
        if not self.token:
            return

        # Realistic order quantities (egg trays)
        quantity = random.choice([5, 10, 15, 20, 25, 30, 50, 100])

        # Delivery date 2-7 days from now
        days_ahead = random.randint(2, 7)
        delivery_date = (datetime.now() + timedelta(days=days_ahead)).strftime("%Y-%m-%d")

        payload = {
            "quantity": quantity,
            "preferredDeliveryDate": delivery_date,
            # Base64 placeholder — the schema just requires a string
            "paymentScreenshot": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        }

        self.client.post(
            "/api/orders",
            json=payload,
            headers=self._auth_headers(),
            name="POST /api/orders",
        )

    @task(3)
    def list_my_orders(self):
        """GET /api/orders/mine — list this user's orders."""
        if not self.token:
            return

        self.client.get(
            "/api/orders/mine",
            headers=self._auth_headers(),
            name="GET /api/orders/mine",
        )
