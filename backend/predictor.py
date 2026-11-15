
from pathlib import Path
from typing import Any

import torch
import numpy as np
from PIL import Image

from backend.model import MedVisionCNNV2


# Tissue classification labels
CLASS_NAMES = [
    "Adipose",
    "Background",
    "Debris",
    "Lymphocytes",
    "Mucus",
    "Smooth Muscle",
    "Normal Colon Mucosa",
    "Cancer-associated Stroma",
    "Colorectal Adenocarcinoma Epithelium"
]


# Select the available computing device
if torch.backends.mps.is_available():
    DEVICE = torch.device("mps")
elif torch.cuda.is_available():
    DEVICE = torch.device("cuda")
else:
    DEVICE = torch.device("cpu")


# Locate the trained V2.1 checkpoint
PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    PROJECT_ROOT
    / "models"
    / "medvision_cnn_v2_lr0003.pth"
)


class MedVisionPredictor:

    def __init__(self) -> None:

        # Initialize the trained CNN architecture
        self.model = MedVisionCNNV2(
            num_classes=len(CLASS_NAMES)
        ).to(DEVICE)

        # Load trained model parameters
        checkpoint = torch.load(
            MODEL_PATH,
            map_location=DEVICE,
            weights_only=True
        )

        self.model.load_state_dict(checkpoint)

        # Set model to inference mode
        self.model.eval()

        print(f"MedVision model loaded on {DEVICE}")

    def preprocess_image(self, image: Image.Image) -> torch.Tensor:

        # Ensure the image has three RGB channels
        image = image.convert("RGB")

        # Resize to the model's expected input dimensions
        image = image.resize((28, 28))

        # Convert image into a NumPy array
        image_array = np.array(
            image,
            dtype=np.float32
        )

        # Scale pixel values from [0, 255] to [0, 1]
        image_array = image_array / 255.0

        # Convert HWC format to CHW format
        image_array = np.transpose(
            image_array,
            (2, 0, 1)
        )

        # Convert to a PyTorch tensor
        image_tensor = torch.from_numpy(
            image_array
        ).float()

        # Add batch dimension
        image_tensor = image_tensor.unsqueeze(0)

        return image_tensor.to(DEVICE)

    def predict(self, image: Image.Image) -> dict[str, Any]:

        # Preprocess uploaded image
        image_tensor = self.preprocess_image(image)

        # Run model inference
        with torch.no_grad():

            logits = self.model(image_tensor)

            # Convert logits into probabilities
            probabilities = torch.softmax(
                logits,
                dim=1
            )[0]

        # Find the predicted class
        predicted_index = int(
            torch.argmax(probabilities).item()
        )

        predicted_class = CLASS_NAMES[predicted_index]

        # Build probability dictionary
        class_probabilities = {
            CLASS_NAMES[i]: float(probabilities[i].item())
            for i in range(len(CLASS_NAMES))
        }

        return {
            "predicted_class": predicted_class,
            "predicted_index": predicted_index,
            "probabilities": class_probabilities
        }


# Create one reusable predictor instance
predictor = MedVisionPredictor()
