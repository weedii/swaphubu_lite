"""
Margin Setting model for the crypto exchange platform.
Configures trading margins for different currency pairs.
"""

from sqlalchemy import Column, String, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
import uuid

from ..db.base import Base
from ..utils import auto_updated, crud_enabled


@crud_enabled
@auto_updated
class MarginSetting(Base):
    """
    Margin Setting model for exchange rate configuration.

    Stores margin percentages for different currency pairs used in
    crypto exchange calculations. Updated frequently by admin users
    to adjust trading margins based on market conditions.
    """

    __tablename__ = "margin_settings"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Currency pair configuration
    from_currency = Column(String, nullable=False, index=True)
    to_currency = Column(String, nullable=False, index=True)

    # Margin configuration
    margin_percent = Column(DECIMAL(precision=5, scale=2), nullable=False)

    # Note: created_at and updated_at are automatically added by @auto_updated
    # Uses enhanced timestamp tracking with automatic updated_at on any field change
    # Note: CRUD operations added by @crud_enabled decorator:
    #       - MarginSetting.create(), get_by_id(), get_all(), get_paginated(), etc.

    def __repr__(self):
        return f"<MarginSetting(id={self.id}, {self.from_currency}->{self.to_currency}, margin={self.margin_percent}%)>"
