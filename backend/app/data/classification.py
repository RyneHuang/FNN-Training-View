"""Classification dataset generators."""
import numpy as np
import os
import logging
from sklearn.datasets import load_iris, load_breast_cancer, load_wine, make_moons, make_circles
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler, OneHotEncoder
from typing import Dict, List, Tuple

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

        # 辅助函数：安全地从 numpy 数组中提取字符串
        def extract_str(value):
            if isinstance(value, bytes):
                return value.decode('utf-8')
            elif isinstance(value, np.ndarray):
                if value.dtype.kind in ['U', 'S', 'O']:  # Unicode, bytes, object
                    item = value.item()
                    if isinstance(item, bytes):
                        return item.decode('utf-8')
                    return str(item)
            return str(value)

        # 提取元数据
        metadata = {
            'name': extract_str(data['metadata_name']),
            'type': extract_str(data['metadata_type']),
            'description': extract_str(data['metadata_description']),
            'features': int(data['metadata_features']),
            'samples': int(data['metadata_samples']),
            'feature_names': data['metadata_featureNames'].tolist(),
            'classes': int(data['metadata_classes']) if 'metadata_classes' in data else None
        }

        # 转换数据为 list（与动态生成保持一致的格式）
        train_inputs = data['train_inputs'].tolist()
        train_labels = data['train_labels'].tolist()
        test_inputs = data['test_inputs'].tolist()
        test_labels = data['test_labels'].tolist()

        logger.info(f"Successfully loaded dataset '{dataset_name}' from cache")
        return {
            'name': metadata['name'],  # 添加顶层 name 字段
            'train_inputs': train_inputs,
            'train_labels': train_labels,
            'test_inputs': test_inputs,
            'test_labels': test_labels,
            'metadata': metadata
        }
    except Exception as e:
        logger.error(f"Failed to load {dataset_name} from cache: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return None


def generate_logic_gate_dataset(gate_type: str = 'xor', samples: int = 500) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate logic gate datasets (XOR, AND, OR).

    Args:
        gate_type: 'xor', 'and', or 'or'
        samples: number of samples to generate

    Returns:
        inputs: (samples, 2) array
        labels: (samples,) array with values 0 or 1
    """
    # Generate random binary inputs with some noise
    inputs = np.random.randint(0, 2, size=(samples, 2)).astype(float)

    # Add small noise for more interesting training
    inputs += np.random.normal(0, 0.05, inputs.shape)
    inputs = np.clip(inputs, 0, 1)

    # Compute labels based on gate type
    if gate_type == 'xor':
        labels = (inputs[:, 0] > 0.5).astype(int) ^ (inputs[:, 1] > 0.5).astype(int)
    elif gate_type == 'and':
        labels = ((inputs[:, 0] > 0.5) & (inputs[:, 1] > 0.5)).astype(int)
    elif gate_type == 'or':
        labels = ((inputs[:, 0] > 0.5) | (inputs[:, 1] > 0.5)).astype(int)
    else:
        raise ValueError(f"Unknown gate type: {gate_type}")

    return inputs, labels.astype(float)


def generate_iris_dataset() -> Tuple[np.ndarray, np.ndarray]:
    """
    Load the Iris dataset.

    Returns:
        inputs: (150, 4) array
        labels: (150, 3) one-hot encoded array
    """
    iris = load_iris()
    inputs = iris.data.astype(float)

    # Convert to one-hot encoding
    from sklearn.preprocessing import OneHotEncoder
    encoder = OneHotEncoder(sparse_output=False)
    labels = encoder.fit_transform(iris.target.reshape(-1, 1))

    return inputs, labels


def generate_simplified_mnist(samples: int = 1000) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate a simplified MNIST-like dataset using random patterns.

    This creates 8x8 pixel images (like digits dataset) for classification.

    Returns:
        inputs: (samples, 64) array
        labels: (samples, 10) one-hot encoded array
    """
    from sklearn.datasets import load_digits
    digits = load_digits()

    # Limit samples and normalize
    n_samples = min(samples, len(digits.data))
    inputs = digits.data[:n_samples].astype(float) / 16.0  # Normalize to [0, 1]

    # One-hot encode labels
    from sklearn.preprocessing import OneHotEncoder
    encoder = OneHotEncoder(sparse_output=False)
    labels = encoder.fit_transform(digits.target[:n_samples].reshape(-1, 1))

    return inputs, labels


def generate_moons_dataset(samples: int = 500, noise: float = 0.1) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate two moons dataset.

    Args:
        samples: number of samples
        noise: standard deviation of Gaussian noise

    Returns:
        inputs: (samples, 2) array
        labels: (samples,) array with values 0 or 1
    """
    inputs, labels = make_moons(n_samples=samples, noise=noise, random_state=42)
    return inputs.astype(float), labels.astype(float)


def generate_circles_dataset(samples: int = 500, noise: float = 0.05) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate concentric circles dataset.

    Args:
        samples: number of samples
        noise: standard deviation of Gaussian noise

    Returns:
        inputs: (samples, 2) array
        labels: (samples,) array with values 0 or 1
    """
    inputs, labels = make_circles(n_samples=samples, noise=noise, factor=0.5, random_state=42)
    return inputs.astype(float), labels.astype(float)


def generate_breast_cancer_dataset() -> Tuple[np.ndarray, np.ndarray]:
    """
    Load the Breast Cancer Wisconsin dataset.

    Returns:
        inputs: (569, 30) array - features from digitized images
        labels: (569, 2) one-hot encoded array (malignant/benign)
    """
    cancer = load_breast_cancer()
    inputs = cancer.data.astype(float)

    # Normalize features to [0, 1] range
    from sklearn.preprocessing import MinMaxScaler
    scaler = MinMaxScaler()
    inputs = scaler.fit_transform(inputs)

    # Convert to one-hot encoding (0: malignant, 1: benign)
    from sklearn.preprocessing import OneHotEncoder
    encoder = OneHotEncoder(sparse_output=False)
    labels = encoder.fit_transform(cancer.target.reshape(-1, 1))

    return inputs, labels


def generate_wine_dataset() -> Tuple[np.ndarray, np.ndarray]:
    """
    Load the Wine dataset for classification.

    Returns:
        inputs: (178, 13) array - chemical analysis results
        labels: (178, 3) one-hot encoded array (3 wine classes)
    """
    wine = load_wine()
    inputs = wine.data.astype(float)

    # Normalize features to [0, 1] range
    from sklearn.preprocessing import MinMaxScaler
    scaler = MinMaxScaler()
    inputs = scaler.fit_transform(inputs)

    # Convert to one-hot encoding
    from sklearn.preprocessing import OneHotEncoder
    encoder = OneHotEncoder(sparse_output=False)
    labels = encoder.fit_transform(wine.target.reshape(-1, 1))

    return inputs, labels


def get_all_classification_datasets() -> Dict[str, Dict]:
    """Get all available classification datasets."""
    return {
        'xor': {
            'name': 'xor',
            'type': 'classification',
            'description': 'XOR逻辑门数据集 - 经典的非线性分类问题',
            'feature_names': ['Input 1', 'Input 2'],
            'generator': lambda: generate_logic_gate_dataset('xor')
        },
        'and': {
            'name': 'and',
            'type': 'classification',
            'description': 'AND逻辑门数据集 - 线性可分',
            'feature_names': ['Input 1', 'Input 2'],
            'generator': lambda: generate_logic_gate_dataset('and')
        },
        'or': {
            'name': 'or',
            'type': 'classification',
            'description': 'OR逻辑门数据集 - 线性可分',
            'feature_names': ['Input 1', 'Input 2'],
            'generator': lambda: generate_logic_gate_dataset('or')
        },
        'iris': {
            'name': 'iris',
            'type': 'classification',
            'description': '鸢尾花数据集 - 经典多分类问题，包含3种鸢尾花的4个特征',
            'feature_names': ['Sepal Length', 'Sepal Width', 'Petal Length', 'Petal Width'],
            'generator': generate_iris_dataset
        },
        'mnist_simple': {
            'name': 'mnist_simple',
            'type': 'classification',
            'description': '简化手写数字数据集 - 8x8像素图像分类',
            'feature_names': [f'Pixel {i}' for i in range(64)],
            'generator': lambda: generate_simplified_mnist(1000)
        },
        'moons': {
            'name': 'moons',
            'type': 'classification',
            'description': '月亮数据集 - 非线性可分的两个月牙形状',
            'feature_names': ['Feature 1', 'Feature 2'],
            'generator': lambda: generate_moons_dataset(500)
        },
        'circles': {
            'name': 'circles',
            'type': 'classification',
            'description': '圆形数据集 - 同心圆分类问题',
            'feature_names': ['Feature 1', 'Feature 2'],
            'generator': lambda: generate_circles_dataset(500)
        },
        'breast_cancer': {
            'name': 'breast_cancer',
            'type': 'classification',
            'description': '乳腺癌数据集 - 基于细胞特征诊断恶性肿瘤',
            'feature_names': [
                'Mean Radius', 'Mean Texture', 'Mean Perimeter', 'Mean Area',
                'Mean Smoothness', 'Mean Compactness', 'Mean Concavity', 'Mean Concave Points',
                'Mean Symmetry', 'Mean Fractal Dimension', 'Radius SE', 'Texture SE',
                'Perimeter SE', 'Area SE', 'Smoothness SE', 'Compactness SE',
                'Concavity SE', 'Concave Points SE', 'Symmetry SE', 'Fractal Dimension SE',
                'Worst Radius', 'Worst Texture', 'Worst Perimeter', 'Worst Area',
                'Worst Smoothness', 'Worst Compactness', 'Worst Concavity',
                'Worst Concave Points', 'Worst Symmetry', 'Worst Fractal Dimension'
            ],
            'generator': generate_breast_cancer_dataset
        },
        'wine': {
            'name': 'wine',
            'type': 'classification',
            'description': '葡萄酒数据集 - 基于化学分析识别葡萄酒产地',
            'feature_names': [
                'Alcohol', 'Malic Acid', 'Ash', 'Alcalinity of Ash',
                'Magnesium', 'Total Phenols', 'Flavanoids', 'Nonflavanoid Phenols',
                'Proanthocyanins', 'Color Intensity', 'Hue', 'OD280/OD315', 'Proline'
            ],
            'generator': generate_wine_dataset
        }
    }


def load_classification_dataset(name: str, train_ratio: float = 0.8) -> Dict:
    """
    Load a specific classification dataset and split into train/test.

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
    datasets = get_all_classification_datasets()

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
            'type': 'classification',
            'description': dataset_info['description'],
            'features': inputs.shape[1],
            'samples': len(inputs),
            'classes': labels.shape[1] if len(labels.shape) > 1 else len(np.unique(labels)),
            'feature_names': dataset_info['feature_names']
        }
    }


def _list_cached_datasets() -> list:
    """列出缓存目录中可用的数据集"""
    if not os.path.exists(CACHE_DIR):
        return []
    cached_files = [f.replace('.npz', '') for f in os.listdir(CACHE_DIR) if f.endswith('.npz')]
    return sorted(cached_files)
