from app.services.function_registry import (
    FUNCTION_REGISTRY,
)

async def execute_function(function_name: str):

    if function_name not in FUNCTION_REGISTRY:
        raise ValueError(
            f"Unknown function: {function_name}"
        )

    function = FUNCTION_REGISTRY[function_name]

    result = await function()

    return result