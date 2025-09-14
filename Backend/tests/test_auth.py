import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.sqlalchemy_models import User, UserRole
from app.core.security import get_password_hash

client = TestClient(app)


@pytest.fixture
def test_user_data():
    return {
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpassword123",
        "phone": "+1234567890"
    }


@pytest.fixture
def admin_user_data():
    return {
        "name": "Admin User",
        "email": "admin@example.com",
        "password": "adminpassword123",
        "role": UserRole.ADMIN
    }


def test_user_registration(test_user_data):
    """Test user registration"""
    response = client.post("/api/v1/auth/register", json=test_user_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["name"] == test_user_data["name"]
    assert data["email"] == test_user_data["email"]
    assert data["role"] == "customer"
    assert "id" in data


def test_user_registration_duplicate_email(test_user_data):
    """Test registration with duplicate email"""
    # First registration
    client.post("/api/v1/auth/register", json=test_user_data)
    
    # Second registration with same email
    response = client.post("/api/v1/auth/register", json=test_user_data)
    assert response.status_code == 409


def test_user_login(test_user_data):
    """Test user login"""
    # Register user first
    client.post("/api/v1/auth/register", json=test_user_data)
    
    # Login
    login_data = {
        "email": test_user_data["email"],
        "password": test_user_data["password"]
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_user_login_invalid_credentials():
    """Test login with invalid credentials"""
    login_data = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401


def test_get_current_user(test_user_data):
    """Test getting current user info"""
    # Register and login
    client.post("/api/v1/auth/register", json=test_user_data)
    login_response = client.post("/api/v1/auth/login", json={
        "email": test_user_data["email"],
        "password": test_user_data["password"]
    })
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 200
    
    data = response.json()
    assert data["email"] == test_user_data["email"]
    assert data["name"] == test_user_data["name"]


def test_get_current_user_no_token():
    """Test getting current user without token"""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 403


def test_logout():
    """Test user logout"""
    response = client.post("/api/v1/auth/logout")
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully logged out"
