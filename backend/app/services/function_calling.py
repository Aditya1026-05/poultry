from google.genai import types

BUSINESS_TOOLS = [
    types.FunctionDeclaration(
        name="get_revenue",
        description="""Get revenue statistics including total revenue,
monthly revenue, daily revenue, completed orders,
sales performance, revenue trends and revenue analysis."""
    ),
    types.FunctionDeclaration(
        name="get_profit",
        description="""
Get revenue statistics including total revenue,
monthly revenue, daily revenue, completed orders,
sales performance, revenue trends and revenue analysis.
"""
    ),
    types.FunctionDeclaration(
        name="get_orders",
        description="""Get order statistics including total orders,
completed orders, delivered orders, pending orders,
rejected orders, total trays sold, order performance
and operational analysis."""
    ),
    types.FunctionDeclaration(
        name="get_expenses",
        description="""
Get overall expense statistics including
total expenses,
expense record count,
total business spending,
and expense summaries.
"""
    ),
    types.FunctionDeclaration(
        name="get_expense_categories",
        description="""
    Get expense category breakdown,
    largest expense category,
    category spending totals,
    expense analysis and spending patterns.
    """
    ),
    types.FunctionDeclaration(
        name="get_customers",
        description="""
Get customer statistics including top customers,
highest revenue customer, customer rankings,
customer performance, customer purchase history,
customer contribution and customer analysis.
"""
    ),
    types.FunctionDeclaration(
        name="get_customer_details",
        description="""
    Get detailed information about a specific customer,
    customer history,
    customer revenue,
    last order date,
    last delivery date,
    customer orders,
    customer purchases,
    and customer performance.
    """,
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "customer_name": types.Schema(
                    type=types.Type.STRING,
                    description="Business name of the customer"
                )
            },
            required=["customer_name"]
        )
    ),
    types.FunctionDeclaration(
        name="get_overview",
        description="""
Get complete business overview and business analysis
covering revenue, profit, expenses, customers,
orders, business performance, key insights,
recommendations and areas needing attention.
"""
    ),
    types.FunctionDeclaration(
            name="get_orders_between_dates",
            description="""
        Get orders, revenue and trays sold
        between two dates.
        Use for date range analysis,
        weekly reports,
        monthly reports,
        and custom date reports.
        """,
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "start_date": types.Schema(
                        type=types.Type.STRING,
                        description="Start date YYYY-MM-DD"
                    ),
                    "end_date": types.Schema(
                        type=types.Type.STRING,
                        description="End date YYYY-MM-DD"
                    )
                },
                required=[
                    "start_date",
                    "end_date"
                ]
            )
        ),
]