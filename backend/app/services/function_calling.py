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
        name="get_overview",
        description="""
Get complete business overview and business analysis
covering revenue, profit, expenses, customers,
orders, business performance, key insights,
recommendations and areas needing attention.
"""
    ),
    
]