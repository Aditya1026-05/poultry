"""
Shared timing context for measuring Gemini API call durations.

Uses contextvars so each async request gets its own isolated timer,
even under concurrent load.
"""

import contextvars

# Accumulated Gemini API call time in milliseconds for the current request
_gemini_time_ms: contextvars.ContextVar[float] = contextvars.ContextVar(
    "gemini_time_ms", default=0.0
)


def reset_gemini_timer() -> None:
    """Reset the Gemini timer at the start of a new request."""
    _gemini_time_ms.set(0.0)


def add_gemini_time(ms: float) -> None:
    """Add elapsed milliseconds from a Gemini API call."""
    current = _gemini_time_ms.get()
    _gemini_time_ms.set(current + ms)


def get_gemini_time() -> float:
    """Return total accumulated Gemini API time in ms for this request."""
    return _gemini_time_ms.get()
