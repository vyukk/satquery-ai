import pytest
import io
from httpx import AsyncClient
from PIL import Image as PILImage

from app.main import app
from app.database import SessionLocal
from app.models import User
from app.security import get_password_hash, create_access_token


@pytest.fixture(scope="session")
def auth_headers():
    """Create auth headers for test user - session scoped."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "images_test@example.com").first()
        if not user:
            user = User(
                id="test-user-images",
                email="images_test@example.com",
                hashed_password=get_password_hash("testpass123"),
                full_name="Test User Images",
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        token = create_access_token(data={"sub": user.id})
        return {"Authorization": f"Bearer {token}", "user_id": user.id}
    finally:
        db.close()


def create_test_image() -> bytes:
    """Create a simple test PNG image."""
    img = PILImage.new("RGB", (100, 100), color="red")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.mark.asyncio
async def test_upload_image(auth_headers):
    """Test image upload."""
    headers = {k: v for k, v in auth_headers.items() if k == "Authorization"}
    user_id = auth_headers["user_id"]

    async with AsyncClient(app=app, base_url="http://test") as ac:
        ac.headers.update(headers)
        files = {"file": ("test.png", create_test_image(), "image/png")}
        response = await ac.post("/api/images/upload", files=files)

    assert response.status_code == 200
    data = response.json()
    assert "image" in data
    assert data["image"]["filename"] == "test.png"
    assert data["image"]["modality"] == "optical"  # PNG defaults to optical
    assert "id" in data["image"]
    assert data["image"]["thumbnailUrl"] is not None


@pytest.mark.asyncio
async def test_upload_invalid_file_type(auth_headers):
    """Test upload with invalid file type."""
    headers = {k: v for k, v in auth_headers.items() if k == "Authorization"}

    async with AsyncClient(app=app, base_url="http://test") as ac:
        ac.headers.update(headers)
        files = {"file": ("test.txt", b"not an image", "text/plain")}
        response = await ac.post("/api/images/upload", files=files)

    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


@pytest.mark.asyncio
async def test_get_image(auth_headers):
    """Test getting uploaded image metadata."""
    headers = {k: v for k, v in auth_headers.items() if k == "Authorization"}

    # First upload
    async with AsyncClient(app=app, base_url="http://test") as ac:
        ac.headers.update(headers)
        files = {"file": ("test2.png", create_test_image(), "image/png")}
        upload_resp = await ac.post("/api/images/upload", files=files)
    image_id = upload_resp.json()["image"]["id"]

    # Then get it
    async with AsyncClient(app=app, base_url="http://test") as ac:
        ac.headers.update(headers)
        response = await ac.get(f"/api/images/{image_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == image_id


@pytest.mark.asyncio
async def test_list_images(auth_headers):
    """Test listing user's images."""
    headers = {k: v for k, v in auth_headers.items() if k == "Authorization"}

    async with AsyncClient(app=app, base_url="http://test") as ac:
        ac.headers.update(headers)
        response = await ac.get("/api/images")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1