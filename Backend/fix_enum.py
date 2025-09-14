#!/usr/bin/env python3
"""
Fix database enum values to match the Python enum definitions
"""
import asyncio
import asyncpg
import re
from app.core.config import settings

def convert_sqlalchemy_url_to_asyncpg_url(sqlalchemy_url: str) -> str:
    """Convert SQLAlchemy URL to asyncpg URL"""
    # Remove the +asyncpg part
    url = sqlalchemy_url.replace('postgresql+asyncpg://', 'postgresql://')
    return url

async def fix_database_enums():
    """Fix database enum values to match Python enums"""
    try:
        # Convert SQLAlchemy URL to asyncpg URL
        asyncpg_url = convert_sqlalchemy_url_to_asyncpg_url(settings.DATABASE_URL)

        # Connect to the database
        conn = await asyncpg.connect(asyncpg_url)

        print("🔍 Checking current enum values...")

        # Check what enum values exist for orderstatus
        result = await conn.fetch("""
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = (
                SELECT oid 
                FROM pg_type 
                WHERE typname = 'orderstatus'
            )
            ORDER BY enumsortorder;
        """)
        
        print('Current orderstatus enum values:')
        current_values = [row['enumlabel'] for row in result]
        for value in current_values:
            print(f'  - {value}')

        # Expected values from Python enum
        expected_values = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
        
        # Add missing enum values
        for value in expected_values:
            if value not in current_values:
                print(f"➕ Adding missing enum value: {value}")
                await conn.execute(f"ALTER TYPE orderstatus ADD VALUE '{value}';")

        print("🔍 Checking paymentmethod enum values...")
        
        # Check paymentmethod enum
        result = await conn.fetch("""
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = (
                SELECT oid 
                FROM pg_type 
                WHERE typname = 'paymentmethod'
            )
            ORDER BY enumsortorder;
        """)
        
        current_payment_values = [row['enumlabel'] for row in result]
        print('Current paymentmethod enum values:')
        for value in current_payment_values:
            print(f'  - {value}')

        # Expected payment method values
        expected_payment_values = ['cod', 'online', 'bank_transfer', 'cheque']
        
        # Add missing payment method enum values
        for value in expected_payment_values:
            if value not in current_payment_values:
                print(f"➕ Adding missing payment method enum value: {value}")
                await conn.execute(f"ALTER TYPE paymentmethod ADD VALUE '{value}';")

        print("🔍 Checking paymentstatus enum values...")
        
        # Check paymentstatus enum
        result = await conn.fetch("""
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = (
                SELECT oid 
                FROM pg_type 
                WHERE typname = 'paymentstatus'
            )
            ORDER BY enumsortorder;
        """)
        
        current_payment_status_values = [row['enumlabel'] for row in result]
        print('Current paymentstatus enum values:')
        for value in current_payment_status_values:
            print(f'  - {value}')

        # Expected payment status values
        expected_payment_status_values = ['pending', 'completed', 'failed', 'refunded']
        
        # Add missing payment status enum values
        for value in expected_payment_status_values:
            if value not in current_payment_status_values:
                print(f"➕ Adding missing payment status enum value: {value}")
                await conn.execute(f"ALTER TYPE paymentstatus ADD VALUE '{value}';")

        print("✅ Database enum values updated successfully!")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'conn' in locals() and conn:
            await conn.close()

if __name__ == "__main__":
    asyncio.run(fix_database_enums())
