def build_context(data: dict) -> str:

    sections = []

    for tool_name, tool_data in data.items():
        if tool_name.startswith("get_"):
            tool_name = tool_name.replace("get_", "")

        if tool_name == "revenue":

            sections.append(f"""
REVENUE DATA

Total Revenue: ₹{tool_data.get("totalRevenue", 0)}
Monthly Revenue: ₹{tool_data.get("monthRevenue", 0)}
Today's Revenue: ₹{tool_data.get("todayRevenue", 0)}
Completed Orders: {tool_data.get("completedOrders", 0)}
""")

        elif tool_name == "profit":

            sections.append(f"""
PROFIT DATA

Total Revenue: ₹{tool_data.get("totalRevenue", 0)}
Total Expenses: ₹{tool_data.get("totalExpenses", 0)}
Net Profit: ₹{tool_data.get("netProfit", 0)}
Profit Margin: {tool_data.get("profitMargin", 0)}%
""")

        elif tool_name == "orders":

            sections.append(f"""
ORDERS DATA

Total Orders: {tool_data.get("totalOrders", 0)}
Completed Orders: {tool_data.get("completed", 0)}
Delivered Orders: {tool_data.get("delivered", 0)}
Pending Review: {tool_data.get("pendingReview", 0)}
Rejected Orders: {tool_data.get("rejected", 0)}
Total Trays: {tool_data.get("totalTrays", 0)}
""")

        elif tool_name == "customers":

            sections.append(f"""
CUSTOMER DATA

Total Customers: {tool_data.get("totalCustomers", 0)}
Top Customer: {tool_data.get("topCustomer")}
Top Customer Revenue: ₹{tool_data.get("topRevenue", 0)}
""")

        elif tool_name == "overview":

            revenue = tool_data.get("revenue", {})
            profit = tool_data.get("profit", {})
            orders = tool_data.get("orders", {})
            customers = tool_data.get("customers", {})

            sections.append(f"""
BUSINESS OVERVIEW

Revenue:
- Total Revenue: ₹{revenue.get("totalRevenue", 0)}
- Monthly Revenue: ₹{revenue.get("monthRevenue", 0)}

Profit:
- Net Profit: ₹{profit.get("netProfit", 0)}
- Profit Margin: {profit.get("profitMargin", 0)}%

Orders:
- Total Orders: {orders.get("totalOrders", 0)}
- Completed Orders: {orders.get("completed", 0)}

Customers:
- Total Customers: {customers.get("totalCustomers", 0)}
- Top Customer: {customers.get("topCustomer")}
""")

        else:

            sections.append(str(tool_data))

    return "\n".join(sections)