"""神经网络模型构建和管理"""
import numpy as np
import tensorflow as tf
from tensorflow import keras
from typing import List, Dict, Any, Optional
import json
import uuid
import logging

logger = logging.getLogger(__name__)


class ModelManager:
    """管理神经网络模型的创建、训练和推理 - 支持多用户 session 隔离"""

    def __init__(self):
        # 嵌套字典结构：{session_id: {model_id: model}}
        self.models: Dict[str, Dict[str, keras.Model]] = {}
        self.model_configs: Dict[str, Dict[str, Dict]] = {}

        # 配置 GPU 显存增长模式（按需分配，而不是占用所有显存）
        self._configure_gpu_memory()

    def _configure_gpu_memory(self):
        """配置 GPU 显存增长模式，支持多用户并发训练"""
        try:
            gpus = tf.config.list_physical_devices('GPU')
            if gpus:
                for gpu in gpus:
                    try:
                        tf.config.experimental.set_memory_growth(gpu, True)
                        logger.info(f"GPU {gpu.name}: 显存增长模式已启用")
                    except RuntimeError as e:
                        logger.warning(f"GPU {gpu.name}: 配置显存增长失败: {e}")

                # 设置虚拟 GPU 内存限制（可选，用于多用户隔离）
                # 每个用户最多使用 2GB 显存
                # self._set_virtual_gpus(gpus, memory_limit=2048)

                logger.info(f"检测到 {len(gpus)} 个 GPU，已配置显存管理")
            else:
                logger.info("未检测到 GPU，使用 CPU 训练")
        except Exception as e:
            logger.warning(f"GPU 配置失败: {e}")

    def _set_virtual_gpus(self, gpus, memory_limit: int = 2048):
        """
        设置虚拟 GPU，用于多用户显存隔离

        Args:
            gpus: 物理GPU列表
            memory_limit: 每个虚拟GPU的显存限制（MB）
        """
        if not gpus:
            return

        try:
            # 在第一个GPU上创建虚拟GPU
            tf.config.set_logical_device_configuration(
                gpus[0],
                [tf.config.LogicalDeviceConfiguration(
                    memory_limit=memory_limit,
                    # 可以为每个用户创建独立的虚拟GPU
                )]
            )
            logger.info(f"已配置虚拟 GPU，每个实例显存限制: {memory_limit}MB")
        except RuntimeError as e:
            logger.warning(f"虚拟 GPU 配置失败: {e}")

    def cleanup_gpu_memory(self):
        """清理 GPU 显存"""
        try:
            keras.backend.clear_session()
            logger.info("已清理 Keras 会话和 GPU 显存")
        except Exception as e:
            logger.warning(f"清理 GPU 显存失败: {e}")

    def _ensure_session(self, session_id: str):
        """确保 session 存在"""
        if session_id not in self.models:
            self.models[session_id] = {}
            self.model_configs[session_id] = {}

    def build_model(self, config: Dict, input_shape: tuple) -> keras.Model:
        """
        构建神经网络模型

        Args:
            config: 模型配置
            input_shape: 输入形状

        Returns:
            编译好的Keras模型
        """
        model = keras.Sequential()

        layers = config.get('layers', [])
        if not layers:
            raise ValueError("模型必须至少有一层")

        # 输入层 + 第一隐藏层
        first_layer = layers[0]
        model.add(keras.layers.Dense(
            units=first_layer['units'],
            activation=self._normalize_activation(first_layer['activation']),
            use_bias=first_layer.get('useBias', True),
            input_shape=(input_shape[-1],),
            name='layer_0'
        ))

        # 后续层
        for i, layer_config in enumerate(layers[1:], 1):
            model.add(keras.layers.Dense(
                units=layer_config['units'],
                activation=self._normalize_activation(layer_config['activation']),
                use_bias=layer_config.get('useBias', True),
                name=f'layer_{i}'
            ))

        # 编译模型
        optimizer = self._create_optimizer(
            config.get('optimizer', 'adam'),
            config.get('learningRate', 0.001)
        )

        # 转换损失函数名称为Keras格式
        loss_function = self._normalize_loss_function(config.get('lossFunction', 'mse'))

        # 根据损失函数类型决定是否使用accuracy指标
        # 回归问题（mse）不需要accuracy，分类问题需要
        is_classification = 'crossentropy' in loss_function.lower()
        metrics = ['accuracy'] if is_classification else []

        model.compile(
            optimizer=optimizer,
            loss=loss_function,
            metrics=metrics
        )

        return model

    def _normalize_activation(self, activation: str) -> str:
        """将前端格式的激活函数名转换为Keras格式"""
        activation_mapping = {
            'relu': 'relu',
            'sigmoid': 'sigmoid',
            'tanh': 'tanh',
            'linear': 'linear',
            'softmax': 'softmax',
            'leakyRelu': 'leaky_relu'  # Keras使用leaky_relu
        }
        return activation_mapping.get(activation, activation)

    def _normalize_loss_function(self, loss_name: str) -> str:
        """将前端格式的损失函数名转换为Keras格式"""
        loss_mapping = {
            'mse': 'mse',
            'binaryCrossentropy': 'binary_crossentropy',
            'categoricalCrossentropy': 'categorical_crossentropy',
            'meanSquaredError': 'mse',
            'binary_crossentropy': 'binary_crossentropy',
            'categorical_crossentropy': 'categorical_crossentropy'
        }
        return loss_mapping.get(loss_name, loss_name)

    def _create_optimizer(self, optimizer_name: str, learning_rate: float):
        """创建优化器"""
        optimizer_name = optimizer_name.lower()
        if optimizer_name == 'adam':
            return keras.optimizers.Adam(learning_rate=learning_rate)
        elif optimizer_name == 'sgd':
            return keras.optimizers.SGD(learning_rate=learning_rate)
        elif optimizer_name == 'rmsprop':
            return keras.optimizers.RMSprop(learning_rate=learning_rate)
        elif optimizer_name == 'adamax':
            return keras.optimizers.Adamax(learning_rate=learning_rate)
        else:
            return keras.optimizers.Adam(learning_rate=learning_rate)

    def train_model(
        self,
        model: keras.Model,
        train_data: np.ndarray,
        train_labels: np.ndarray,
        epochs: int = 100,
        batch_size: int = 32,
        validation_split: float = 0.2
    ) -> Dict[str, Any]:
        """
        训练模型

        Returns:
            训练历史记录
        """
        history = model.fit(
            train_data,
            train_labels,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            verbose=1
        )

        return {
            'loss': [float(x) for x in history.history['loss']],
            'accuracy': [float(x) for x in history.history.get('accuracy', [])],
            'val_loss': [float(x) for x in history.history.get('val_loss', [])],
            'val_accuracy': [float(x) for x in history.history.get('val_accuracy', [])]
        }

    def predict(self, model: keras.Model, input_data: np.ndarray) -> np.ndarray:
        """执行推理"""
        return model.predict(input_data, verbose=0)

    def get_intermediate_outputs(
        self,
        model: keras.Model,
        input_data: np.ndarray
    ) -> List[Dict[str, Any]]:
        """获取中间层输出"""
        outputs = []

        for i, layer in enumerate(model.layers):
            # 创建一个模型，输出当前层的输出
            intermediate_model = keras.Model(
                inputs=model.inputs,
                outputs=layer.output
            )

            layer_output = intermediate_model.predict(input_data, verbose=0)
            outputs.append({
                'layerName': layer.name,
                'layerIndex': i,
                'values': layer_output.flatten().tolist(),
                'shape': list(layer_output.shape)
            })

        return outputs

    def save_model(self, model: keras.Model, model_id: str) -> str:
        """保存模型"""
        model_path = f"/tmp/model_{model_id}.keras"
        model.save(model_path)
        return model_path

    def load_model(self, model_path: str) -> keras.Model:
        """加载模型"""
        return keras.models.load_model(model_path)

    def create_model_id(self) -> str:
        """创建唯一的模型ID"""
        return str(uuid.uuid4())

    def register_model(self, session_id: str, model_id: str, model: keras.Model, config: Dict):
        """注册模型到管理器（带 session 隔离）"""
        self._ensure_session(session_id)
        self.models[session_id][model_id] = model
        self.model_configs[session_id][model_id] = config

    def get_model(self, session_id: str, model_id: str) -> Optional[keras.Model]:
        """获取已注册的模型（带 session 隔离）"""
        if session_id not in self.models:
            return None
        return self.models[session_id].get(model_id)

    def get_model_config(self, session_id: str, model_id: str) -> Optional[Dict]:
        """获取模型配置（带 session 隔离）"""
        if session_id not in self.model_configs:
            return None
        return self.model_configs[session_id].get(model_id)

    def remove_model(self, session_id: str, model_id: str):
        """移除模型（带 session 隔离）并清理 GPU 显存"""
        if session_id in self.models and model_id in self.models[session_id]:
            # 显式删除 Keras 模型以释放 GPU 显存
            model = self.models[session_id][model_id]
            try:
                del model
            except:
                pass
            del self.models[session_id][model_id]

        if session_id in self.model_configs and model_id in self.model_configs[session_id]:
            del self.model_configs[session_id][model_id]

        # 清理 Keras 会话以释放 GPU 显存
        self.cleanup_gpu_memory()

    def get_session_models(self, session_id: str) -> List[str]:
        """获取 session 中的所有模型 ID"""
        if session_id not in self.models:
            return []
        return list(self.models[session_id].keys())

    def clear_session(self, session_id: str):
        """清除 session 中的所有模型并清理 GPU 显存"""
        if session_id in self.models:
            # 显式删除所有 Keras 模型
            for model_id, model in self.models[session_id].items():
                try:
                    del model
                except:
                    pass
            self.models[session_id].clear()
        if session_id in self.model_configs:
            self.model_configs[session_id].clear()

        # 清理 Keras 会话以释放 GPU 显存
        self.cleanup_gpu_memory()


# 全局模型管理器实例
model_manager = ModelManager()
