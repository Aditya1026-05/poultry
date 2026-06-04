from typing import Literal

from pydantic import BaseModel, Field


ExpenseCategory = Literal[
    "Feed",
    "Medicine",
    "Electricity",
    "Transport",
    "Labor",
    "Maintenance",
    "Equipment",
    "Miscellaneous",
]


class ExpenseRequest(BaseModel):
    title: str = Field(min_length=1)
    category: ExpenseCategory
    amount: int = Field(ge=0)
    description: str = ""
    expenseDate: str


class ExpenseUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1)
    category: ExpenseCategory | None = None
    amount: int | None = Field(default=None, ge=0)
    description: str | None = None
    expenseDate: str | None = None


class ExpenseResponse(BaseModel):
    id: str
    title: str
    category: ExpenseCategory
    amount: int
    description: str
    expenseDate: str
    createdAt: str
    updatedAt: str
