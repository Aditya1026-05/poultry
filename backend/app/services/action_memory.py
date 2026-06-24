# app/services/action_memory.py

_pending_action = None


def save_pending_action(action: dict):
    """
    Saves a pending draft action to memory.
    """
    global _pending_action
    _pending_action = action


def get_pending_action() -> dict:
    """
    Retrieves the currently stored pending action.
    """
    return _pending_action


def clear_pending_action():
    """
    Clears the pending action from memory.
    """
    global _pending_action
    _pending_action = None
