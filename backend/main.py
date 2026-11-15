
from io import BytesIO

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

from backend.predictor import predictor


# Create FastAPI application
app = FastAPI(
    title="MedVision API",
    description=(
        "An educational deep learning API "
        "for medical image classification using PathMNIST."
    ),
    version="1.0.0"
)


# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root endpoint
@app.get("/")
def root():
    return {
        "message": "Welcome to MedVision API",
        "project": "MedVision",
        "version": "1.0.0",
        "status": "running"
    }


# Health-check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": predictor.model is not None,
        "device": str(predictor.model.conv1.weight.device)
    }


# Image prediction endpoint
@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):

    # Read uploaded image
    contents = await file.read(10 * 1024 * 1024 + 1)

    # Limit uploads to 10 MB
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Image file is too large. Maximum size is 10 MB."
        )

    # Validate and open image
    try:
        image = Image.open(BytesIO(contents))
        image.load()

    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=400,
            detail="Invalid image file. Please upload a valid image."
        )

    # Run model prediction
    result = predictor.predict(image)

    # Return prediction results
    return {
        "filename": file.filename,
        "predicted_class": result["predicted_class"],
        "predicted_index": result["predicted_index"],
        "probabilities": result["probabilities"],
        "disclaimer": (
            "Educational research prototype only. "
            "Not intended for medical diagnosis or clinical decisions."
        )
    }
