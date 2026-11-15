# MedVision — Dataset Analysis

## 1. Dataset Overview

MedVision uses the PathMNIST dataset from the MedMNIST benchmark. It contains histopathology image patches derived from colorectal tissue samples.

The machine learning objective is to classify each image into one of nine tissue categories.

## 2. Dataset Characteristics

- Dataset: PathMNIST
- Image type: RGB histopathology images
- Image dimensions: 28 × 28 pixels
- Number of color channels: 3
- Number of classes: 9
- Total samples: 107,180
- Training samples: 89,996
- Validation samples: 10,004
- Testing samples: 7,180
- Task: Multi-class image classification
- Dataset license: CC BY 4.0

## 3. Data Representation

Images are represented as NumPy arrays with the shape:

`(N, 28, 28, 3)`

Each image contains three color channels: Red, Green and Blue.

Pixel values are stored as unsigned 8-bit integers ranging from 0 to 255.

Labels are stored as numerical class identifiers.

## 4. Dataset Splits

The dataset provides three predefined splits:

- Training: Used to fit machine learning models.
- Validation: Used to evaluate and tune models during development.
- Testing: Reserved for final model evaluation.

The official test split will remain untouched during model development to prevent test-set leakage.

## 5. Class Distribution Analysis

The PathMNIST training dataset contains 89,996 images distributed across nine tissue categories.

| Class ID | Tissue Category                      | Image Count | Percentage |
| -------: | ------------------------------------ | ----------: | ---------: |
|        0 | Adipose                              |       9,366 |     10.41% |
|        1 | Background                           |       9,509 |     10.57% |
|        2 | Debris                               |      10,360 |     11.51% |
|        3 | Lymphocytes                          |      10,401 |     11.56% |
|        4 | Mucus                                |       8,006 |      8.90% |
|        5 | Smooth muscle                        |      12,182 |     13.54% |
|        6 | Normal colon mucosa                  |       7,886 |      8.76% |
|        7 | Cancer-associated stroma             |       9,401 |     10.45% |
|        8 | Colorectal adenocarcinoma epithelium |      12,885 |     14.32% |
|          | **Total**                            |  **89,996** |   **100%** |

### Observations

- Class 8 (colorectal adenocarcinoma epithelium) has the largest number of training samples, with 12,885 images.
- Class 6 (normal colon mucosa) has the smallest number of samples, with 7,886 images.
- The largest class contains approximately 1.63 times as many images as the smallest class.
- The distribution shows moderate class imbalance rather than an extreme imbalance.

### Implications for Model Training

The initial CNN will be trained without class weighting or oversampling to establish a baseline.

Model performance will be evaluated using accuracy, macro-averaged F1-score, per-class precision and recall, and a confusion matrix. These metrics will help identify whether the model performs less effectively on categories with fewer training examples.

If meaningful differences in class performance appear, class weighting or other balancing techniques will be considered in subsequent experiments.

## 6. Initial Observations

To be completed after exploratory data analysis:

- Class distribution:
- Visual differences between categories:
- Potentially similar categories:
- Data quality observations:
- Dataset limitations:

## 7. Limitations

The standard images have a relatively low resolution of 28 × 28 pixels. Fine-grained cellular details may therefore be lost.

The dataset is intended for machine learning research and education, not clinical diagnosis.

## 8. Data Source

MedMNIST official repository: https://github.com/MedMNIST/MedMNIST

MedMNIST homepage: https://medmnist.com/

Research publication: https://doi.org/10.1038/s41597-022-01721-8
