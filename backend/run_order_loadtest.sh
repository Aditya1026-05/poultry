#!/bin/bash
# Run incremental order load test — 4 tiers with warmup/cooldown
set -e

HOST="https://star-poultry-backend.onrender.com"
export LOADTEST_ADMIN_PASSWORD="admin123"

echo "=========================================="
echo "  ORDER LOAD TEST — 4-TIER RAMP"
echo "=========================================="

# Initial warmup
echo ""
echo "[WARMUP] Waking Render free tier..."
curl -s -o /dev/null -w "  Health check: HTTP %{http_code}, %{time_total}s\n" "$HOST/api/health"
echo "  Waiting 5s for server to stabilize..."
sleep 5

# Tier 1 — 10 users
echo ""
echo "=========================================="
echo "  TIER 1: 10 concurrent users, 60s"
echo "=========================================="
locust -f locustfile_orders.py --headless \
  --users 10 --spawn-rate 5 --run-time 60s \
  --host "$HOST" --csv=orders_tier1 2>&1 | tail -30

echo ""
echo "  Cooldown 10s..."
sleep 10

# Warmup before Tier 2
curl -s -o /dev/null -w "  Warmup: HTTP %{http_code}, %{time_total}s\n" "$HOST/api/health"
sleep 3

# Tier 2 — 20 users
echo ""
echo "=========================================="
echo "  TIER 2: 20 concurrent users, 60s"
echo "=========================================="
locust -f locustfile_orders.py --headless \
  --users 20 --spawn-rate 5 --run-time 60s \
  --host "$HOST" --csv=orders_tier2 2>&1 | tail -30

echo ""
echo "  Cooldown 10s..."
sleep 10

curl -s -o /dev/null -w "  Warmup: HTTP %{http_code}, %{time_total}s\n" "$HOST/api/health"
sleep 3

# Tier 3 — 30 users
echo ""
echo "=========================================="
echo "  TIER 3: 30 concurrent users, 60s"
echo "=========================================="
locust -f locustfile_orders.py --headless \
  --users 30 --spawn-rate 5 --run-time 60s \
  --host "$HOST" --csv=orders_tier3 2>&1 | tail -30

echo ""
echo "  Cooldown 10s..."
sleep 10

curl -s -o /dev/null -w "  Warmup: HTTP %{http_code}, %{time_total}s\n" "$HOST/api/health"
sleep 3

# Tier 4 — 50 users
echo ""
echo "=========================================="
echo "  TIER 4: 50 concurrent users, 60s"
echo "=========================================="
locust -f locustfile_orders.py --headless \
  --users 50 --spawn-rate 5 --run-time 60s \
  --host "$HOST" --csv=orders_tier4 2>&1 | tail -30

echo ""
echo "=========================================="
echo "  ALL TIERS COMPLETE"
echo "=========================================="
