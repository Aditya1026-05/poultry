# Star Poultry Farm AI & Business Intelligence Platform

An enterprise SaaS farm management and business intelligence platform designed for **Star Poultry** to manage operating expenses, streamline bulk tray ordering, track profitability metrics, and deliver automated real-time business health alerts.

---

## 🛠️ Tech Stack

*   **Frontend:** React.js, TypeScript, Tailwind CSS, Radix UI (Shadcn), Recharts, Framer Motion, TanStack Query, React Router.
*   **Backend:** FastAPI (Python), Python asyncio, Motor (Async MongoDB Driver), Pydantic (data validation), Python-Jose (JWT authentication).
*   **Database:** MongoDB.
*   **AI Integration:** Google Gemini API (utilizing native tool-calling/function-calling schemas, fallback chain routing, and conversational memory).

---

## 🚀 Key Architectural Deep Dive

This project implements several production-grade engineering patterns. Below is a detailed breakdown of the core modules:

### 1. Asynchronous I/O Database Pipelines
*   **Non-Blocking Event Loop:** Built with **FastAPI** and **Python's asyncio** to avoid blocking the main server thread during expensive network and database operations.
*   **Motor Driver Integration:** Replaced blocking database drivers with **Motor** (the async driver for MongoDB) to perform concurrent operations (e.g. fetching total revenue and expenses simultaneously).
*   **Async Stream Cursors:** Implemented asynchronous generators (`async for order in cursor`) to stream large operational datasets without loading massive arrays into server memory.

### 2. Event-Driven Alert Management System
*   **Automated operational audits:** Tracks business thresholds inside `alert_engine.py` triggered directly by modifying events (order submission, updates, expense deletions).
*   **Severity & Type Classification:** Segregates business events into severity levels (`critical`, `warning`, `info`) for issues such as health score drop (<40), negative profit, high customer dependency, customer dormancy, and expense spikes (>40%).
*   **Deduplication & Auto-Resolution:** Automatically suppresses duplicate unresolved alerts and marks active alerts as `isResolved = True` when the underlying database metrics recover.
*   **Flexible Metadata & Dismissals:** Saves structured context in an open `metadata` sub-object and handles `isDismissed = True` flags to hide critical alerts from login popups while keeping them in the system log.

### 3. Tool-Calling AI Copilot
*   **Gemini Function Calling:** Registers Python business helper routines as native LLM tools, allowing the agent to automatically fetch real-time reports, rank VIP customers, and trace expense categories in response to natural language queries.
*   **Semantic Intent Router:** Classifies queries (Overview, Trend Analysis, Chat) before invoking the LLM, reducing latency and optimizing API token consumption.
*   **Stateful Conversation Memory:** Tracks query histories and implements universal follow-up context resolution, permitting seamless conversational updates (e.g., asking *"Show dormant customers"* followed by *"Why are they inactive?"*).

### 4. Enterprise Security & Access Control
*   **JWT Sessions:** Implements secure JWT authentication with custom FastAPI dependency injections.
*   **Role-Based Access Control (RBAC):** Segregates Admin privileges (accessing Profit dashboards, expense charts, AI assistants, and system settings) from Customer accounts (placing orders, uploading payment receipts, and tracking order delivery status).

---

## 📦 Project Directory Structure

```text
├── backend/                  # FastAPI Backend
│   ├── app/
│   │   ├── routes/           # REST endpoints (auth, orders, expenses, profit, alerts, ai)
│   │   ├── services/         # Business services (alert_engine, business_health, intent_router)
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── database.py       # MongoDB Async connection configurations
│   │   ├── security.py       # JWT session helper & dependencies
│   │   └── main.py           # FastAPI entrypoint
│   └── test_alerts.py        # Integration test script for the alert engine
│
├── src/                      # React Frontend
│   ├── components/           # UI and Layout components (AppHeader, Navbar)
│   ├── context/              # Authentication context providers
│   ├── lib/                  # API clients (financeApi, alertsApi)
│   ├── pages/                # Views (Admin, Dashboard, Alerts Center, AIAssistant)
│   └── App.tsx               # Frontend router & layout configuration
```

---

## 🔧 Getting Started

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. From the project root, install packages:
   ```bash
   npm install
   # or
   bun install
   ```
