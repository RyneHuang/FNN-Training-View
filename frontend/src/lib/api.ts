/** API 客户端 - 所有与后端的交互 */
import type { DatasetInfo, Dataset } from '@/types/dataset';
import type { LayerConfig, ModelConfig } from '@/types/neural';

const API_BASE_URL = '/api';

// ========== 数据集 API ==========
export const datasetApi = {
  /** 获取所有可用数据集 */
  async list(): Promise<DatasetInfo[]> {
    const response = await fetch(`${API_BASE_URL}/datasets`, {
      credentials: 'include'  // 支持 cookie
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Failed to fetch datasets');
    }
    const data = await response.json();
    // 转换后端命名到前端命名（feature_names -> featureNames）
    return data.datasets.map((d: any) => ({
      ...d,
      featureNames: d.feature_names || []
    }));
  },

  /** 获取指定数据集 */
  async get(name: string): Promise<Dataset> {
    const response = await fetch(`${API_BASE_URL}/datasets/${name}`, {
      credentials: 'include'  // 支持 cookie
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Failed to fetch dataset: ${name}`);
    }
    const data = await response.json();
    // 转换后端格式到前端期望的格式
    return {
      name: data.name,
      train: {
        inputs: data.train_inputs,
        labels: data.train_labels
      },
      test: {
        inputs: data.test_inputs,
        labels: data.test_labels
      },
      metadata: {
        ...data.metadata,
        featureNames: data.metadata.feature_names || []
      }
    };
  },
};

// ========== 训练 API ==========
export interface CreateModelRequest {
  config: {
    layers: LayerConfig[];
    optimizer: string;
    learning_rate: number;
    loss_function: string;
  };
  dataset_name: string;
}

export interface CreateModelResponse {
  model_id: string;
  config: ModelConfig;
  input_shape: number[];
}

export interface TrainingConfig {
  model_id: string;
  epochs: number;
  batch_size: number;
  validation_split: number;
}

export interface TrainingResponse {
  model_id: string;
  status: 'training' | 'completed' | 'error' | 'idle';
  history?: {
    loss: number[];
    accuracy: number[];
    val_loss: number[];
    val_accuracy: number[];
  };
  message?: string;
}

export const trainingApi = {
  /** 创建模型 */
  async create(request: CreateModelRequest): Promise<CreateModelResponse> {
    const response = await fetch(`${API_BASE_URL}/training/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // 支持 cookie
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create model');
    }
    return await response.json();
  },

  /** 开始训练 */
  async start(config: TrainingConfig): Promise<TrainingResponse> {
    const response = await fetch(`${API_BASE_URL}/training/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // 支持 cookie
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      const error = await response.json();
      // 提取更有用的错误信息
      const detail = error.detail || '';
      // 如果是TensorFlow错误，尝试提取关键信息
      if (typeof detail === 'string' && detail.includes('ValueError')) {
        const match = detail.match(/ValueError: ([^\n]+)/);
        if (match) throw new Error(match[1]);
      }
      throw new Error(typeof detail === 'string' ? detail : 'Failed to start training');
    }
    return await response.json();
  },

  /** 获取训练状态 */
  async getStatus(modelId: string): Promise<TrainingResponse> {
    const response = await fetch(`${API_BASE_URL}/training/status/${modelId}`, {
      credentials: 'include'  // 支持 cookie
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get training status');
    }
    return await response.json();
  },

  /** 停止训练 */
  async stop(modelId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/training/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // 支持 cookie
      body: JSON.stringify({ model_id: modelId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to stop training');
    }
  },

  /** 删除模型 */
  async delete(modelId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/training/model/${modelId}`, {
      method: 'DELETE',
      credentials: 'include'  // 支持 cookie
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete model');
    }
  },
};

// ========== 推理 API ==========
export interface InferenceRequest {
  model_id: string;
  inputs: number[];
}

export interface InferenceResponse {
  prediction: number[];
  intermediate_outputs: Array<{
    layer_name: string;
    layer_index: number;
    values: number[];
    shape: number[];
  }>;
  is_classification: boolean;
}

export const inferenceApi = {
  /** 执行推理 */
  async predict(request: InferenceRequest): Promise<InferenceResponse> {
    const response = await fetch(`${API_BASE_URL}/inference/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',  // 支持 cookie
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to predict');
    }
    return await response.json();
  },

  /** 获取模型信息 */
  async getModelInfo(modelId: string) {
    const response = await fetch(`${API_BASE_URL}/inference/model/${modelId}`, {
      credentials: 'include'  // 支持 cookie
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get model info');
    }
    return await response.json();
  },
};
