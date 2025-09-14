#!/usr/bin/env python3
"""
Quick setup script for PostgreSQL backend
"""
import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and return success status"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} completed successfully")
            return True
        else:
            print(f"❌ {description} failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ {description} failed with exception: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 ZOREL LEATHER Backend Quick Setup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("requirements.txt"):
        print("❌ Please run this script from the Backend directory")
        return False
    
    # Install Python dependencies
    if not run_command("pip install -r requirements.txt", "Installing Python dependencies"):
        print("⚠️  Failed to install dependencies. Please install manually:")
        print("   pip install -r requirements.txt")
        return False
    
    # Test basic imports
    print("\n🔄 Testing basic imports...")
    try:
        import asyncpg
        import sqlalchemy
        import alembic
        print("✅ All required packages imported successfully")
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        print("Please install missing packages manually")
        return False
    
    # Test database connection
    print("\n🔄 Testing database connection...")
    try:
        import asyncio
        sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))
        
        async def test_connection():
            from app.core.postgresql import engine
            async with engine.begin() as conn:
                result = await conn.execute("SELECT 1 as test")
                row = result.fetchone()
                return row and row[0] == 1
        
        if asyncio.run(test_connection()):
            print("✅ Database connection successful")
        else:
            print("❌ Database connection failed")
            print("Please ensure PostgreSQL is running and configured correctly")
            return False
            
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        print("Please check your PostgreSQL setup")
        return False
    
    print("\n🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Run: python test_simple_postgresql.py")
    print("2. Run: python verify_backend.py")
    print("3. Run: python main.py")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