2. Run the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:8080` in your browser.


# 🚀 Star Poultry AI Roadmap

## Level 1 – Business Intelligence Assistant

**Progress:** ✅ 100%

**Capability:**
Answer core business questions related to revenue, expenses, profit, orders, and customers.

**Example Questions:**

* What is my total revenue?
* How much profit have I made?
* How many orders are completed?
* Who is my top customer?

---

## Level 2 – Farm Performance Analyst

**Progress:** ✅ 100%

**Capability:**
Analyze business performance, identify strengths and weaknesses, and generate recommendations.

**Example Questions:**

* How healthy is my business?
* What needs attention?
* Which month performed best?
* What should I focus on?

---

## Level 3 – Customer Intelligence Engine

**Progress:** ✅ 100%

**Capability:**
Understand customer behavior, rankings, segmentation, and inactivity patterns.

**Example Questions:**

* Who are my VIP customers?
* Show customer leaderboard.
* Who are my dormant customers?
* Why is B2 a VIP customer?

---

## Level 4 – Smart Business Alerts

**Progress:**  ✅ 100%

**Capability:**
Automatically detect risks, anomalies, and operational issues without requiring manual analysis.

**Example Questions:**

* What alerts do I have?
* What needs urgent attention?
* Are there any business risks?
* Why did I receive this alert?

---

## Level 5 – Natural Language Data Queries

**Progress:**  ✅ 100%

**Capability:**
Query business data using plain English instead of predefined commands.

**Example Questions:**

* Show orders between June 1 and June 15.
* Compare this month with last month.
* How much revenue did B2 generate?
* Show medicine expenses.

---

## Level 6 – AI Business Operator

**Progress:**  30%

**Capability:**
Allow the AI to perform business operations directly through chat.

**Example Questions:**

* Add an expense of ₹5000.
* Create an order for B2.
* Register a new customer.
* Update delivery status.

---

## Level 7 – Expense Optimization Engine

**Progress:**  35%

**Capability:**
Identify spending inefficiencies and profitability opportunities.

**Example Questions:**

* How can I reduce expenses?
* Which category is hurting profit?
* What costs should I optimize?
* How can I improve profitability?

---

## Level 8 – Demand Forecasting Engine

**Progress:**  0%

**Capability:**
Predict future revenue, profit, demand, and order volume.

**Example Questions:**

* What will next month's revenue be?
* Forecast sales for next month.
* Predict tray demand.
* Expected profit next month?

---

## Level 9 – AI Business Advisor

**Progress:**  45%

**Capability:**
Generate strategic recommendations and growth plans using business intelligence.

**Example Questions:**

* Act as my business consultant.
* How should I grow?
* Where should I invest?
* What should be my next priority?

---

## Level 10 – Autonomous Poultry Copilot

**Progress:**  0%

**Capability:**
Provide proactive monitoring, daily briefings, forecasting, and operational guidance.

**Example Questions:**

* Give me today's business briefing.
* What should I focus on today?
* Are there any upcoming risks?
* What actions do you recommend?

---

## Performance Testing & Optimization

This section documents a systematic load-testing and optimization effort performed against the live production deployment (`star-poultry-backend.onrender.com`, Render free tier). All numbers below are directly measured unless explicitly marked as estimates.

### 1. Methodology

**Tool**: [Locust](https://locust.io/) (Python-based load testing framework). Chosen because it runs in the same Python ecosystem as the FastAPI backend, allows programmatic test scenarios with realistic payloads based on real Pydantic schemas, and supports custom request labeling for per-query-type breakdowns.

**Why two separate test suites?**
The backend has two structurally different endpoint categories:

- **AI copilot endpoints** (`POST /ai/chat`) — each request triggers 1–2 external Gemini 2.5 Flash API calls. Latency here is dominated by the external LLM API (~75–85% of end-to-end time), so these numbers reflect the full AI pipeline, not raw backend capacity.
- **Order creation endpoints** (`POST /api/orders`) — pure backend logic: FastAPI → MongoDB insert → alert generation. No external API calls. These numbers reflect the backend's own throughput ceiling.

Blending both into one test would produce meaningless averages — a 500ms Gemini response and a 7,000ms order-with-alerts response are caused by completely different bottlenecks.

**Why segment by query type?**
The AI copilot has three structurally different code paths:

| Query Type | Code Path | Gemini Calls |
|---|---|---|
| Simple intent | `detect_intent()` → DB fetch → `safe_generate()` | 1 |
| Function-calling | `gemini_function_agent()` → execute tools → `safe_generate()` | 2 |
| Expense draft | `gemini_function_agent()` → `create_expense_draft()` (in-memory) | 1 |

Merging these into one `POST /ai/chat` stat would mask the performance characteristics of each path. The segmentation was achieved using Locust's `name=` parameter to assign distinct labels (e.g., `[simple-intent] /ai/chat`) to each request type, so Locust computes p50/p95/p99 per group automatically.

**Sample size matters for percentiles.** A p95 computed from 10 samples represents a single data point — that's noise, not signal. Each query type was run for 5 minutes (300 seconds) to collect 50–122 samples per group, enough for p95 to be statistically meaningful. Where sample size was still low, the report flags the stat as "low confidence."

**Test data hygiene.** All test data was tagged with a `[LOAD_TEST]` marker (orders: `businessName` field; expenses: `title` prefix; users: `email` pattern `loadtest_*@test.starpoultry.com`) and cleaned up after each run via dedicated cleanup scripts. No test data was left in the production database.

**Test artifacts** (reproducible):
- AI copilot test: [`backend/locustfile.py`](backend/locustfile.py)
- Order creation test: [`backend/locustfile_orders.py`](backend/locustfile_orders.py)
- Cleanup scripts: [`backend/cleanup_load_test.py`](backend/cleanup_load_test.py), [`backend/cleanup_orders_load_test.py`](backend/cleanup_orders_load_test.py)
- Raw CSV results: `backend/load_test_tier1v2_results_stats.csv`, `backend/orders_tier*_stats.csv`, `backend/orders_optimized_tier*_stats.csv`

---

### 2. AI Copilot Load Test Results

**Config**: 5 concurrent users, 5-minute run, deployed Render instance.
**Total requests**: 342 | **Error rate**: 0%

#### Per-Query-Type Breakdown

| Query Type | n | p50 | p95 | p99 | Avg | Min | Max | Confidence |
|---|---|---|---|---|---|---|---|---|
| **Simple intent** (1 Gemini call) | 122 | 580 ms | 1,100 ms | 6,200 ms | 803 ms | 467 ms | 11,818 ms | ✅ High |
| **Function-calling** (2 Gemini calls) | 115 | 560 ms | 760 ms | 2,200 ms | 621 ms | 452 ms | 3,751 ms | ✅ High |
| **Expense draft** (1 Gemini call + in-memory) | 53 | 520 ms | 760 ms | 5,800 ms | 659 ms | 445 ms | 5,825 ms | ⚠️ p99 low-confidence (n=53 ≈ 1 data point at p99) |

#### Counterintuitive Finding

Function-calling queries (2 sequential Gemini calls) were **faster and more consistent** than simple-intent queries (1 call): p50 of 560ms vs 580ms, and critically, p95 of 760ms vs 1,100ms.

**Hypothesis**: Gemini 2.5 Flash processes short, structured function-calling prompts more efficiently than the longer freeform text-generation prompts used in `safe_generate()`. The function-calling prompt is a concise schema declaration; the text-generation prompt includes full business context data (revenue tables, customer lists) that takes longer to process. The tighter variance (p99=2.2s vs 6.2s) supports this — function-calling responses are more predictable.

#### Backend vs. Gemini Latency Split (Estimated)

> **Note**: Timing instrumentation headers (`X-Backend-Time-Ms`, `X-Gemini-Time-Ms`) were implemented in the codebase via a `ContextVar`-based timing module ([`backend/app/services/timing.py`](backend/app/services/timing.py)) and added to the `/ai/chat` route handler. However, this instrumentation was not deployed to Render during testing, so the split below is **estimated** from cross-path analysis, not directly measured.

| Component | Estimated Share of E2E Latency |
|---|---|
| Gemini API calls | ~75–85% |
| MongoDB queries (Atlas network hop) | ~10–15% |
| Backend processing (intent routing, serialization) | ~1–3% |

The estimate is derived by comparing expense-draft latency (p50=520ms, one Gemini call + in-memory operation) against simple-intent latency (p50=580ms, one Gemini call + DB queries + text generation) — the difference (~60ms) represents the backend's marginal contribution.

---

### 3. Order Creation — Bug Discovery and Fix

#### Initial Load Test Findings

The first order creation load test (10 concurrent users, 60s) revealed unexpectedly high latency:

| Metric | Measured Value |
|---|---|
| p50 | 7,200 ms |
| p95 | 12,000 ms |
| Avg | 8,158 ms |
| Min | 6,389 ms |
| RPS | 0.76 |
| Error rate | 0% |

For a simple `POST` that inserts one document into MongoDB, 7.2 seconds p50 was far too slow.

#### Root Cause

Tracing the code in `routes/orders.py` revealed the bottleneck:

```python
await orders_collection.insert_one(order)          # ~50-200ms
await generate_alerts()                             # ← 5-15 seconds (blocking)
return clean_order(order)
```

`generate_alerts()` is a full analytics scan: it reads all orders, computes revenue trends, calculates customer rankings, checks expense ratios, and evaluates alert thresholds. This ran **synchronously** on every order creation, blocking the HTTP response for 5–15 seconds.

#### The Fix

Moved `generate_alerts()` to a FastAPI `BackgroundTask` so it runs **after** the response is sent:

```diff
-from fastapi import APIRouter, Depends, HTTPException
+from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
+from app.services.alert_engine import generate_alerts

 @router.post("", response_model=OrderResponse)
