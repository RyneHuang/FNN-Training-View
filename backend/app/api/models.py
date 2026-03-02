"""API 数据模型"""
from typing import List, Optional, Union
from pydantic import BaseModel


# ========== 数据集相关 ==========
class DatasetInfo(BaseModel):
    """数据集信息"""
    name: str
    type: str  # 'classification' | 'regression'
    description: str
    features: int
    samples: int
    classes: Optional[int] = None
    feature_names: List[str]


class DatasetData(BaseModel):
    """完整数据集"""
    name: str
    train_inputs: List[List[float]]
    train_labels: List[Union[float, List[float]]]
    test_inputs: List[List[float]]
    test_labels: List[Union[float, List[float]]]
    metadata: DatasetInfo


class DatasetsResponse(BaseModel):
    """数据集列表响应"""
    datasets: List[DatasetInfo]


# ========== 模型相关 ==========
class LayerConfig(BaseModel):
    """层配置"""
    units: int
    activation: str
    use_bias: bool = True


class ModelConfig(BaseModel):
    """模型配置"""
    layers: List[LayerConfig]
    optimizer: str = 'adam'
    learning_rate: float = 0.001
    loss_function: str = 'mse'


class CreateModelRequest(BaseModel):
    """创建模型请求"""
    config: ModelConfig
    dataset_name: str


class CreateModelResponse(BaseModel):
    """创建模型响应"""
    model_id: str
    config: ModelConfig
    input_shape: List[int]


# ========== 训练相关 ==========
class TrainingConfig(BaseModel):
    """训练配置"""
    model_config = {"protected_namespaces": ()}
    model_id: str
    epochs: int = 100
    batch_size: int = 32
    validation_split: float = 0.2


class TrainingProgress(BaseModel):
    """训练进度"""
    epoch: int
    total_epochs: int
    loss: float
    accuracy: Optional[float] = None
    val_loss: Optional[float] = None
    val_accuracy: Optional[float] = None


class TrainingHistory(BaseModel):
    """训练历史"""
    loss: List[float]
    accuracy: List[float]
    val_loss: List[float]
    val_accuracy: List[float]


class TrainingResponse(BaseModel):
    """训练响应"""
    model_id: str
    status: str  # 'training', 'completed', 'error'
    history: Optional[TrainingHistory] = None
    message: Optional[str] = None


# ========== 推理相关 ==========
class InferenceRequest(BaseModel):
    """推理请求"""
    model_id: str
    inputs: List[float]


class LayerOutput(BaseModel):
    """层输出"""
    layer_name: str
    layer_index: int
    values: List[float]
    shape: List[int]


class InferenceResponse(BaseModel):
    """推理响应"""
    prediction: List[float]
    intermediate_outputs: List[LayerOutput]
    is_classification: bool
