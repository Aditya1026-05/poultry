# app/services/conversation_state.py

conversation_state = {
    "customer": None,
    "date_range": None,
    "last_function": None,
}

def set_customer(customer_name: str):

    conversation_state["customer"] = customer_name


def get_customer():

    return conversation_state["customer"]


def set_date_range(start_date, end_date):

    conversation_state["date_range"] = {
        "start": start_date,
        "end": end_date,
    }


def get_date_range():

    return conversation_state["date_range"]


def set_last_function(function_name):

    conversation_state["last_function"] = function_name


def get_last_function():

    return conversation_state["last_function"]