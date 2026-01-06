"""add_is_blocked_column_to_users

Revision ID: 68761158c19f
Revises: 5bd68f00c269
Create Date: 2025-07-23 00:01:54.390010

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '68761158c19f'
down_revision: Union[str, None] = 'cca3cd6a5d9e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add is_blocked column to users table
    op.add_column('users', sa.Column('is_blocked', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove is_blocked column from users table
    op.drop_column('users', 'is_blocked')
