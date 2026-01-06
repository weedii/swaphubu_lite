"""Consolidated role refactoring: remove moderator, replace role enum with is_admin boolean, make country nullable

Revision ID: 3287604106fd
Revises: 68761158c19f
Create Date: 2025-07-28 21:30:35.353006

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "3287604106fd"
down_revision: Union[str, None] = "68761158c19f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### Step 1: Remove MODERATOR role from enums and convert to ADMIN ###

    # First, update any existing moderator users to admin role
    op.execute("UPDATE users SET role = 'ADMIN' WHERE role = 'MODERATOR'")

    # Update any existing moderator ticket messages to admin role
    op.execute(
        "UPDATE ticket_messages SET sender_role = 'ADMIN' WHERE sender_role = 'MODERATOR'"
    )

    # Drop and recreate the userrole enum without MODERATOR
    op.execute("ALTER TYPE userrole RENAME TO userrole_old")
    op.execute("CREATE TYPE userrole AS ENUM ('ADMIN', 'USER')")
    op.execute(
        "ALTER TABLE users ALTER COLUMN role TYPE userrole USING role::text::userrole"
    )
    op.execute("DROP TYPE userrole_old")

    # Drop and recreate the senderrole enum without MODERATOR
    op.execute("ALTER TYPE senderrole RENAME TO senderrole_old")
    op.execute("CREATE TYPE senderrole AS ENUM ('ADMIN', 'USER')")
    op.execute(
        "ALTER TABLE ticket_messages ALTER COLUMN sender_role TYPE senderrole USING sender_role::text::senderrole"
    )
    op.execute("DROP TYPE senderrole_old")

    # ### Step 2: Replace role enum with is_admin boolean ###

    # Add the new is_admin column with default False
    op.add_column(
        "users",
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default="false"),
    )

    # Convert existing role data to is_admin boolean
    op.execute("UPDATE users SET is_admin = true WHERE role = 'ADMIN'")
    op.execute("UPDATE users SET is_admin = false WHERE role = 'USER'")

    # Drop the old role column
    op.drop_column("users", "role")

    # ### Step 3: Make country column nullable for admin users ###

    op.alter_column(
        "users", "country", existing_type=sa.VARCHAR(length=2), nullable=True
    )


def downgrade() -> None:
    """Downgrade schema."""
    # ### Step 3 Rollback: Make country column non-nullable ###

    op.alter_column(
        "users", "country", existing_type=sa.VARCHAR(length=2), nullable=False
    )

    # ### Step 2 Rollback: Replace is_admin boolean with role enum ###

    # Add back the role column
    op.add_column(
        "users",
        sa.Column(
            "role",
            postgresql.ENUM("ADMIN", "USER", name="userrole"),
            autoincrement=False,
            nullable=False,
            server_default="USER",
        ),
    )

    # Convert is_admin back to role enum
    op.execute("UPDATE users SET role = 'ADMIN' WHERE is_admin = true")
    op.execute("UPDATE users SET role = 'USER' WHERE is_admin = false")

    # Drop the is_admin column
    op.drop_column("users", "is_admin")

    # ### Step 1 Rollback: Recreate enums with MODERATOR ###

    # Recreate the enums with MODERATOR
    op.execute("ALTER TYPE userrole RENAME TO userrole_old")
    op.execute("CREATE TYPE userrole AS ENUM ('ADMIN', 'MODERATOR', 'USER')")
    op.execute(
        "ALTER TABLE users ALTER COLUMN role TYPE userrole USING role::text::userrole"
    )
    op.execute("DROP TYPE userrole_old")

    op.execute("ALTER TYPE senderrole RENAME TO senderrole_old")
    op.execute("CREATE TYPE senderrole AS ENUM ('ADMIN', 'MODERATOR', 'USER')")
    op.execute(
        "ALTER TABLE ticket_messages ALTER COLUMN sender_role TYPE senderrole USING sender_role::text::senderrole"
    )
    op.execute("DROP TYPE senderrole_old")
