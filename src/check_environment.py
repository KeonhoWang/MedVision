import sys
import torch
import medmnist
import sklearn
import numpy
import pandas

print("Python:", sys.version)
print("PyTorch:", torch.__version__)
print("MedMNIST:", medmnist.__version__)
print("Scikit-learn:", sklearn.__version__)
print("NumPy:", numpy.__version__)
print("Pandas:", pandas.__version__)

print("\nCUDA available:", torch.cuda.is_available())

if torch.backends.mps.is_available():
    print("Apple Silicon GPU: Available")
else:
    print("Apple Silicon GPU: Not available")

print("\nEnvironment setup successful!")