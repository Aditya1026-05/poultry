from google import genai
from google.genai import types

from app.config import settings
from app.services.function_calling import BUSINESS_TOOLS
from app.services.function_executor import execute_function
from app.services.context_builder import build_context
from app.services.conversation_state import (
    get_context,
)
from app.services.gemini_helper import safe_generate
from app.services.fallback_responses import (
    build_fallback_response,
)

from app.services.multi_fallback_response import (
    build_multi_fallback_response,
)

from app.services.conversation_state import (
    set_customer,
    set_date_range,
    set_last_function,
)

from app.services.followup_resolver import (
    resolve_followup,
)

from app.services.conversation_state import (
    save_context,
)

clients = []

from datetime import datetime



today = datetime.now().date().isoformat()

if settings.gemini_api_key_1:
    clients.append(
        genai.Client(
            api_key=settings.gemini_api_key_1
        )
    )

if settings.gemini_api_key_2:
    clients.append(
        genai.Client(
            api_key=settings.gemini_api_key_2
        )
    )

if settings.gemini_api_key_3:
    clients.append(
        genai.Client(
            api_key=settings.gemini_api_key_3
        )
    )

tool = types.Tool(
    function_declarations=BUSINESS_TOOLS
)


async def gemini_function_agent(message: str):

    message = resolve_followup(message)

    print(
        "Resolved Message:",
        message
    )

    previous_context = get_context()

    print("PREVIOUS CONTEXT:")
    print(previous_context)

    context_section = ""

    if previous_context and previous_context.get("question"):

        context_section = f"""
    Previous User Question:
    {previous_context.get("question")}

    Previous Tool:
    {previous_context.get("tool")}

    Previous Business Context:
    {previous_context.get("context", "")}
    """

    last_error = None

    for index, client in enumerate(clients):

        try:

            print(
                f"Function Agent Key #{index + 1}"
            )

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f"""
                You are Star Poultry's AI Business Assistant.

                Today's Date:
                {today}

                Date Handling Rules:

                - When the user mentions only month names (May, June, July, etc.), assume the CURRENT YEAR from Today's Date.
                - Never assume previous years unless the user explicitly mentions a year.
                - Convert natural language dates into exact YYYY-MM-DD dates before calling functions.

                Examples:

                User: Revenue between May and June
                start_date = "2026-05-01"
                end_date = "2026-06-30"

                User: Orders between June and July
                start_date = "2026-06-01"
                end_date = "2026-07-31"

                Available business functions contain:
                - revenue information
                - profit information
                - order information
                - customer information
                - expense information
                - date range analytics

                Always call functions whenever business data is required.


                Follow-Up Rules:

                If Previous Conversation Context is provided,
                use it to understand follow-up questions.

                Examples:

                Previous:
                Who are my VIP customers?

                Current:
                Why?

                Use the customer information from previous context.

                Previous:
                Show dormant customers.

                Current:
                How long inactive?

                Use dormant customer information from previous context.

                Previous:
                How healthy is my business?

                Current:
                How can I improve it?

                Use business health information from previous context.

                Previous:
                Compare June and May.

                Current:
                What caused the increase?

                Use the comparison context from the previous conversation.

                Rules:

                - If the user mentions a customer name, use get_customer_details.
                - If multiple customer names are mentioned, call get_customer_details for EACH customer.
                - For customer comparisons, ALWAYS fetch data for all mentioned customers before answering.

                - Use get_customer_details for:
                    * customer summaries
                    * customer revenue
                    * customer trays
                    * customer delivery information
                    * customer statistics

                - Use get_order_records for:
                    * show orders
                    * order history
                    * recent orders
                    * list orders
                    * customer order history
                    * completed orders
                    * pending orders
                    * delivered orders
                    * orders between dates
                    * detailed order information

                - Prefer get_order_records over summary functions whenever the user asks to SHOW, LIST, DISPLAY, or VIEW orders.

                Examples:

                            User: Which customer bought the most trays?
                            Use get_customers

                            User: Who generated the most revenue?
                            Use get_customers

                            User: Tell me about Fresh Shop
                            Use get_customer_details

                            User: Compare B1 and B2
                            Use get_customer_details for BOTH customers

                            User: Show B2 order history
                            Use get_order_history

                            User: Revenue between May and June
                            Use get_orders_between_dates

                            User: Why is my profit negative?
                            Use get_overview

                - For month names like May, June, July, assume the current year unless specified.
                - Do not guess dates.
                - Prefer function calls over text answers.

                Additional Important Follow-Up Rule:

                    If the Previous Business Context already contains
                    the information needed to answer the current question:

                    - Do NOT call another function.
                    - Use the previous context directly.
                    - Answer using the stored business data.

                    Examples:

                    Previous:
                    Compare May and June

                    Current:
                    Why did June outperform May?

                    Answer using the stored comparison data.

                    Do NOT call get_overview.

                    Previous:
                    Who are my VIP customers?

                    Current:
                    What revenue do they generate?

                    Answer using the stored customer data.

                    Do NOT call another function.

                    Previous:
                    Show dormant customers.

                    Current:
                    How can I reactivate them?

                    Answer using the stored dormant customer analysis.

                    Do NOT call another function.

                    Only call functions if required data is missing.

                Business Health Rules:

                Use get_business_health whenever the user asks for:

                - business health
                - business performance
                - business analysis
                - profitability analysis
                - strengths
                - weaknesses
                - issues
                - recommendations
                - focus areas
                - improvement opportunities
                - growth suggestions
                - areas needing attention

                Examples:

                How healthy is my business?
                What needs attention?
                What is hurting profitability?
                Why am I losing money?
                What should I focus on?
                How can I improve profit?
                Give me business recommendations.
                Analyze my business.
                What are my strengths and weaknesses?


                Revenue Trend Rules:

                Use get_revenue_trends when the user asks:

                - Is revenue growing?
                - Revenue trend
                - Compare this month vs last month
                - Which month performed best?
                - Revenue growth
                - Is business improving?
                - Growth analysis
                - Revenue analysis  

                Date Range Analytics Rules:

                    Use get_orders_between_dates when the user asks:

                    - Revenue between dates
                    - Orders between dates
                    - Trays between dates
                    - Sales between dates
                    - Compare specific months
                    - Compare two months
                    - Compare May and June
                    - Compare June and July
                    - Compare January and February
                    - Revenue in a specific month
                    - Orders in a specific month
                    - Trays sold in a specific month

                    Examples:

                    User: Compare May and June
                    Use get_orders_between_dates for BOTH months.

                    User: Revenue in May
                    Use get_orders_between_dates.

                    User: Orders between June 1 and June 30
                    Use get_orders_between_dates.

                    User: How many trays were sold in May?
                    Use get_orders_between_dates.

                    User: Compare May and June orders
                    Use get_orders_between_dates for BOTH months.

                    User: Compare May and June trays
                    Use get_orders_between_dates for BOTH months.

                    Important:
                    When comparing months, fetch data for EACH month separately before answering.


                    Customer Date Analytics Rules:

                    Use get_order_records when the user asks:

                    - Revenue generated by a customer in a specific month
                    - Revenue generated by a customer in a date range
                    - Trays purchased by a customer in a specific month
                    - Orders placed by a customer in a date range
                    - Top customer in a specific month
                    - Customer performance in a specific month
                    - Which customer generated the most revenue in June?
                    - Which customer bought the most trays in May?

                    Examples:

                    User:
                    How much revenue did B2 generate in June?

                    Use:
                    get_order_records(
                        customer_name="B2",
                        start_date=<June Start>,
                        end_date=<June End>
                    )

                    User:
                    How many trays did B1 buy in May?

                    Use:
                    get_order_records(
                        customer_name="B1",
                        start_date=<May Start>,
                        end_date=<May End>
                    )

                    User:
                    Which customer generated the most revenue in June?

                    Use:
                    get_order_records(
                        start_date=<June Start>,
                        end_date=<June End>
                    )

                    Then analyze the returned records and rank customers.

                    Important:
                    Do NOT use get_customer_rankings for month-specific questions.
                    get_customer_rankings represents overall rankings across all available data.


                Customer Intelligence Rules:

                    Use get_customer_rankings when the user asks:

                    - VIP customers
                    - Top customers
                    - Rank customers
                    - Customer rankings
                    - Best customers
                    - Most valuable customers
                    - Customer leaderboard
                    - Who buys the most trays?

                Dormant Customer Rules:

                Use get_dormant_customers when the user asks:

                - Dormant customers
                - Inactive customers
                - Lost customers
                - Customers who stopped ordering
                - Customers needing follow up
                - Customer retention risk
                - Customers at risk
                - Who has not ordered recently
                - Which customers are inactive
                - Which customers stopped buying
                - Show dormant customers
                - Show inactive customers
                - Customers not ordering anymore
                - Customers we may lose
                - Which customers should I contact
                - Which customers need attention

                This function identifies customers that have not placed orders
                within the inactivity threshold and may require follow up.

                Customer Segmentation Rules:

                Use get_customer_segments when the user asks:

                - Segment my customers
                - Customer segmentation
                - Customer categories
                - Customer groups
                - VIP customers
                - Regular customers
                - Low activity customers
                - Classify customers
                - Show customer segments
                - Which customers should I focus on?
                - Customer portfolio analysis
                - High value customers
                - Valuable customers

                Previous Conversation Context:

                {context_section}

                Current User Question:

                {message}
                """,
            
                config=types.GenerateContentConfig(
                    tools=[tool]
                )
            )
            print("RAW RESPONSE:")
            print(response.text)

            break

        except Exception as e:

            print(
                f"Function Agent Key #{index + 1} Failed:",
                str(e)
            )

            last_error = e

    else:
        raise last_error

    print("FUNCTION CALLS:")
    print(response.function_calls)

    if not response.function_calls:

        fallback_prompt = f"""
    Previous Conversation Context:

    {context_section}

    Current User Question:

    {message}

    Answer naturally using the previous context if relevant.
    """

        return safe_generate(fallback_prompt)

    data = {}

    for function_call in response.function_calls:

        function_name = function_call.name

        arguments = dict(
            function_call.args
        )

        set_last_function(function_name)

        if "customer_name" in arguments:

            set_customer(
                arguments["customer_name"]
            )

            if (
                "start_date" in arguments
                and
                "end_date" in arguments
            ):

                set_date_range(
                    arguments["start_date"],
                    arguments["end_date"]
    )

        print(
            "Function Chosen:",
            function_name
        )

        print(
            "Arguments:",
            arguments
        )

        result = await execute_function(
            function_name,
            **arguments
        )

        if function_name in data:

            if not isinstance(
                data[function_name],
                list
            ):
                data[function_name] = [
                    data[function_name]
                ]

            data[function_name].append(result)

        else:
            data[function_name] = result

    context = build_context(data)
    save_context(
    question=message,
    tool=list(data.keys()),
    data=data,
    context_text=context,
    )
    print("DATA:")
    print(data) 
    print("FINAL CONTEXT:")
    print(context)

    if "create_expense_draft" in data:
        import json
        draft_res = data["create_expense_draft"]
        if draft_res.get("success") and "draft" in draft_res:
            draft_obj = draft_res["draft"]
            if "warning" in draft_res:
                draft_obj["warning"] = draft_res["warning"]
            return json.dumps(draft_obj)

    prompt = f"""
You are Star Poultry's Senior Business Analyst.

Business Context:

{context}

Question:

{message}

Answer using only the provided data.
"""

    response = safe_generate(prompt)

    if "AI Service Temporarily Unavailable" in response:

        print(
            "Using Multi Function Fallback"
        )

        return build_multi_fallback_response(
            data
        )

    return response