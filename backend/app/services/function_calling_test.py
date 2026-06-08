from google import genai
from app.config import settings

client = genai.Client(
    api_key=settings.gemini_api_key_1
)

def get_revenue():

    return {
        "totalRevenue": 5400,
        "monthlyRevenue": 1800,
        "completedOrders": 3,
    }


def test_function_calling():

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Show revenue",
        config={
            "tools": [get_revenue]
        }
    )

    print(response)