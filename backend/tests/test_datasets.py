import pytest
from httpx import AsyncClient

from app.main import app
from app.database import SessionLocal
from app.models import User
from app.security import get_password_hash, create_access_token


@pytest.fixture(scope="session")
def auth_headers():
    """Create auth headers for test user - session scoped."""
    db = SessionLocal()
    try:
        # Use a unique email for datasets tests
        user = db.query(User).filter(User.email == "datasets_test@example.com").first()
        if not user:
            user = User(
                id="test-user-datasets",
                email="datasets_test@example.com",
                hashed_password=get_password_hash("testpass123"),
                full_name="Test User Datasets",
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        token = create_access_token(data={"sub": user.id})
        return {"Authorization": f"Bearer {token}"}
    finally:
        db.close()


@pytest.mark.asyncio
async def test_list_datasets(auth_headers):
    """Test listing datasets."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        ac.headers.update(auth_headers)
        response = await ac.get("/api/datasets")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Should have seeded datasets
    assert len(data) >= 6


@pytest.mark.asyncio
async def test_list_datasets_filter_modality(auth_headers):
    """Test filtering datasets by modality."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        ac.headers.update(auth_headers)
        response = await ac.get("/api/datasets?modality=optical")

    assert response.status_code == 200
    data = response.json()
    assert all(d["image"]["modality"] == "optical" for d in data)


@pytest.mark.asyncio
async def test_list_datasets_search(auth_headers):
    """Test searching datasets."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        ac.headers.update(auth_headers)
        response = await ac.get("/api/datasets?search=Delhi")

    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any("Delhi" in d["name"] for d in data)


@pytest.mark.asyncio
async def test_get_dataset(auth_headers):
    """Test getting a single dataset."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        ac.headers.update(auth_headers)
        # First list to get an ID
        list_resp = await ac.get("/api/datasets")
        dataset_id = list_resp.json()[0]["id"]

        response = await ac.get(f"/api/datasets/{dataset_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == dataset_id
    assert "image" in data
    assert data["image"]["modality"] in ["optical", "sar", "multispectral", "hyperspectral"]


@pytest.mark.asyncio
async def test_get_dataset_not_found(auth_headers):
    """Test getting non-existent dataset."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        ac.headers.update(auth_headers)
        response = await ac.get("/api/datasets/non-existent-id")

    assert response.status_code == 404