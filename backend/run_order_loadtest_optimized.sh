#!/bin/bash
# Run order load test comparison (post-optimization) — Tier 1 & 2 only
set -e

HOST="https://star-poultry-backend.onrender.com"
export LOADTEST_ADMIN_PASSWORD="admin123"

echo "=========================================="
echo "  POST-OPTIMIZATION ORDER LOAD TEST"
echo "=========================================="

# Tier 1 — 10 users
echo ""
echo "=========================================="
echo "  TIER 1: 10 concurrent users, 60s"
echo "=========================================="
locust -f locustfile_orders.py --headless \
  --users 10 --spawn-rate 5 --run-time 60s \
  --host "$HOST" --csv=orders_optimized_tier1 2>&1 | tail -30

echo ""
echo "  Cooldown 10s..."
sleep 10

# Warmup between tiers
curl -s -o /dev/null -w "  Warmup: HTTP %{http_code}, %{time_total}s\n" "$HOST/api/health"
sleep 3

# Tier 2 — 20 users
echo ""
echo "=========================================="
echo "  TIER 2: 20 concurrent users, 60s"
echo "=========================================="
locust -f locustfile_orders.py --headless \
  --users 20 --spawn-rate 5 --run-time 60s \
  --host "$HOST" --csv=orders_optimized_tier2 2>&1 | tail -30

echo ""
echo "=========================================="
echo "  ALL TIERS COMPLETE"
echo "=========================================="