-async def create_order(payload: CreateOrderRequest, user=Depends(get_current_user)):
+async def create_order(payload: CreateOrderRequest, user=Depends(get_current_user),
+                       background_tasks: BackgroundTasks = BackgroundTasks()):
     ...
     await orders_collection.insert_one(order)
-    from app.services.alert_engine import generate_alerts
-    await generate_alerts()
+    background_tasks.add_task(generate_alerts)
     return clean_order(order)
```

**Safety check performed before applying**: `GET /api/alerts` independently calls `generate_alerts()` before returning results, so no endpoint depends on alerts being immediately available after order creation. The background execution is safe.

#### Before/After Comparison (Measured, 10 Concurrent Users)

| Metric | Before (n=45) | After (n=86) | Improvement |
|---|---|---|---|
| **p50** | 7,200 ms | 2,900 ms | **−60%** |
| **p95** | 12,000 ms | 6,500 ms | **−46%** |
| **p99** | 21,000 ms | 11,000 ms | **−48%** |
| **Avg** | 8,158 ms | 3,170 ms | **−61%** |
| **Min** | 6,389 ms | 970 ms | **−85%** |
| **RPS** | 0.76 | 1.48 | **+95%** |
| **Total requests (60s)** | 87 | 144 | **+66%** |
| **Error rate** | 0% | 0% | — |

#### Tradeoff Discovered

The `GET /api/orders/mine` read endpoint became slightly **slower** after the optimization:

| Metric | Before (n=22) | After (n=38) |
|---|---|---|
| p50 | 700 ms | 2,300 ms |
| Avg | 1,505 ms | 2,218 ms |

**Cause**: Background `generate_alerts()` tasks now run concurrently with incoming read requests, competing for the same MongoDB connections. Before, alerts ran synchronously during order creation, so by the time the next read request fired, the scan was already complete. This is a real tradeoff, not a hidden flaw — order creation (the write path) improved 2.5x while reads under heavy write load degraded slightly.

#### Why Not a Full 25x Improvement?

The projected improvement was 25x (7.2s → ~300ms). The actual improvement was 2.5x (7.2s → 2.9s). Three factors explain the gap:

1. **Event loop sharing**: FastAPI's `BackgroundTasks` runs in the same async event loop. If `generate_alerts()` holds the event loop with CPU work or blocking I/O, it still impacts concurrent requests.
2. **MongoDB Atlas contention**: The background alert scan reads the same collections that order creation writes to, causing I/O contention under concurrent load.
3. **Single Render worker**: Render free tier runs one uvicorn worker process, so all async tasks share one event loop and one set of MongoDB connections.

**Identified but not yet implemented optimization paths**:
- Move `generate_alerts()` to a **periodic cron** (every 5 minutes) instead of triggering per-request
- Use a **task queue** (Celery + Redis) to run alerts in a completely separate process
- Upgrade to a paid Render tier with **multiple uvicorn workers**

---

### 4. Concurrency Ceiling Findings

A 4-tier incremental ramp test was performed on order creation (pre-optimization) to find the exact concurrency breakpoint:

| Tier | Users | Total Requests | Error Rate | POST /api/orders p50 | RPS | Verdict |
|---|---|---|---|---|---|---|
| 1 | 10 | 87 | **0%** | 7,200 ms | 0.76 | ✅ Clean |
| 2 | 20 | 79 | **0%** | 21,000 ms | 0.44 | ✅ Clean |
| 3 | 30 | 611 | **89.7%** | — (429s) | 10.22 | ❌ Rate-limited |
| 4 | 50 | 131 | **72.5%** | — (blocked) | 2.22 | ❌ Blocked |

**Breakpoint: 20 concurrent users.** The transition from 20 → 30 users was **sharp, not gradual** — 0% errors to 90% errors. This is characteristic of platform-level rate limiting, not a graceful application degradation.

**How platform limits were distinguished from application errors:**
- **429 Too Many Requests** (from Render/Cloudflare) — the platform rejecting traffic before it reaches the application
- **502 Bad Gateway** — Render's proxy timing out on an overloaded instance
- **503 Service Unavailable** — Render's instance completely overwhelmed
- All three are infrastructure-level rejections, not application exceptions. The application code itself returned 0% errors at every concurrency level where requests actually reached it.

**Post-optimization shift**: After the `BackgroundTasks` fix, the same 20-user test that previously had 0% errors now showed **80.6% errors** (429 rate limits). This happened because requests completed so much faster (3s vs 21s) that the effective RPS jumped from 0.44 to 7.3 — fast enough to trigger Render's rate limit. The app became fast enough to saturate its own hosting platform.

---

### 5. Real Production Usage

Separate from synthetic load testing, the platform has been in **active daily production use** by Star Poultry:

| Metric | Value | Source |
|---|---|---|
| Orders processed | 200+ per week | MongoDB `orders` collection |
| Expense entries | 10–30 per week | MongoDB `expenses` collection |
| Active users | Admin + customer accounts | MongoDB `users` collection |
| Uptime | Continuous since deployment | Render dashboard |

These are real business transactions — egg tray orders from actual customers, expense tracking by the business owner — not synthetic test data. Real usage data and synthetic load test numbers serve different purposes:

- **Synthetic tests** reveal performance ceilings, bottlenecks, and regression risks under controlled conditions
- **Real usage data** demonstrates that the system is production-ready and actively relied upon for business operations

---

### 6. Key Takeaways / Lessons Learned

- **Sample size matters for percentiles.** A p95 computed from 10 samples is a single data point. Running tests for 5 minutes instead of 60 seconds (collecting 50–122 samples per query type) produced statistically meaningful tail latency measurements.

- **Segment by code path, not just by endpoint.** Blending three structurally different AI query types into one `POST /ai/chat` stat would have hidden the real performance characteristics. Per-query-type labeling revealed that function-calling queries (2 Gemini calls) were counterintuitively faster than simple-intent queries (1 Gemini call).

- **Synthetic load tests can reveal real bugs.** The `generate_alerts()` bottleneck (5–15 seconds per order creation) was invisible in normal usage because single-user response times "felt okay." Only under 10 concurrent users did the 7.2s p50 become obviously wrong, leading directly to a code fix with a measured 60% latency reduction.

- **Distinguish platform limits from application limits.** At 30 users, the 90% error rate was entirely Render/Cloudflare 429s, not application crashes. Without checking error codes, this could have been misattributed to a backend bug. The application handled every request that actually reached it.

- **Optimizing one path can shift bottlenecks.** After fixing order creation latency, the same 20-user test that previously passed cleanly now triggered rate limits — because the app was sending requests 5x faster. The bottleneck shifted from application code to platform infrastructure.

- **Document tradeoffs honestly.** The `BackgroundTasks` optimization improved order creation by 60% but made concurrent reads 47% slower under load. Acknowledging this tradeoff — and explaining why it's acceptable — is more credible than claiming a pure win.
