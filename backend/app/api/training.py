"""训练API路由 - 异步后台训练（支持多用户 session 隔离）"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict
import numpy as np
import sys
import os
import threading
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.api.models import (
    CreateModelRequest, CreateModelResponse,
    TrainingConfig, TrainingResponse, TrainingHistory,
    ModelConfig
)
from app.api.dependencies import get_session_id
from app.data.classification import load_classification_dataset
from app.data.regression import load_regression_dataset
from app.utils.model import model_manager

router = APIRouter(prefix="/api/training", tags=["training"])

# 存储训练状态（嵌套字典结构：{session_id: {model_id: status}}）
training_status: Dict[str, Dict[str, str]] = {}
training_progress: Dict[str, Dict[str, dict]] = {}


def _ensure_session_state(session_id: str):
    """确保 session 状态字典存在"""
    if session_id not in training_status:
        training_status[session_id] = {}
        training_progress[session_id] = {}


def train_in_background(
    session_id: str,
    model_id: str,
    model,
    train_inputs: np.ndarray,
    train_labels: np.ndarray,
    epochs: int,
    batch_size: int,
    validation_split: float
):
    """后台训练函数 - 使用Keras fit with custom callback"""
    try:
        import tensorflow as tf
        from tensorflow import keras

        # 自定义回调，每轮更新进度
        class ProgressCallback(keras.callbacks.Callback):
            def __init__(self, session_id, model_id):
                super().__init__()
                self.session_id = session_id
                self.model_id = model_id

            def on_epoch_end(self, epoch, logs=None):
                logs = logs or {}

                # 确保 session 状态存在
                _ensure_session_state(self.session_id)

                # 确保 progress 字典存在
                if self.model_id not in training_progress[self.session_id]:
                    training_progress[self.session_id][self.model_id] = {
                        'loss': [],
                        'accuracy': [],
                        'val_loss': [],
                        'val_accuracy': []
                    }

                progress = training_progress[self.session_id][self.model_id]

                # 添加当前epoch的数据
                progress['loss'].append(float(logs.get('loss', 0)))
                if 'accuracy' in logs:
                    progress['accuracy'].append(float(logs['accuracy']))
                else:
                    progress['accuracy'].append(0.0)

                if 'val_loss' in logs:
                    progress['val_loss'].append(float(logs['val_loss']))
                else:
                    if len(progress['loss']) > len(progress['val_loss']):
                        progress['val_loss'].append(0.0)

                if 'val_accuracy' in logs:
                    progress['val_accuracy'].append(float(logs['val_accuracy']))
                else:
                    if len(progress['accuracy']) > len(progress['val_accuracy']):
                        progress['val_accuracy'].append(0.0)

        # 创建回调列表
        callbacks = [ProgressCallback(session_id, model_id)]

        # 使用Keras的fit方法
        model.fit(
            train_inputs,
            train_labels,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            callbacks=callbacks,
            verbose=0  # 关闭输出
        )

        training_status[session_id][model_id] = 'completed'

        # 训练完成后清理 GPU 显存（保留模型以便推理）
        # 注意：模型仍保留在 model_manager 中，可以继续用于推理
        # 但清理会话可以释放训练过程中的临时张量
        try:
            import tensorflow as tf
            from tensorflow import keras
            keras.backend.clear_session()
        except:
            pass

    except Exception as e:
        import traceback
        error_msg = str(e)
        print(f"Training error: {error_msg}")
        print(traceback.format_exc())
        _ensure_session_state(session_id)
        training_status[session_id][model_id] = 'error'
        training_progress[session_id][model_id] = {
            'error': error_msg
        }


@router.post("/create", response_model=CreateModelResponse)
async def create_model(
    request: CreateModelRequest,
    session_id: str = Depends(get_session_id)
):
    """创建一个新的神经网络模型（带 session 隔离）"""
    try:
        # 加载数据集获取输入形状
        classification_datasets = ['xor', 'and', 'or', 'iris', 'mnist_simple', 'moons', 'circles', 'breast_cancer', 'wine']
        regression_datasets = ['linear', 'sine', 'polynomial', 'exponential', 'multilinear', 'california_housing', 'diabetes']

        if request.dataset_name in classification_datasets:
            data = load_classification_dataset(request.dataset_name)
        elif request.dataset_name in regression_datasets:
            data = load_regression_dataset(request.dataset_name)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown dataset: {request.dataset_name}")

        input_shape = [len(data['train_inputs']), len(data['train_inputs'][0])]

        # 转换配置格式
        layers_config = [
            {
                'units': layer.units,
                'activation': layer.activation,
                'useBias': layer.use_bias
            }
            for layer in request.config.layers
        ]

        model_config = {
            'layers': layers_config,
            'optimizer': request.config.optimizer,
            'learningRate': request.config.learning_rate,
            'lossFunction': request.config.loss_function
        }

        # 构建模型
        model = model_manager.build_model(model_config, tuple(input_shape))

        # 生成模型ID并注册（带 session 隔离）
        model_id = model_manager.create_model_id()
        model_manager.register_model(
            session_id,
            model_id,
            model,
            {**model_config, 'dataset_name': request.dataset_name}
        )

        # 存储数据供训练使用
        model_manager.get_model_config(session_id, model_id)['train_data'] = {
            'inputs': np.array(data['train_inputs']),
            'labels': np.array(data['train_labels'])
        }
        model_manager.get_model_config(session_id, model_id)['dataset_type'] = data['metadata']['type']

        return CreateModelResponse(
            model_id=model_id,
            config=request.config,
            input_shape=input_shape
        )

    except Exception as e:
        import traceback
        error_msg = f"{str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_msg[:500])


@router.post("/start", response_model=TrainingResponse)
async def start_training(
    config: TrainingConfig,
    session_id: str = Depends(get_session_id)
):
    """开始训练模型 - 异步后台训练（带 session 隔离）"""
    model = model_manager.get_model(session_id, config.model_id)
    if model is None:
        raise HTTPException(status_code=404, detail="模型不存在")

    model_config = model_manager.get_model_config(session_id, config.model_id)
    if model_config is None:
        raise HTTPException(status_code=404, detail="模型配置不存在")

    train_data = model_config.get('train_data')
    if train_data is None:
        raise HTTPException(status_code=400, detail="训练数据未加载")

    # 确保 session 状态存在
    _ensure_session_state(session_id)

    # 检查是否已经在训练
    current_status = training_status[session_id].get(config.model_id)
    if current_status == 'training':
        raise HTTPException(status_code=400, detail="模型正在训练中")

    try:
        # 初始化训练状态
        training_status[session_id][config.model_id] = 'training'
        training_progress[session_id][config.model_id] = {
            'loss': [],
            'accuracy': [],
            'val_loss': [],
            'val_accuracy': []
        }

        # 在后台线程启动训练
        thread = threading.Thread(
            target=train_in_background,
            args=(
                session_id,
                config.model_id,
                model,
                train_data['inputs'],
                train_data['labels'],
                config.epochs,
                config.batch_size,
                config.validation_split
            ),
            daemon=True
        )
        thread.start()

        # 立即返回，不等待训练完成
        return TrainingResponse(
            model_id=config.model_id,
            status='training',
            message='训练已启动'
        )

    except Exception as e:
        training_status[session_id][config.model_id] = 'error'
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{model_id}", response_model=TrainingResponse)
async def get_training_status(
    model_id: str,
    session_id: str = Depends(get_session_id)
):
    """获取训练状态（带 session 隔离）"""
    # 只返回当前 session 的状态
    if session_id not in training_status:
        return TrainingResponse(
            model_id=model_id,
            status='idle',
            message='模型不存在'
        )

    status = training_status[session_id].get(model_id, 'idle')
    progress_data = training_progress[session_id].get(model_id)

    # 检查是否有错误
    if progress_data and 'error' in progress_data:
        return TrainingResponse(
            model_id=model_id,
            status='error',
            message=progress_data['error']
        )

    history = None
    # 只有当有进度数据时才构建history
    if progress_data and isinstance(progress_data, dict) and 'loss' in progress_data:
        history = TrainingHistory(
            loss=progress_data.get('loss', []),
            accuracy=progress_data.get('accuracy', []),
            val_loss=progress_data.get('val_loss', []),
            val_accuracy=progress_data.get('val_accuracy', [])
        )

    return TrainingResponse(
        model_id=model_id,
        status=status,
        history=history
    )


@router.post("/stop")
async def stop_training(
    request: dict,
    session_id: str = Depends(get_session_id)
):
    """停止训练（带 session 隔离）"""
    model_id = request.get('model_id')
    if not model_id:
        raise HTTPException(status_code=400, detail="缺少model_id")

    # 确保 session 状态存在
    _ensure_session_state(session_id)

    if model_id not in training_status[session_id]:
        raise HTTPException(status_code=404, detail="训练任务不存在")

    training_status[session_id][model_id] = 'stopped'
    return {"message": "训练已停止"}


@router.delete("/model/{model_id}")
async def delete_model(
    model_id: str,
    session_id: str = Depends(get_session_id)
):
    """删除模型并释放资源（带 session 隔离）"""
    model_manager.remove_model(session_id, model_id)

    # 清理训练状态
    if session_id in training_status and model_id in training_status[session_id]:
        del training_status[session_id][model_id]
    if session_id in training_progress and model_id in training_progress[session_id]:
        del training_progress[session_id][model_id]

    return {"message": "模型已删除"}
