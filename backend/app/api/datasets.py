"""Dataset API routes."""
from fastapi import APIRouter, HTTPException
from typing import List
import sys
import os

# Add parent directory to path to import from data module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.data.classification import get_all_classification_datasets, load_classification_dataset
from app.data.regression import get_all_regression_datasets, load_regression_dataset
from app.api.models import DatasetInfo, DatasetsResponse, DatasetData

router = APIRouter(prefix="/api/datasets", tags=["datasets"])


@router.get("", response_model=DatasetsResponse)
async def list_datasets() -> DatasetsResponse:
    """
    List all available datasets.

    Returns both classification and regression datasets with their metadata.
    """
    classification_datasets = get_all_classification_datasets()
    regression_datasets = get_all_regression_datasets()

    datasets: List[DatasetInfo] = []

    # Add classification datasets
    for name, info in classification_datasets.items():
        # Get sample data to determine number of classes
        sample = load_classification_dataset(name)
        datasets.append(DatasetInfo(
            name=info['name'],
            type='classification',
            description=info['description'],
            features=len(info['feature_names']),
            samples=sample['metadata']['samples'],
            classes=sample['metadata']['classes'],
            feature_names=info['feature_names']
        ))

    # Add regression datasets
    for name, info in regression_datasets.items():
        sample = load_regression_dataset(name)
        datasets.append(DatasetInfo(
            name=info['name'],
            type='regression',
            description=info['description'],
            features=len(info['feature_names']),
            samples=sample['metadata']['samples'],
            feature_names=info['feature_names']
        ))

    return DatasetsResponse(datasets=datasets)


@router.get("/{name}", response_model=DatasetData)
async def get_dataset(name: str) -> DatasetData:
    """
    Get a specific dataset by name.

    Returns the complete dataset with train/test splits.
    """
    # Try classification datasets first
    classification_datasets = get_all_classification_datasets()
    if name in classification_datasets:
        data = load_classification_dataset(name)
        return DatasetData(
            name=data['name'],
            train_inputs=data['train_inputs'],
            train_labels=data['train_labels'],
            test_inputs=data['test_inputs'],
            test_labels=data['test_labels'],
            metadata=DatasetInfo(**data['metadata'])
        )

    # Try regression datasets
    regression_datasets = get_all_regression_datasets()
    if name in regression_datasets:
        data = load_regression_dataset(name)
        return DatasetData(
            name=data['name'],
            train_inputs=data['train_inputs'],
            train_labels=data['train_labels'],
            test_inputs=data['test_inputs'],
            test_labels=data['test_labels'],
            metadata=DatasetInfo(**data['metadata'])
        )

    raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found")
