from google import genai

from app.config import settings
from app.services.ai_provider import AIProvider
from app.services.intent_router import (
    detect_intent,
    wants_expense_categories,
)
from app.services.ai_tools import (
    get_profit_summary,
    get_revenue_summary,
    get_orders_summary,
    get_expenses_summary,
    get_expense_category_summary,
    get_customer_summary,
    get_complete_business_report,
)
from app.services.prompt_builder import build_business_prompt
from app.services.tool_router import determine_tools
from app.services.gemini_helper import safe_generate
from app.services.tool_executor import execute_tools

class GeminiProvider(AIProvider):

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.gemini_api_key
        )

    async def chat(self, message: str) -> str:

        # try:

        #     tools = await determine_tools(message)

        #     print("AI Router Result:", tools)

        # except Exception as e:

        #     print("AI Router Failed:", str(e))

        #     tools = []

        intent = detect_intent(message)
        
        # print("Detected Intent:", intent)

        # try:

        #     tools = await determine_tools(message)

        #     print("AI Router Result:", tools)

        #     data = await execute_tools(tools)

        #     print(data)

        # except Exception as e:

        #     print("AI Router Failed:", str(e))

        # =====================
        # PROFIT TOOL
        # =====================
        if intent == "profit":

            profit_data = await get_profit_summary()

            business_data = f"""
            Total Revenue: ₹{profit_data['totalRevenue']}
            Total Expenses: ₹{profit_data['totalExpenses']}
            Net Profit: ₹{profit_data['netProfit']}
            Profit Margin: {profit_data['profitMargin']}%
            """

            prompt = build_business_prompt(
                business_data,
                message,
            )

            return safe_generate(prompt)

            # response = self.client.models.generate_content(
            #     model="gemini-2.5-flash",
            #     contents=prompt,
            # )

            # return response.text

        # =====================
        # REVENUE TOOL
        # =====================
        if intent == "revenue":

            revenue_data = await get_revenue_summary()

            business_data = f"""
            Today's Revenue: ₹{revenue_data['todayRevenue']}
            Monthly Revenue: ₹{revenue_data['monthRevenue']}
            Total Revenue: ₹{revenue_data['totalRevenue']}
            Completed Orders: {revenue_data['completedOrders']}
            """

            prompt = build_business_prompt(
                business_data,
                message,
            )

            return safe_generate(prompt)

            # response = self.client.models.generate_content(
            #     model="gemini-2.5-flash",
            #     contents=prompt,
            # )

            # return response.text

        # =====================
        # ORDERS TOOL
        # =====================
        if intent == "orders":

            orders_data = await get_orders_summary()

            business_data = f"""
            Total Orders: {orders_data['totalOrders']}
            Pending Review: {orders_data['pendingReview']}
            Confirmed Orders: {orders_data['confirmed']}
            Delivered Orders: {orders_data['delivered']}
            Completed Orders: {orders_data['completed']}
            Rejected Orders: {orders_data['rejected']}
            Total Trays Ordered: {orders_data['totalTrays']}
            """

            

            prompt = build_business_prompt(
                business_data,
                message,
            )

            return safe_generate(prompt)

            # response = self.client.models.generate_content(
            #     model="gemini-2.5-flash",
            #     contents=prompt,
            # )

            # return response.text

        # =====================
        # =====================
        # EXPENSES TOOL
        # =====================
        if intent == "expenses":

            if wants_expense_categories(message):

                category_data = await get_expense_category_summary()

                business_data = f"""
        Largest Expense Category: {category_data['largestCategory']}
        Largest Expense Amount: ₹{category_data['largestAmount']}

        Expense Categories:

        {category_data['categories']}
        """

            else:

                expense_data = await get_expenses_summary()

                business_data = f"""
        Total Expenses: ₹{expense_data['totalExpenses']}
        Expense Records: {expense_data['expenseRecords']}
        """

            prompt = build_business_prompt(
                business_data,
                message,
            )

            return safe_generate(prompt)

            # response = self.client.models.generate_content(
            #     model="gemini-2.5-flash",
            #     contents=prompt,
            # )

            # return response.text

        # =====================
        # CUSTOMERS TOOL
        # =====================
        if intent == "customers":

            customer_data = await get_customer_summary()

            business_data = f"""
        Top Customer: {customer_data['topCustomer']}
        Top Customer Revenue: ₹{customer_data['topRevenue']}
        Total Customers: {customer_data['totalCustomers']}

        Customer Details:

        {customer_data['customers']}
        """

            prompt = build_business_prompt(
                business_data,
                message,
            )

            return safe_generate(prompt)

            # response = self.client.models.generate_content(
            #     model="gemini-2.5-flash",
            #     contents=prompt,
            # )

            # return response.text

        # =====================
        # BUSINESS OVERVIEW
        # =====================
        if intent == "overview":

            revenue = await get_revenue_summary()
            profit = await get_profit_summary()
            orders = await get_orders_summary()
            customers = await get_customer_summary()

            business_data = f"""
        Today's Revenue: ₹{revenue['todayRevenue']}
        Monthly Revenue: ₹{revenue['monthRevenue']}
        Total Revenue: ₹{revenue['totalRevenue']}

        Total Expenses: ₹{profit['totalExpenses']}
        Net Profit: ₹{profit['netProfit']}
        Profit Margin: {profit['profitMargin']}%

        Total Orders: {orders['totalOrders']}
        Completed Orders: {orders['completed']}

        Total Customers: {customers['totalCustomers']}
        Top Customer: {customers['topCustomer']}
        Top Customer Revenue: ₹{customers['topRevenue']}
        """

            prompt = build_business_prompt(
                business_data,
                message,
            )

            return safe_generate(prompt)

            # response = self.client.models.generate_content(
            #     model="gemini-2.5-flash",
            #     contents=prompt,
            # )

            # return response.text
        # =====================
        # COMPLETE BUSINESS REPORT
        # =====================
        if intent == "report":

            report_data = await get_complete_business_report()

            business_data = f"""
        Revenue Data:
        {report_data['revenue']}

        Profit Data:
        {report_data['profit']}

        Expense Data:
        {report_data['expenses']}

        Orders Data:
        {report_data['orders']}

        Customer Data:
        {report_data['customers']}
        """

            prompt = f"""
        You are Star Poultry's AI Business Analyst.

        Business Data:

        {business_data}

        User Question:

        {message}

        Generate a professional business report.

        Use Markdown.

        Structure:

        # Business Report

        ## Financial Summary

        Include:
        - Revenue
        - Expenses
        - Profit

        ## Operations Summary

        Include:
        - Orders
        - Completed Orders
        - Total Trays

        ## Customer Summary

        Include:
        - Total Customers
        - Top Customer
        - Customer Performance

        ## Key Insights

        Provide 3 insights.

        ## Recommendations

        Provide 3 recommendations.

        Rules:
        - Do not invent numbers.
        - Only use provided data.
        - Be concise and professional.
        """

            return safe_generate(prompt)

        # =====================
        # BUSINESS ANALYSIS
        # =====================
        if intent == "analysis":

            try:

                tools = await determine_tools(message)

                print("Analysis Tools:", tools)

                data = await execute_tools(tools)

                print("Analysis Data:", data)

                prompt = f"""
        You are Star Poultry's Business Analyst.

        Business Data:

        {data}

        User Question:

        {message}

        Analyze the business data and answer the user's question.

        Provide:

        # Findings

        # Insights

        # Recommendations

        Rules:
        - Use only the provided business data.
        - Do not invent numbers.
        - Be concise and practical.
        - Focus on improving the business.
        """

                return safe_generate(prompt)

            except Exception as e:

                print("Analysis Error:", str(e))

                return """
        # Analysis Unavailable

        Business analysis is temporarily unavailable.

        Please try again in a few minutes.
        """


        # Normal Chat
        

        return safe_generate(message)

        