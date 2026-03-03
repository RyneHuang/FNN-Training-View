"""Regression dataset generators."""
import numpy as np
import os
import logging
from sklearn.datasets import fetch_california_housing, load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from typing import Dict, Tuple

# 配置日志
logger = logging.getLogger(__name__)

# 数据缓存目录
CACHE_DIR = os.path.join(os.path.dirname(__file__), 'cache')

# 离线模式：设置为 True 时，只从缓存加载，不联网下载
OFFLINE_MODE = os.getenv('FNN_OFFLINE_MODE', 'true').lower() == 'true'


def _load_from_cache(dataset_name: str):
    """从缓存文件加载数据集（用于离线部署）"""
    cache_file = os.path.join(CACHE_DIR, f"{dataset_name}.npz")

    if not os.path.exists(cache_file):
        logger.warning(f"Cache file not found: {cache_file}")
        if OFFLINE_MODE:
            logger.error(f"OFFLINE_MODE: Cannot load dataset '{dataset_name}' - cache file missing")
            logger.error(f"Please ensure the cache directory exists and contains all dataset files")
        return None

    try:
        data = np.load(cache_file, allow_pickle=True)

        # 提取元数据
        metadata = {
            'name': str(data['metadata_name'], encoding='utf-8'),
            'type': str(data['metadata_type'], encoding='utf-8'),
            'description': str(data['metadata_description'], encoding='utf-8'),
            'features': int(data['metadata_features']),
            'samples': int(data['metadata_samples']),
            'feature_names': data['metadata_featureNames'].tolist()
        }

        logger.info(f"Successfully loaded dataset '{dataset_name}' from cache")
        return {
            'train_inputs': data['train_inputs'],
            'train_labels': data['train_labels'],
            'test_inputs': data['test_inputs'],
            'test_labels': data['test_labels'],
            'metadata': metadata
        }
    except Exception as e:
        logger.error(f"Failed to load {dataset_name} from cache: {e}")
        return None


