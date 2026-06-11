from app.services.ai_tools import (
    get_complete_business_report,
    get_expense_categories,
)


async def get_business_health():

    overview = await get_complete_business_report()

    expense_categories = await get_expense_categories()

    revenue = overview.get("revenue", {})
    profit = overview.get("profit", {})
    orders = overview.get("orders", {})
    customers = overview.get("customers", {})
    expenses = overview.get("expenses", {})

    score = 100

    strengths = []
    issues = []
    recommendations = []
    priorities = []

    total_revenue = revenue.get("totalRevenue", 0)
    month_revenue = revenue.get("monthRevenue", 0)

    total_expenses = profit.get("totalExpenses", 0)
    net_profit = profit.get("netProfit", 0)
    profit_margin = profit.get("profitMargin", 0)

    total_orders = orders.get("totalOrders", 0)
    completed_orders = orders.get("completed", 0)
    pending_orders = orders.get("pendingReview", 0)
    rejected_orders = orders.get("rejected", 0)
    total_trays = orders.get("totalTrays", 0)

    total_customers = customers.get("totalCustomers", 0)
    top_customer = customers.get("topCustomer")
    top_customer_revenue = customers.get("topRevenue", 0)

    largest_category = expense_categories.get(
        "largestCategory",
        "Unknown"
    )

    largest_amount = expense_categories.get(
        "largestAmount",
        0
    )

    # ---------------------------
    # PROFITABILITY ANALYSIS
    # ---------------------------

    if net_profit < 0:

        score -= 40

        issues.append(
            f"Business is operating at a loss of ₹{abs(net_profit)}."
        )

        recommendations.append(
            "Increase revenue or reduce operating costs."
        )
        priorities.append(
            {
                "priority": 1,
                "action": "Increase revenue or reduce operating costs",
                "impact": "Critical",
            }
        )

    else:

        strengths.append(
            f"Business is profitable with ₹{net_profit} net profit."
        )

    # ---------------------------
    # PROFIT MARGIN
    # ---------------------------

    if profit_margin < 0:

        score -= 20

        issues.append(
            f"Profit margin is negative ({profit_margin}%)."
        )

    elif profit_margin >= 20:

        strengths.append(
            f"Healthy profit margin of {profit_margin}%."
        )

    elif profit_margin >= 10:

        strengths.append(
            f"Acceptable profit margin of {profit_margin}%."
        )

    else:

        issues.append(
            f"Low profit margin of {profit_margin}%."
        )

    # ---------------------------
    # CUSTOMER ANALYSIS
    # ---------------------------
    if total_customers < 10:
        priorities.append(
            {
                "priority": 3,
                "action": "Acquire additional customers",
                "impact": "Medium",
            }
        )

    if total_customers >= 5:

        strengths.append(
            f"Customer base contains {total_customers} customers."
        )

    else:

        score -= 10

        issues.append(
            "Customer base is relatively small."
        )

        recommendations.append(
            "Acquire more recurring customers."
        )

    # ---------------------------
    # CUSTOMER CONCENTRATION
    # ---------------------------

    if total_revenue > 0:

        contribution = (
            top_customer_revenue / total_revenue
        ) * 100

        if contribution > 50:

            score -= 10

            issues.append(
                f"{top_customer} contributes {contribution:.1f}% of revenue."
            )

            recommendations.append(
                "Reduce dependence on a single customer."
            )
            priorities.append(
                {
                    "priority": 2,
                    "action": f"Reduce dependency on {top_customer}",
                    "impact": "Medium",
                }
            )

        else:

            strengths.append(
                "Revenue is reasonably diversified."
            )

    # ---------------------------
    # ORDER ANALYSIS
    # ---------------------------

    if completed_orders > 0:

        strengths.append(
            f"{completed_orders} orders completed successfully."
        )

    if pending_orders > 5:

        score -= 10

        issues.append(
            f"{pending_orders} orders are pending review."
        )

    if rejected_orders > 0:

        score -= 5

        issues.append(
            f"{rejected_orders} orders were rejected."
        )

    # ---------------------------
    # EXPENSE ANALYSIS
    # ---------------------------

    if largest_amount > 0:

        issues.append(
            f"Largest expense category is {largest_category} (₹{largest_amount})."
        )

        recommendations.append(
            f"Review and optimize {largest_category} expenses."
        )
        priorities.append({
                "priority": 1,
                "action": f"Reduce {largest_category} expenses",
                "impact": "High",
            }
        )

    # ---------------------------
    # REVENUE ANALYSIS
    # ---------------------------

    if month_revenue > 0:

        strengths.append(
            f"Current month revenue is ₹{month_revenue}."
        )

    else:

        score -= 10

        issues.append(
            "No revenue recorded this month."
        )

    # ---------------------------
    # BUSINESS SCALE
    # ---------------------------

    if total_orders > 0:

        strengths.append(
            f"{total_orders} total orders processed."
        )

    if total_trays > 0:

        strengths.append(
            f"{total_trays} trays sold."
        )

    # ---------------------------
    # SCORE NORMALIZATION
    # ---------------------------

    if score < 0:
        score = 0

    if score > 100:
        score = 100

    # ---------------------------
    # STATUS
    # ---------------------------

    if score >= 80:
        status = "Excellent"

    elif score >= 60:
        status = "Good"

    elif score >= 40:
        status = "Average"

    else:
        status = "Needs Attention"

    priorities = sorted(
    priorities,
    key=lambda x: x["priority"]
    )

    return {
        "healthScore": score,
        "status": status,
        "strengths": strengths,
        "issues": issues,
        "recommendations": recommendations,
        "priorities": priorities,
    }
