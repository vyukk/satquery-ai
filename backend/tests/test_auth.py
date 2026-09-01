import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from app.main import app
from app.database import SessionLocal, init_db
from app.models import User
from app.security import get_password_hash, create_access_token


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    """Initialize test database."""
    init_db()
    yield


@pytest.fixture(scope="session")
def db_session():
    """Provide a database session for tests."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session")
def test_user(db_session: Session):
    """Create a test user that persists for the test session."""
    # Check if user already exists
    user = db_session.query(User).filter(User.email == "test@example.com").first()
    if not user:
        user = User(
            id="test-user-123",
            email="test@example.com",
            hashed_password=get_password_hash("testpass123"),
            full_name="Test User",
            is_active=True,
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
    yield user
    # Note: not cleaning up to persist for other tests


@pytest.mark.asyncio
async def test_register():
    """Test user registration."""
    import uuid
    unique_email = f"newuser_{uuid.uuid4().hex[:8]}@example.com"
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/auth/register", json={
            "email": unique_email,
            "password": "password123",
            "full_name": "New User",
        })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == unique_email
    assert data["user"]["full_name"] == "New User"


@pytest.mark.asyncio
async def test_register_duplicate_email():
    """Test registration with duplicate email fails."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # First registration
        await ac.post("/api/auth/register", json={
            "email": "dup@example.com",
            "password": "password123",
        })
        # Second registration with same email
        response = await ac.post("/api/auth/register", json={
            "email": "dup@example.com",
            "password": "password123",
        })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


@pytest.mark.asyncio
async def test_login(test_user):
    """Test user login."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "testpass123",
        })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_login_wrong_password(test_user):
    """Test login with wrong password fails."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword",
        })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(test_user):
    """Test getting current user info."""
    # Use token directly from test_user
    token = create_access_token(data={"sub": test_user.id})

    async with AsyncClient(app=app, base_url="http://test") as ac:
        ac.headers["Authorization"] = f"Bearer {token}"
        response = await ac.get("/api/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"


@pytest.mark.asyncio
async def test_get_me_unauthorized():
    """Test /me without token fails."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/auth/me")
    assert response.status_code == 401