
from PIL import Image
from pathlib import Path

from backend.predictor import predictor, CLASS_NAMES


# Locate the project directory
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Load a sample image from the MedMNIST test dataset
sample_path = PROJECT_ROOT / "data" / "medmnist"

from medmnist import PathMNIST

test_dataset = PathMNIST(
    split="test",
    root=str(sample_path),
    download=False
)

# Select one test image
sample_image, sample_label = test_dataset[0]

# Convert the image into PIL format if necessary
if not isinstance(sample_image, Image.Image):
    sample_image = Image.fromarray(sample_image)

# Run prediction
result = predictor.predict(sample_image)

# Display results
print("\nMedVision Prediction Results")
print("----------------------------")

print("Actual class:", CLASS_NAMES[int(sample_label[0])])
print("Predicted class:", result["predicted_class"])
print("Predicted index:", result["predicted_index"])

print("\nClass Probabilities:")

for class_name, probability in result["probabilities"].items():
    print(f"{class_name}: {probability * 100:.2f}%")

print("\nProbability sum:",
      sum(result["probabilities"].values()))

print("\nPrediction test completed!")
