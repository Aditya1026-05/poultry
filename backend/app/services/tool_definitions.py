from google.genai import types

BUSINESS_TOOLS = [
    types.FunctionDeclaration(
        name="get_revenue",
        description="Get revenue statistics"
    ),

    types.FunctionDeclaration(
        name="get_profit",
        description="Get profit statistics"
    ),

    types.FunctionDeclaration(
        name="get_orders",
        description="Get order statistics"
    ),

    types.FunctionDeclaration(
        name="get_expenses",
        description="Get expense statistics"
    ),

    types.FunctionDeclaration(
        name="get_customers",
        description="Get customer statistics"
    ),

    types.FunctionDeclaration(
        name="get_overview",
        description="Get complete business overview"
    ),
]