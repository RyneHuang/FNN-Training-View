"""推理API路由（支持多用户 session 隔离）"""
from fastapi import APIRouter, HTTPException, Depends
import numpy as np
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.api.models import InferenceRequest, InferenceResponse, LayerOutput
from app.api.dependencies import get_session_id
from app.utils.model import model_manager

router = APIRouter(prefix="/api/inference", tags=["inference"])


@router.post("/predict", response_model=InferenceResponse)
async def predict(
    request: InferenceRequest,
    session_id: str = Depends(get_session_id)
):
    """
    执行推理（带 session 隔离）

    对输入数据进行预测，并返回中间层输出
    只能访问当前 session 训练的模型
    """
    model = model_manager.get_model(session_id, request.model_id)
    if model is None:
        raise HTTPException(status_code=404, detail="模型不存在或无权访问")

    model_config = model_manager.get_model_config(session_id, request.model_id)
    if model_config is None:
        raise HTTPException(status_code=404, detail="模型配置不存在")

    try:
        # 准备输入数据
        input_data = np.array([request.inputs])

        # 执行预测
        prediction = model_manager.predict(model, input_data)
        prediction_list = prediction.flatten().tolist()

        # 获取中间层输出
        intermediate_outputs = model_manager.get_intermediate_outputs(model, input_data)

        # 判断是否为分类问题
        is_classification = model_config.get('dataset_type') == 'classification'

        return InferenceResponse(
            prediction=prediction_list,
            intermediate_outputs=[
                LayerOutput(
                    layer_name=io['layerName'],
                    layer_index=io['layerIndex'],
                    values=io['values'],
                    shape=io['shape']
                )
                for io in intermediate_outputs
            ],
            is_classification=is_classification
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"推理失败: {str(e)}")


@router.get("/model/{model_id}")
async def get_model_info(
    model_id: str,
    session_id: str = Depends(get_session_id)
):
    """
    获取模型信息（带 session 隔离）

    返回模型的结构和配置
    只能访问当前 session 训练的模型
    """
    model = model_manager.get_model(session_id, model_id)
    if model is None:
        raise HTTPException(status_code=404, detail="模型不存在或无权访问")

    model_config = model_manager.get_model_config(session_id, model_id)

    layers_info = []
    for i, layer in enumerate(model.layers):
        # 获取激活函数名称
        activation = None
        if hasattr(layer, 'activation'):
            if callable(layer.activation):
                if hasattr(layer.activation, '__name__'):
                    activation = layer.activation.__name__
                else:
                    activation = str(layer.activation)
            else:
                activation = str(layer.activation)

        layer_info = {
            'index': i,
            'name': layer.name,
            'units': layer.units if hasattr(layer, 'units') else None,
            'activation': activation,
            'input_shape': list(layer.input_shape) if hasattr(layer, 'input_shape') else [],
            'output_shape': list(layer.output_shape) if hasattr(layer, 'output_shape') else []
        }
        layers_info.append(layer_info)

    return {
        'model_id': model_id,
        'layers': layers_info,
        'config': model_config
    }
