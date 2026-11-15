
from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image

from backend.main import app


# Create a test client
client = TestClient(app)


# Helper function to create a sample PNG image
def create_test_image():

    image = Image.new(
        "RGB",
        (28, 28),
        color=(120, 80, 150)
    )

    image_bytes = BytesIO()

    image.save(
        image_bytes,
        format="PNG"
    )

    image_bytes.seek(0)

    return image_bytes


# Test 1: Root endpoint
def test_root_endpoint():

    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["project"] == "MedVision"
    assert data["status"] == "running"


# Test 2: Health endpoint
def test_health_endpoint():

    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"
    assert data["model_loaded"] is True


# Test 3: Successful image prediction
def test_predict_endpoint():

    image_bytes = create_test_image()

    response = client.post(
        "/predict",
        files={
            "file": (
                "test_image.png",
                image_bytes,
                "image/png"
            )
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["filename"] == "test_image.png"
    assert "predicted_class" in data
    assert "predicted_index" in data
    assert len(data["probabilities"]) == 9

    probability_sum = sum(
        data["probabilities"].values()
    )

    assert abs(probability_sum - 1.0) < 1e-5


# Test 4: Invalid image upload
def test_invalid_image():

    response = client.post(
        "/predict",
        files={
            "file": (
                "invalid.txt",
                b"This is not an image",
                "text/plain"
            )
        }
    )

    assert response.status_code == 400


# Test 5: Oversized image upload
def test_oversized_image():

    oversized_content = b"x" * (10 * 1024 * 1024 + 1)

    response = client.post(
        "/predict",
        files={
            "file": (
                "large.png",
                oversized_content,
                "image/png"
            )
        }
    )

    assert response.status_code == 413
