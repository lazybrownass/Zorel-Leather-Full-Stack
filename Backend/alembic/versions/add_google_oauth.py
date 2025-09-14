"""Add Google OAuth support

Revision ID: add_google_oauth
Revises: 
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_google_oauth'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add google_id column to users table
    op.add_column('users', sa.Column('google_id', sa.String(100), nullable=True))
    
    # Create index on google_id for faster lookups
    op.create_index('ix_users_google_id', 'users', ['google_id'], unique=True)
    
    # Make password_hash nullable for OAuth users
    op.alter_column('users', 'password_hash', nullable=True)


def downgrade():
    # Remove the index
    op.drop_index('ix_users_google_id', table_name='users')
    
    # Remove the google_id column
    op.drop_column('users', 'google_id')
    
    # Make password_hash non-nullable again (this might fail if there are OAuth users)
    op.alter_column('users', 'password_hash', nullable=False)
