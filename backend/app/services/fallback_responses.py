def build_fallback_response(
    function_name: str,
    data: dict,
):

    if function_name == "get_revenue":

        return f"""
Revenue Summary

Total Revenue: ₹{data['totalRevenue']}
Monthly Revenue: ₹{data['monthRevenue']}
Today's Revenue: ₹{data['todayRevenue']}
Completed Orders: {data['completedOrders']}
"""

    if function_name == "get_profit":

        return f"""
Profit Summary

Revenue: ₹{data['totalRevenue']}
Expenses: ₹{data['totalExpenses']}
Net Profit: ₹{data['netProfit']}
Profit Margin: {data['profitMargin']}%
"""

    if function_name == "get_orders":

        return f"""
Orders Summary

Total Orders: {data['totalOrders']}
Completed Orders: {data['completed']}
Rejected Orders: {data['rejected']}
Total Trays: {data['totalTrays']}
"""

    if function_name == "get_customers":

        return f"""
Customer Summary

Top Customer: {data['topCustomer']}
Top Revenue: ₹{data['topRevenue']}
Total Customers: {data['totalCustomers']}
"""

    if function_name == "get_expenses":

        return f"""
    Expense Summary

    Total Expenses: ₹{data['totalExpenses']}
    Expense Records: {data['expenseRecords']}
    """

    if function_name == "get_overview":

        return f"""
    Business Overview

    Total Revenue: ₹{data['revenue']['totalRevenue']}
    Net Profit: ₹{data['profit']['netProfit']}
    Total Orders: {data['orders']['totalOrders']}
    Total Customers: {data['customers']['totalCustomers']}
    Top Customer: {data['customers']['topCustomer']}
    """

    return "Data retrieved successfully."

