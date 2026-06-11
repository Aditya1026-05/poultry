# app/services/conversation_state.py

conversation_state = {
    "customer": None,
    "date_range": None,
    "last_function": None,

    # Universal Follow-Up Memory
    "last_question": None,
    "last_tool": None,
    "last_data": None,
    "last_context": None,
}


# ----------------------------
# Customer Memory
# ----------------------------

def set_customer(customer_name: str):

    conversation_state["customer"] = customer_name


def get_customer():

    return conversation_state["customer"]


# ----------------------------
# Date Range Memory
# ----------------------------

def set_date_range(
    start_date,
    end_date,
):

    conversation_state["date_range"] = {
        "start": start_date,
        "end": end_date,
    }


def get_date_range():

    return conversation_state["date_range"]


# ----------------------------
# Function Memory
# ----------------------------

def set_last_function(
    function_name,
):

    conversation_state["last_function"] = (
        function_name
    )


def get_last_function():

    return conversation_state[
        "last_function"
    ]


# ----------------------------
# Universal Follow-Up Memory
# ----------------------------

def save_context(
    question: str,
    tool,
    data,
    context_text=None,
):

    conversation_state[
        "last_question"
    ] = question

    conversation_state[
        "last_tool"
    ] = tool

    conversation_state[
        "last_data"
    ] = data

    conversation_state[
        "last_context"
    ] = context_text


def get_context():

    return {
        "question":
            conversation_state[
                "last_question"
            ],

        "tool":
            conversation_state[
                "last_tool"
            ],

        "data":
            conversation_state[
                "last_data"
            ],

        "context":
            conversation_state[
                "last_context"
            ],
    }


def clear_context():

    conversation_state[
        "last_question"
    ] = None

    conversation_state[
        "last_tool"
    ] = None

    conversation_state[
        "last_data"
    ] = None

    conversation_state[
        "last_context"
    ] = None