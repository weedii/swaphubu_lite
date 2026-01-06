"""
Schemas module for the crypto exchange platform.
Contains all Pydantic schemas for request/response serialization.
"""

# User schemas
from .user_schemas import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserPasswordChange,
    UserLogin,
    User,
    UserProfile,
    UserList,
    TokenResponse,
)

# Transaction schemas
from .transaction_schemas import (
    TransactionBase,
    TransactionCreate,
    TransactionUpdate,
    Transaction,
    TransactionWithUser,
    TransactionStats,
    TransactionList,
)

# Invoice schemas
from .invoice_schemas import (
    InvoiceBase,
    InvoiceCreate,
    InvoiceUpdate,
    Invoice,
    InvoiceList,
)

# Ticket schemas
from .ticket_schemas import (
    TicketBase,
    TicketCreate,
    TicketUpdate,
    Ticket,
    TicketSummary,
    TicketList,
)

# Ticket Message schemas
from .ticket_message_schemas import (
    TicketMessageBase,
    TicketMessageCreate,
    TicketMessage,
    TicketMessageList,
)

# KYC Verification schemas
from .kyc_schemas import (
    KYCVerification,
    KYCRequest,
    KYCStartResponse,
    KYCStatusResponse,
)

# Payment Method schemas
from .payment_method_schemas import (
    PaymentMethodBase,
    PaymentMethodCreate,
    PaymentMethodUpdate,
    PaymentMethod,
    PaymentMethodList,
)

# Margin Setting schemas
from .margin_setting_schemas import (
    MarginSettingBase,
    MarginSettingCreate,
    MarginSettingUpdate,
    MarginSetting,
    MarginSettingList,
)

__all__ = [
    # User schemas
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserPasswordChange",
    "UserLogin",
    "User",
    "UserProfile",
    "UserList",
    "TokenResponse",
    # Transaction schemas
    "TransactionBase",
    "TransactionCreate",
    "TransactionUpdate",
    "Transaction",
    "TransactionWithUser",
    "TransactionStats",
    "TransactionList",
    # Invoice schemas
    "InvoiceBase",
    "InvoiceCreate",
    "InvoiceUpdate",
    "Invoice",
    "InvoiceList",
    # Ticket schemas
    "TicketBase",
    "TicketCreate",
    "TicketUpdate",
    "Ticket",
    "TicketSummary",
    "TicketList",
    # Ticket Message schemas
    "TicketMessageBase",
    "TicketMessageCreate",
    "TicketMessage",
    "TicketMessageList",
    # KYC Verification schemas
    "KYCVerification",
    "KYCRequest",
    "KYCStartResponse",
    "KYCStatusResponse",
    # Payment Method schemas
    "PaymentMethodBase",
    "PaymentMethodCreate",
    "PaymentMethodUpdate",
    "PaymentMethod",
    "PaymentMethodList",
    # Margin Setting schemas
    "MarginSettingBase",
    "MarginSettingCreate",
    "MarginSettingUpdate",
    "MarginSetting",
    "MarginSettingList",
]
