# MedVision — Experimental Results

## 1. Project Overview

MedVision is an educational deep learning project for multi-class
histopathology image classification using the PathMNIST dataset.

The system classifies images into nine tissue categories using
Convolutional Neural Networks (CNNs) implemented with PyTorch.

This project is intended for educational and research purposes only.
It is not a clinically validated diagnostic system.

## 2. Dataset

Dataset: PathMNIST (MedMNIST)

- Training samples: 89,996
- Validation samples: 10,004
- Test samples: 7,180
- Total samples: 107,180
- Image dimensions: 28 x 28 pixels
- Image channels: 3 (RGB)
- Number of classes: 9

Training and validation data originate from NCT-CRC-HE-100K.
The independent test set originates from CRC-VAL-HE-7K.

The separate test source provides an opportunity to examine
generalization across different data sources.

## 3. Model Experiments

### 3.1 Baseline CNN

The baseline model was developed from scratch using PyTorch.

Architecture:
- Convolutional layer: 3 to 32 channels
- ReLU activation
- Max pooling
- Convolutional layer: 32 to 64 channels
- ReLU activation
- Max pooling
- Fully connected layer: 64 x 7 x 7 to 128
- Fully connected output layer: 128 to 9 classes

Trainable parameters: 422,089

Training configuration:
- Optimizer: Adam
- Learning rate: 0.001
- Loss: CrossEntropyLoss
- Epochs: 5
- Batch size: 64

### 3.2 Improved CNN V2

The second model introduced:
- Three convolutional layers
- Batch normalization
- Dropout (0.4)
- Adaptive average pooling
- Random horizontal and vertical flips
- Random right-angle rotations
- Inverse-frequency class weighting

Trainable parameters: 111,369

Training configuration:
- Optimizer: Adam
- Learning rate: 0.001
- Loss: Weighted CrossEntropyLoss
- Epochs: 10
- Batch size: 64

Best validation checkpoint: Epoch 6.

### 3.3 Improved CNN V2.1

V2.1 retained the V2 architecture and training strategy,
with a reduced learning rate.

Training configuration:
- Optimizer: Adam
- Learning rate: 0.0003
- Loss: Weighted CrossEntropyLoss
- Epochs: 10
- Batch size: 64

Best validation checkpoint: Epoch 10.

The purpose of this experiment was to investigate whether
a lower learning rate improved validation performance
and training stability.

## 4. Validation Results

| Model | Validation Accuracy | Validation Macro F1 |
|---|---:|---:|
| Baseline CNN | 82.04% | 81.72% |
| Improved CNN V2 | 90.28% | 89.91% |
| Improved CNN V2.1 | 90.33% | 90.52% |

V2.1 achieved the highest validation Macro F1.

Compared with the baseline, its validation Macro F1 improved
by approximately 8.80 percentage points.

## 5. Independent Test Results

| Model | Test Accuracy | Test Macro F1 | Test Weighted F1 |
|---|---:|---:|---:|
| Baseline CNN | 80.06% | 73.54% | 80.21% |
| Improved CNN V2 | Not evaluated | Not evaluated | Not evaluated |
| Improved CNN V2.1 | 77.10% | 73.34% | 77.93% |

V2.1 achieved a slightly lower independent test Macro F1
than the baseline, despite its substantially higher validation score.

The baseline achieved:
- Test accuracy: 80.06%
- Test Macro F1: 73.54%
- Test weighted F1: 80.21%

V2.1 achieved:
- Test accuracy: 77.10%
- Test Macro F1: 73.34%
- Test weighted F1: 77.93%

These findings show that stronger validation performance
did not translate into better overall independent test performance.

## 6. Per-Class Test Analysis

V2.1 improved the test F1-score for four categories compared
with the baseline:

- Debris: 31.68% to 43.23%
- Smooth Muscle: 61.03% to 70.83%
- Normal Colon Mucosa: 78.10% to 84.10%
- Cancer-associated Stroma: 50.65% to 56.41%

Five categories had lower test F1-scores:

- Adipose
- Background
- Lymphocytes
- Mucus
- Colorectal Adenocarcinoma Epithelium

Notable V2.1 test results:

- Background recall: 100.00%
- Adipose recall: 96.94%
- Debris recall: 79.65%
- Lymphocytes recall: 59.46%
- Mucus recall: 54.20%

The confusion matrix revealed substantial confusion between
Lymphocytes and Debris, and between Mucus and other tissue types.

## 7. Discussion

The validation and independent test results show a substantial
performance gap, particularly for V2.1.

One possible explanation is domain shift, because the training
and validation data originate from NCT-CRC-HE-100K, while the
independent test data originate from CRC-VAL-HE-7K.

Differences in staining, image acquisition, tissue appearance,
and data distributions may affect generalization.

However, the experiments do not establish the exact cause
of this performance gap.

The results also demonstrate why accuracy alone is insufficient.
Macro F1 and class-level precision and recall provide additional
insight into performance across all nine categories.

## 8. Conclusion

Three CNN experiments were developed and evaluated.

V2.1 achieved the strongest validation Macro F1 of 90.52%.
However, the baseline achieved the highest independent test
Macro F1 of 73.54%, compared with 73.34% for V2.1.

Therefore, V2.1 should not be described as the best
generalizing model based on the available test evidence.

The baseline remains the strongest model by overall
independent test Macro F1 in these experiments.

V2.1 demonstrates that architectural improvements,
augmentation, and class weighting can improve validation
performance, but they do not guarantee better generalization
to data from a different source.

## 9. Limitations

- The models use low-resolution 28 x 28 images.
- Only three CNN configurations were investigated.
- The independent test performance remains limited.
- The test set comes from a different source, and the exact
  causes of the performance gap have not been established.
- No external clinical validation was performed.
- Model predictions must not be used for medical diagnosis
  or treatment decisions.

## 10. Dataset and References

- MedMNIST: https://medmnist.com/
- MedMNIST GitHub: https://github.com/MedMNIST/MedMNIST
- MedMNIST paper: https://doi.org/10.1038/s41597-022-01721-8

Dataset license: CC BY 4.0.\n