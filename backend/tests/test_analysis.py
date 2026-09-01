import pytest
from httpx import AsyncClient

from app.main import app
from app.database import SessionLocal
from app.models import User, Image
from app.security import get_password_hash, create_access_token


@pytest.fixture(scope="session")
def auth_headers():
    """Create auth headers for test user - session scoped."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "analysis_test@example.com").first()
        if not user:
            user = User(
                id="test-user-analysis",
                email="analysis_test@example.com",
                hashed_password=get_password_hash("testpass123"),
                full_name="Test User Analysis",
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Ensure user has at least one image
        img = db.query(Image).filter(Image.owner_id == user.id).first()
        if not img:
            img = Image(
                id="test-img-001",
                filename="test.tif",
                original_filename="test.tif",
                modality="optical",
                sensor="Test Sensor",
                resolution=10.0,
                lat=0.0,
                lng=0.0,
                crs="EPSG:4326",
                format="GeoTIFF",
                file_size=1000,
                width=100,
                height=100,
                file_path="uploads/test.tif",
                owner_id=user.id,
                is_public=True,
            )
            db.add(img)
            db.commit()
            db.refresh(img)

        token = create_access_token(data={"sub": user.id})
        return {"Authorization": f"Bearer {token}", "user_id": user.id, "image_id": img.id}
    finally:
        db.close()


@pytest.mark.asyncio
async def test_run_analysis(auth_headers):
    """Test running analysis pipeline."""
    headers = {k: v for k, v in auth_headers.items() if k == "Authorization"}
    image_id = auth_headers["image_id"]

    async with AsyncClient(app=app, base_url="http://test", timeout=30.0) as ac:
        ac.headers.update(headers)
        response = await ac.post("/api/analysis", json={
            "query": "What is the land cover in this image?",
            "image_ids": [image_id],
        })

    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "analysis" in data
    assert "orchestration" in data

    # Check message
    msg = data["message"]
    assert msg["role"] == "assistant"
    assert len(msg["content"]) > 0

    # Check analysis
    analysis = data["analysis"]
    assert analysis["query"] == "What is the land cover in this image?"
    assert analysis["confidence"] > 0
    assert analysis["processingTime"] > 0
    assert isinstance(analysis["evidence"], list)
    assert isinstance(analysis["keyFindings"], list)
    assert isinstance(analysis["modelTrace"], list)

    # Check orchestration
    orch = data["orchestration"]
    assert orch["isComplete"] is True
    assert orch["overallProgress"] == 100.0
    assert len(orch["steps"]) == 5


@pytest.mark.asyncio
async def test_run_analysis_change_detection(auth_headers):
    """Test running change detection analysis (needs 2 images)."""
    import uuid
    headers = {k: v for k, v in auth_headers.items() if k == "Authorization"}
    image_id = auth_headers["image_id"]

    # Create a second image for comparison
    db = SessionLocal()
    try:
        user_id = auth_headers["user_id"]
        img2 = Image(
            id=f"test-img-002-cd-{uuid.uuid4().hex[:8]}",
            filename="test2.tif",
            original_filename="test2.tif",
            modality="multispectral",
            sensor="Test Sensor 2",
            resolution=10.0,
            lat=0.0,
            lng=0.0,
            crs="EPSG:4326",
            format="GeoTIFF",
            file_size=1000,
            width=100,
            height=100,
            file_path="uploads/test2.tif",
            owner_id=user_id,
            is_public=True,
        )
        db.add(img2)
        db.commit()
        image_id_2 = img2.id
    finally:
        db.close()

    async with AsyncClient(app=app, base_url="http://test", timeout=30.0) as ac:
        ac.headers.update(headers)
        response = await ac.post("/api/analysis", json={
            "query": "What changed between these two images?",
            "image_ids": [image_id],
            "comparison_image_id": image_id_2,
        })

    assert response.status_code == 200
    data = response.json()
    analysis = data["analysis"]
    assert analysis["queryType"] in ["change", "multimodal", "landcover", "general"]


@pytest.mark.asyncio
async def test_run_analysis_invalid_image(auth_headers):
    """Test analysis with non-existent image."""
    headers = {k: v for k, v in auth_headers.items() if k == "Authorization"}

    async with AsyncClient(app=app, base_url="http://test") as ac:
        ac.headers.update(headers)
        response = await ac.post("/api/analysis", json={
            "query": "Analyze this",
            "image_ids": ["non-existent-id"],
        })

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_analysis_history(auth_headers):
    """Test getting analysis history."""
    headers = {k: v for k, v in auth_headers.items() if k == "Authorization"}

    async with AsyncClient(app=app, base_url="http://test") as ac:
        ac.headers.update(headers)
        response = await ac.get("/api/analysis/history")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_analysis_by_id(auth_headers):
    """Test getting specific analysis."""
    headers = {k: v for k, v in auth_headers.items() if k == "Authorization"}

    # First run an analysis to get an ID
    image_id = auth_headers["image_id"]
    async with AsyncClient(app=app, base_url="http://test", timeout=30.0) as ac:
        ac.headers.update(headers)
        run_resp = await ac.post("/api/analysis", json={
            "query": "Test query",
            "image_ids": [image_id],
        })
    analysis_id = run_resp.json()["analysis"]["id"]

    # Then get it
    async with AsyncClient(app=app, base_url="http://test") as ac:
        ac.headers.update(headers)
        response = await ac.get(f"/api/analysis/{analysis_id}")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == analysis_id