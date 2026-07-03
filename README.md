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


