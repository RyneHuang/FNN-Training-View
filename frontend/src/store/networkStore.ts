/** 全局状态管理 - 使用 Zustand */
import { create } from 'zustand';
import type {
  ModelConfig,
  TrainingStatus,
  TrainingHistoryEntry,
  Dataset,
  LayerConfig
} from '@/types/neural';
import type { DatasetInfo } from '@/types/dataset';
import {
  datasetApi,
  trainingApi,
  inferenceApi,
  type CreateModelRequest,
  type TrainingConfig
} from '@/lib/api';

interface NetworkStore {
  // 模型配置
  modelConfig: ModelConfig | null;
  modelId: string | null;

  // 当前数据集
  dataset: Dataset | null;
  datasetInfo: DatasetInfo | null;

  // 训练状态
  trainingStatus: TrainingStatus;
  trainingHistory: TrainingHistoryEntry[];
  currentEpoch: number;

  // 轮询定时器
  pollInterval: NodeJS.Timeout | null;

  // 错误信息
  error: string | null;

  // 操作 - 模型配置
  setModelConfig: (config: ModelConfig) => void;
  addLayer: (layer: LayerConfig) => void;
  removeLayer: (index: number) => void;
  updateLayer: (index: number, layer: LayerConfig) => void;

  // 操作 - 数据集
  setDataset: (dataset: Dataset) => void;
  setDatasetInfo: (info: DatasetInfo) => void;
  loadDataset: (name: string) => Promise<void>;

  // 操作 - 训练
  createModel: () => Promise<void>;
  startTraining: () => Promise<void>;
  stopTraining: () => Promise<void>;
  resetTraining: () => void;
  pollTrainingStatus: () => void;

  // 操作 - 清理
  cleanup: () => void;

  // 操作 - 错误
  setError: (error: string | null) => void;
}

