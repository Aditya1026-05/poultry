def build_multi_fallback_response(data: dict):

    sections = []

    if "get_revenue" in data:

        revenue = data["get_revenue"]

        sections.append(
            f"""
REVENUE DATA

• Total Revenue: ₹{revenue.get("totalRevenue", 0)}
• Monthly Revenue: ₹{revenue.get("monthRevenue", 0)}
• Today's Revenue: ₹{revenue.get("todayRevenue", 0)}
• Completed Orders: {revenue.get("completedOrders", 0)}
"""
        )

    if "get_profit" in data:

        profit = data["get_profit"]

        sections.append(
            f"""
PROFIT DATA

• Total Revenue: ₹{profit.get("totalRevenue", 0)}
• Total Expenses: ₹{profit.get("totalExpenses", 0)}
• Net Profit: ₹{profit.get("netProfit", 0)}
• Profit Margin: {profit.get("profitMargin", 0)}%
"""
        )

    if "get_expenses" in data:

        expenses = data["get_expenses"]

        sections.append(
            f"""
EXPENSE DATA

• Total Expenses: ₹{expenses.get("totalExpenses", 0)}
• Expense Records: {expenses.get("expenseRecords", 0)}
"""
        )

    if "get_customers" in data:

        customers = data["get_customers"]

        sections.append(
            f"""
CUSTOMER DATA

• Top Customer: {customers.get("topCustomer", "N/A")}
• Top Revenue: ₹{customers.get("topRevenue", 0)}
• Total Customers: {customers.get("totalCustomers", 0)}
"""
        )

    if "get_orders" in data:

        orders = data["get_orders"]

        sections.append(
            f"""
ORDER DATA

• Total Orders: {orders.get("totalOrders", 0)}
• Completed Orders: {orders.get("completed", 0)}
• Delivered Orders: {orders.get("delivered", 0)}
• Rejected Orders: {orders.get("rejected", 0)}
"""
        )

    return "\n".join(sections)