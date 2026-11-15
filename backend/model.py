
import torch
import torch.nn as nn
import torch.nn.functional as F


class MedVisionCNNV2(nn.Module):
    """
    MedVision Improved CNN V2.

    Architecture:
    - Three convolutional blocks
    - Batch normalization
    - ReLU activation
    - Max pooling
    - Global average pooling
    - Fully connected classifier
    - Dropout regularization
    """

    def __init__(self, num_classes=9):
        super(MedVisionCNNV2, self).__init__()

        # First convolutional block
        self.conv1 = nn.Conv2d(
            3, 32, kernel_size=3, padding=1
        )
        self.bn1 = nn.BatchNorm2d(32)

        # Second convolutional block
        self.conv2 = nn.Conv2d(
            32, 64, kernel_size=3, padding=1
        )
        self.bn2 = nn.BatchNorm2d(64)

        # Third convolutional block
        self.conv3 = nn.Conv2d(
            64, 128, kernel_size=3, padding=1
        )
        self.bn3 = nn.BatchNorm2d(128)

        # Pooling layers
        self.pool = nn.MaxPool2d(
            kernel_size=2, stride=2
        )

        self.global_pool = nn.AdaptiveAvgPool2d((1, 1))

        # Classifier
        self.dropout = nn.Dropout(p=0.4)
        self.fc1 = nn.Linear(128, 128)
        self.fc2 = nn.Linear(128, num_classes)

    def forward(self, x):

        # First convolutional block
        x = self.conv1(x)
        x = self.bn1(x)
        x = F.relu(x)
        x = self.pool(x)

        # Second convolutional block
        x = self.conv2(x)
        x = self.bn2(x)
        x = F.relu(x)
        x = self.pool(x)

        # Third convolutional block
        x = self.conv3(x)
        x = self.bn3(x)
        x = F.relu(x)

        # Global average pooling
        x = self.global_pool(x)

        # Flatten features
        x = torch.flatten(x, start_dim=1)

        # Fully connected classifier
        x = self.fc1(x)
        x = F.relu(x)
        x = self.dropout(x)

        # Output class logits
        x = self.fc2(x)

        return x
