#!/usr/bin/env python3
"""
Simple script to add slug column to products table
"""
import asyncio
import asyncpg
from slugify import slugify

async def add_slug_column():
    # Database connection
    conn = await asyncpg.connect("postgresql://postgres:password@localhost:5432/zorel_leather")
    
    try:
        # Add slug column if it doesn't exist
        print("Adding slug column...")
        await conn.execute("""
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
        """)
        
        # Create unique index
        print("Creating unique index...")
        await conn.execute("""
            CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug 
            ON products(slug);
        """)
        
        # Get all products without slugs
        print("Getting products without slugs...")
        products = await conn.fetch("""
            SELECT id, name FROM products WHERE slug IS NULL;
        """)
        
        # Update products with slugs
        print(f"Updating {len(products)} products with slugs...")
        for product in products:
            slug = slugify(product['name'])
            await conn.execute("""
                UPDATE products SET slug = $1 WHERE id = $2;
            """, slug, product['id'])
            print(f"  - {product['name']} -> {slug}")
        
        print("✅ Successfully added slug column and populated slugs!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(add_slug_column())
