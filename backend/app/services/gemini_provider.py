from google import genai
from app.services.intent_router import detect_intent
from app.config import settings
from app.services.ai_provider import AIProvider
from app.services.ai_tools import (
    get_profit_summary,
    get_revenue_summary,
    get_orders_summary,
)
from app.services.prompt_builder import build_business_prompt

class GeminiProvider(AIProvider):

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.gemini_api_key
        )

    async def chat(self, message: str) -> str:

        intent = detect_intent(message)

        # Profit Tool
        if intent == "profit":

            profit_data = await get_profit_summary()

            business_data = f"""
            Total Revenue: ₹{profit_data['totalRevenue']}
            Total Expenses: ₹{profit_data['totalExpenses']}
            Net Profit: ₹{profit_data['netProfit']}
            Profit Margin: {profit_data['profitMargin']}%
            """

            prompt = f"""
            You are Star Poultry's AI Business Assistant.

            Business Data:
            {business_data}

            User Question:
            {message}

            Respond using EXACTLY this structure:

            Profit Summary

            Total Revenue: ₹...
            Total Expenses: ₹...
            Net Profit: ₹...
            Profit Margin: ...%

            Observation:
            (1-2 business insights)

            Do not use markdown.
            Do not omit any metric.
            """

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )

            return response.text

        # Revenue Tool
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

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )

            return response.text

        # Orders Tool
        if intent == "orders":

            orders_data = await get_orders_summary()
            print(orders_data)

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

            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )

            return response.text

        # # Orders Tool
        # if intent == "orders":

        #     orders_data = await get_orders_summary()

        #     return f"""
        # Order Summary

        # Total Orders: {orders_data['totalOrders']}
        # Pending Review: {orders_data['pendingReview']}
        # Confirmed Orders: {orders_data['confirmed']}
        # Delivered Orders: {orders_data['delivered']}
        # Completed Orders: {orders_data['completed']}
        # Rejected Orders: {orders_data['rejected']}
        # Total Trays Ordered: {orders_data['totalTrays']}
        # """

        # Normal Chat
        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=message,
        )

        return response.text