export const useNetworkStore = create<NetworkStore>((set, get) => ({
  // 初始状态
  modelConfig: null,
  modelId: null,
  dataset: null,
  datasetInfo: null,
  trainingStatus: 'idle',
  trainingHistory: [],
  currentEpoch: 0,
  pollInterval: null,
  error: null,

  // 设置模型配置
  setModelConfig: (config) => {
    set({
      modelConfig: config,
      modelId: null,
      trainingHistory: [],
      trainingStatus: 'idle',
      error: null
    });
  },

  // 添加层
  addLayer: (layer) => {
    const config = get().modelConfig;
    if (config) {
      set({
        modelConfig: {
          ...config,
          layers: [...config.layers, layer]
        }
      });
    }
  },

  // 删除层
  removeLayer: (index) => {
    const config = get().modelConfig;
    if (config && config.layers.length > 1) {
      set({
        modelConfig: {
          ...config,
          layers: config.layers.filter((_, i) => i !== index)
        }
      });
    }
  },

  // 更新层
  updateLayer: (index, layer) => {
    const config = get().modelConfig;
    if (config) {
      const newLayers = [...config.layers];
      newLayers[index] = layer;
      set({
        modelConfig: {
          ...config,
          layers: newLayers
        }
      });
    }
  },

  // 设置数据集
  setDataset: (dataset) => {
    set({
      dataset,
      trainingHistory: [],
      currentEpoch: 0,
      trainingStatus: 'idle',
      modelId: null,
      error: null
    });
  },

  // 设置数据集信息
  setDatasetInfo: (info) => {
    set({ datasetInfo: info });
  },

  // 加载数据集
  loadDataset: async (name: string) => {
    try {
      // 始终更新 datasetInfo，确保显示正确的数据集信息
      const datasets = await datasetApi.list();
      const found = datasets.find(d => d.name === name);
      if (found) {
        set({ datasetInfo: found });
      }

      const dataset = await datasetApi.get(name);
      set({
        dataset,
        modelId: null,
        trainingHistory: [],
        trainingStatus: 'idle',
        error: null
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '加载数据集失败' });
    }
  },

  // 创建模型
  createModel: async () => {
    const { modelConfig, datasetInfo } = get();

    if (!modelConfig || !datasetInfo) {
      set({ error: '请先配置模型并选择数据集' });
      return;
    }

    try {
      set({ error: null });

      const request: CreateModelRequest = {
        config: {
          layers: modelConfig.layers,
          optimizer: modelConfig.optimizer,
          learning_rate: modelConfig.learningRate,
          loss_function: modelConfig.lossFunction
        },
        dataset_name: datasetInfo.name
      };

      const response = await trainingApi.create(request);
      set({ modelId: response.model_id });

    } catch (error) {
      set({ error: error instanceof Error ? error.message : '创建模型失败' });
    }
  },

  // 开始训练
  startTraining: async () => {
    const { modelId, modelConfig } = get();

    if (!modelConfig?.training) {
      set({ error: '请先配置训练参数' });
      return;
    }

    try {
      console.log('startTraining: Setting status to training');
      set({
        error: null,
        trainingStatus: 'training',
        trainingHistory: [],
        currentEpoch: 0
      });

      // 如果模型不存在，先创建模型
      let currentModelId = modelId;
      if (!currentModelId) {
        console.log('startTraining: No modelId, creating model first');
        await get().createModel();
        currentModelId = get().modelId;
        if (!currentModelId) {
          throw new Error('创建模型失败');
        }
      }

      const config: TrainingConfig = {
        model_id: currentModelId,
        epochs: modelConfig.training.epochs,
        batch_size: modelConfig.training.batchSize,
        validation_split: modelConfig.training.validationSplit
      };

      // 启动训练
      console.log('startTraining: Calling trainingApi.start');
      await trainingApi.start(config);
      console.log('startTraining: Training started, calling pollTrainingStatus');

      // 开始轮询状态
      get().pollTrainingStatus();

    } catch (error) {
      console.error('startTraining: Error', error);
      set({
        error: error instanceof Error ? error.message : '训练失败',
        trainingStatus: 'idle'
      });
    }
  },

  // 轮询训练状态
  pollTrainingStatus: () => {
    const { modelId, pollInterval } = get();

    console.log('pollTrainingStatus: Starting, modelId=', modelId, 'existingInterval=', !!pollInterval);

    // 清除之前的定时器
    if (pollInterval) {
      clearInterval(pollInterval);
      console.log('pollTrainingStatus: Cleared existing interval');
    }

    const poll = async () => {
      console.log('Poll: Called, modelId=', get().modelId, 'status=', get().trainingStatus);
      const state = get();

      // 如果没有 modelId，停止轮询
      if (!state.modelId) {
        console.log('Poll skipped: no modelId');
        const currentInterval = get().pollInterval;
        if (currentInterval) {
          clearInterval(currentInterval);
          set({ pollInterval: null });
        }
        return;
      }

      // 如果已经不是训练状态，停止轮询
      if (state.trainingStatus !== 'training') {
        console.log('Poll stopping: status is', state.trainingStatus);
        const currentInterval = get().pollInterval;
        if (currentInterval) {
          clearInterval(currentInterval);
          set({ pollInterval: null });
        }
        return;
      }

      try {
        const response = await trainingApi.getStatus(state.modelId);

        console.log('Poll response:', response.status, 'history:', response.history ? response.history.loss?.length : 0);

        // 检查是否有新数据
        if (response.history && response.history.loss && response.history.loss.length > 0) {
          const history: TrainingHistoryEntry[] = response.history.loss.map((loss, i) => ({
            epoch: i + 1,
            loss: loss,
            accuracy: response.history.accuracy?.[i],
            valLoss: response.history.val_loss?.[i],
            valAccuracy: response.history.val_accuracy?.[i]
          }));

          // 只有当有新数据时才更新
          if (history.length > state.trainingHistory.length) {
            console.log('Updating history:', history.length, 'previous:', state.trainingHistory.length);
            set({
              trainingHistory: history,
              currentEpoch: history.length
            });
          }
        }

        // 检查训练状态
        if (response.status === 'completed') {
          console.log('Training completed! Updating status...');
          const currentInterval = get().pollInterval;
          if (currentInterval) {
            clearInterval(currentInterval);
            set({ pollInterval: null });
          }
          set({ trainingStatus: 'completed' });
          console.log('Status updated to completed. TrainingStatus:', get().trainingStatus);
          return;
        } else if (response.status === 'error') {
          const errorMsg = response.message || '训练失败';
          console.error('Training error:', errorMsg);
          const currentInterval = get().pollInterval;
          if (currentInterval) {
            clearInterval(currentInterval);
            set({ pollInterval: null });
          }
          set({
            trainingStatus: 'idle',
            error: errorMsg
          });
          return;
        } else if (response.status === 'stopped') {
          const currentInterval = get().pollInterval;
          if (currentInterval) {
            clearInterval(currentInterval);
            set({ pollInterval: null });
          }
          set({ trainingStatus: 'idle' });
          return;
        }

      } catch (error) {
        console.error('Failed to poll training status:', error);
      }
    };

    // 设置轮询定时器
    const interval = setInterval(poll, 500);
    set({ pollInterval: interval });
  },

  // 停止训练
  stopTraining: async () => {
    const { modelId, pollInterval } = get();

    if (pollInterval) {
      clearInterval(pollInterval);
      set({ pollInterval: null });
    }

    if (modelId) {
      try {
        await trainingApi.stop(modelId);
      } catch (error) {
        console.error('Failed to stop training:', error);
      }
    }

    set({ trainingStatus: 'idle', error: null });
  },

  // 重置训练
  resetTraining: () => {
    const { pollInterval } = get();

    if (pollInterval) {
      clearInterval(pollInterval);
    }

    set({
      trainingHistory: [],
      currentEpoch: 0,
      trainingStatus: 'idle',
      error: null,
      pollInterval: null
    });
  },

  // 清理资源
  cleanup: async () => {
    const { modelId, pollInterval } = get();

    if (pollInterval) {
      clearInterval(pollInterval);
    }

    if (modelId) {
      try {
        await trainingApi.delete(modelId);
      } catch (error) {
        console.error('Failed to delete model:', error);
      }
    }

    set({
      modelId: null,
      trainingHistory: [],
      currentEpoch: 0,
      trainingStatus: 'idle',
      pollInterval: null
    });
  },

  // 设置错误
  setError: (error) => {
    set({ error });
  }
}));
