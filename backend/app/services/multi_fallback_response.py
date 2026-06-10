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

    if "get_customer_details" in data:

        customers = data["get_customer_details"]

        if not isinstance(customers, list):
            customers = [customers]

        customer_text = ""

        for customer in customers:

            customer_text += f"""
    • Customer: {customer.get("customer")}
    • Orders: {customer.get("totalOrders")}
    • Revenue: ₹{customer.get("totalRevenue")}
    • Trays: {customer.get("totalTrays")}
    • Last Order: {customer.get("lastOrderDate")}
    • Last Delivery: {customer.get("lastDeliveryDate")}

    """

        sections.append(
            f"""
    CUSTOMER DETAILS

    {customer_text}
    """
    )

    if "get_expense_categories" in data:

        expense_data = data["get_expense_categories"]

        sections.append(
            f"""
    EXPENSE CATEGORY DATA

    • Largest Category:
    {expense_data.get("largestCategory")}

    • Largest Amount:
    ₹{expense_data.get("largestAmount")}

    • Categories:
    {expense_data.get("categories")}
    """
        )

    if "get_orders_between_dates" in data:

        report = data["get_orders_between_dates"]

        sections.append(
            f"""
    DATE RANGE REPORT

    • Start Date:
    {report.get("startDate")}

    • End Date:
    {report.get("endDate")}

    • Total Orders:
    {report.get("totalOrders")}

    • Total Revenue:
    ₹{report.get("totalRevenue")}

    • Total Trays:
    {report.get("totalTrays")}
    """
        )


    return "\n".join(sections)