def generate_linear_dataset(samples: int = 500, noise: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate linear regression dataset: y = 2x + 3 + noise

    Args:
        samples: number of samples
        noise: standard deviation of Gaussian noise

    Returns:
        inputs: (samples, 1) array - normalized to [0, 1]
        labels: (samples,) array - normalized to [0, 1]
    """
    inputs = np.random.uniform(-5, 5, size=(samples, 1))
    labels = 2 * inputs.flatten() + 3 + np.random.normal(0, noise, samples)

    # Normalize to [0, 1] range for better training
    scaler = MinMaxScaler()
    inputs = scaler.fit_transform(inputs)
    labels = (labels - labels.min()) / (labels.max() - labels.min())

    return inputs, labels


def generate_sine_dataset(samples: int = 500, noise: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate sine wave dataset: y = sin(x) + noise

    Args:
        samples: number of samples
        noise: standard deviation of Gaussian noise

    Returns:
        inputs: (samples, 1) array - normalized to [0, 1]
        labels: (samples,) array - normalized to [0, 1]
    """
    inputs = np.random.uniform(-2 * np.pi, 2 * np.pi, size=(samples, 1))
    labels = np.sin(inputs.flatten()) + np.random.normal(0, noise, samples)

    # Normalize to [0, 1] range for better training
    scaler = MinMaxScaler()
    inputs = scaler.fit_transform(inputs)
    labels = (labels - labels.min()) / (labels.max() - labels.min())

    return inputs, labels


def generate_polynomial_dataset(samples: int = 500, noise: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate polynomial regression dataset: y = 0.5x^2 - 2x + 1 + noise

    Args:
        samples: number of samples
        noise: standard deviation of Gaussian noise

    Returns:
        inputs: (samples, 1) array - normalized to [0, 1]
        labels: (samples,) array - normalized to [0, 1]
    """
    inputs = np.random.uniform(-5, 5, size=(samples, 1))
    labels = 0.5 * inputs.flatten()**2 - 2 * inputs.flatten() + 1 + np.random.normal(0, noise, samples)

    # Normalize to [0, 1] range for better training
    scaler = MinMaxScaler()
    inputs = scaler.fit_transform(inputs)
    labels = (labels - labels.min()) / (labels.max() - labels.min())

    return inputs, labels


def generate_exponential_dataset(samples: int = 500, noise: float = 0.05) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate exponential dataset: y = e^(0.5x) + noise

    Args:
        samples: number of samples
        noise: standard deviation of Gaussian noise

    Returns:
        inputs: (samples, 1) array - normalized to [0, 1]
        labels: (samples,) array - normalized to [0, 1]
    """
    inputs = np.random.uniform(-2, 3, size=(samples, 1))
    labels = np.exp(0.5 * inputs.flatten()) + np.random.normal(0, noise, samples)

    # Normalize to [0, 1] range for better training
    scaler = MinMaxScaler()
    inputs = scaler.fit_transform(inputs)
    labels = (labels - labels.min()) / (labels.max() - labels.min())

    return inputs, labels


def generate_multilinear_dataset(samples: int = 500, noise: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate multiple linear regression dataset: y = x1 + 2*x2 - 0.5*x3 + noise

    Args:
        samples: number of samples
        noise: standard deviation of Gaussian noise

    Returns:
        inputs: (samples, 3) array - normalized to [0, 1]
        labels: (samples,) array - normalized to [0, 1]
    """
    inputs = np.random.uniform(-3, 3, size=(samples, 3))
    labels = inputs[:, 0] + 2 * inputs[:, 1] - 0.5 * inputs[:, 2] + np.random.normal(0, noise, samples)

    # Normalize to [0, 1] range for better training
    scaler = MinMaxScaler()
    inputs = scaler.fit_transform(inputs)
    labels = (labels - labels.min()) / (labels.max() - labels.min())

    return inputs, labels


def generate_california_housing_dataset() -> Tuple[np.ndarray, np.ndarray]:
    """
    Load the California Housing dataset.

    Returns:
        inputs: (20640, 8) array - housing features
        labels: (20640,) array - median house values
    """
    housing = fetch_california_housing()
    inputs = housing.data.astype(float)
    labels = housing.target.astype(float)

    # Normalize features to [0, 1] range
    scaler = MinMaxScaler()
    inputs = scaler.fit_transform(inputs)

    # Also normalize labels to reasonable range
    labels = (labels - labels.min()) / (labels.max() - labels.min())

    return inputs, labels


def generate_diabetes_dataset() -> Tuple[np.ndarray, np.ndarray]:
    """
    Load the Diabetes dataset.

    Returns:
        inputs: (442, 10) array - diabetes patient features
        labels: (442,) array - disease progression measure
    """
    diabetes = load_diabetes()
    inputs = diabetes.data.astype(float)
    labels = diabetes.target.astype(float)

    # Normalize features to [0, 1] range
    scaler = MinMaxScaler()
    inputs = scaler.fit_transform(inputs)

    # Also normalize labels
    labels = (labels - labels.min()) / (labels.max() - labels.min())

    return inputs, labels


def get_all_regression_datasets() -> Dict[str, Dict]:
    """Get all available regression datasets."""
    return {
        'linear': {
            'name': 'linear',
            'type': 'regression',
            'description': '线性回归数据集 - y = 2x + 3',
            'feature_names': ['x'],
            'generator': lambda: generate_linear_dataset(500)
        },
        'sine': {
            'name': 'sine',
            'type': 'regression',
            'description': '正弦波拟合 - y = sin(x)',
            'feature_names': ['x'],
            'generator': lambda: generate_sine_dataset(500)
        },
        'polynomial': {
            'name': 'polynomial',
            'type': 'regression',
            'description': '多项式回归 - y = 0.5x² - 2x + 1',
            'feature_names': ['x'],
            'generator': lambda: generate_polynomial_dataset(500)
        },
        'exponential': {
            'name': 'exponential',
            'type': 'regression',
            'description': '指数函数拟合 - y = e^(0.5x)',
            'feature_names': ['x'],
            'generator': lambda: generate_exponential_dataset(500)
        },
        'multilinear': {
            'name': 'multilinear',
            'type': 'regression',
            'description': '多元线性回归 - y = x1 + 2*x2 - 0.5*x3',
            'feature_names': ['x1', 'x2', 'x3'],
            'generator': lambda: generate_multilinear_dataset(500)
        },
        'california_housing': {
            'name': 'california_housing',
            'type': 'regression',
            'description': '加利福尼亚房价数据集 - 预测房屋中位数',
            'feature_names': [
                'MedInc', 'HouseAge', 'AveRooms', 'AveBedrms',
                'Population', 'AveOccup', 'Latitude', 'Longitude'
            ],
            'generator': generate_california_housing_dataset
        },
        'diabetes': {
            'name': 'diabetes',
            'type': 'regression',
            'description': '糖尿病数据集 - 预测疾病进展情况',
            'feature_names': [
                'Age', 'Sex', 'BMI', 'Blood Pressure', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'
            ],
            'generator': generate_diabetes_dataset
        }
    }


def load_regression_dataset(name: str, train_ratio: float = 0.8) -> Dict:
    """
    Load a specific regression dataset and split into train/test.

    优先从缓存文件加载，如果缓存不存在则动态生成。
    离线模式下，如果缓存不存在将抛出错误。

    Args:
        name: dataset name
        train_ratio: ratio of training data

    Returns:
        Dictionary with train/test inputs and labels

    Raises:
        ValueError: If dataset is unknown or cache is missing in offline mode
    """
    # 优先尝试从缓存加载（用于离线部署）
    cached_data = _load_from_cache(name)
    if cached_data is not None:
        return cached_data

    # 离线模式下，缓存不存在时抛出错误
    if OFFLINE_MODE:
        raise ValueError(
            f"Dataset '{name}' is not available in offline mode.\n"
            f"Cache file not found: {os.path.join(CACHE_DIR, f'{name}.npz')}\n"
            f"Please ensure all cache files exist in the cache directory.\n"
            f"Available datasets in cache: {_list_cached_datasets()}"
        )

    # 缓存不存在，动态生成（在线模式）
    logger.warning(f"Cache miss for '{name}', generating dataset dynamically")
    datasets = get_all_regression_datasets()

    if name not in datasets:
        raise ValueError(f"Unknown dataset: {name}")

    dataset_info = datasets[name]
    inputs, labels = dataset_info['generator']()

    # Shuffle and split
    indices = np.random.permutation(len(inputs))
    split_idx = int(len(inputs) * train_ratio)

    train_indices = indices[:split_idx]
    test_indices = indices[split_idx:]

    return {
        'name': name,
        'train_inputs': inputs[train_indices].tolist(),
        'train_labels': labels[train_indices].tolist(),
        'test_inputs': inputs[test_indices].tolist(),
        'test_labels': labels[test_indices].tolist(),
        'metadata': {
            'name': name,
            'type': 'regression',
            'description': dataset_info['description'],
            'features': inputs.shape[1],
            'samples': len(inputs),
            'feature_names': dataset_info['feature_names']
        }
    }


def _list_cached_datasets() -> list:
    """列出缓存目录中可用的数据集"""
    if not os.path.exists(CACHE_DIR):
        return []
    cached_files = [f.replace('.npz', '') for f in os.listdir(CACHE_DIR) if f.endswith('.npz')]
    return sorted(cached_files)
