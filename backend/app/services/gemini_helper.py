from google import genai
import time

from app.config import settings
from app.services.timing import add_gemini_time


clients = []

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


def safe_generate(prompt: str) -> str:

    last_error = None

    for index, client in enumerate(clients):

        try:

            print(f"Trying Gemini Key #{index + 1}")

            t0 = time.perf_counter()

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )

            duration_ms = (time.perf_counter() - t0) * 1000
            add_gemini_time(duration_ms)
            print(f"gemini_call_duration_ms={duration_ms:.1f}")

            return response.text

        except Exception as e:

            print(
                f"Gemini Key #{index + 1} Failed:",
                str(e)
            )

            last_error = e

    print("All Gemini Keys Failed")

    return """
# AI Service Temporarily Unavailable

All configured Gemini API keys are currently unavailable or have exceeded their quota.

Please try again later.
"""