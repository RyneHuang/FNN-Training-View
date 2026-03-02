/** 神经网络相关类型定义 */

/** 单层神经元的配置 */
export interface LayerConfig {
  units: number;           // 神经元数量
  activation: ActivationFunction;
  useBias?: boolean;
}

/** 支持的激活函数 */
export type ActivationFunction =
  | 'relu'
  | 'sigmoid'
  | 'tanh'
  | 'linear'
  | 'softmax'
  | 'leakyRelu';

/** 支持的优化器 */
export type Optimizer = 'adam' | 'sgd' | 'rmsprop' | 'adamax';

/** 支持的损失函数 */
export type LossFunction = 'mse' | 'binaryCrossentropy' | 'categoricalCrossentropy';

/** 训练配置 */
export interface TrainingParams {
  epochs: number;
  batchSize: number;
  validationSplit: number;
}

/** 模型配置 */
export interface ModelConfig {
  layers: LayerConfig[];
  optimizer: Optimizer;
  learningRate: number;
  lossFunction: LossFunction;
  training?: TrainingParams;
}

/** 训练日志 */
export interface TrainingLogs {
  loss: number;
  acc?: number;
  val_loss?: number;
  val_acc?: number;
}

/** 层输出信息 */
export interface LayerOutput {
  layerName: string;
  layerIndex: number;
  values: number[];
  shape: number[];
}

/** 训练状态 */
export type TrainingStatus = 'idle' | 'training' | 'paused' | 'completed';

/** 训练历史记录 */
export interface TrainingHistoryEntry {
  epoch: number;
  loss: number;
  accuracy?: number;
  valLoss?: number;
  valAccuracy?: number;
}

/** 神经元信息（用于可视化） */
export interface NeuronInfo {
  id: string;
  layerIndex: number;
  neuronIndex: number;
  value: number;
  bias?: number;
}

/** 连接信息（用于可视化） */
export interface ConnectionInfo {
  fromLayer: number;
  fromNeuron: number;
  toLayer: number;
  toNeuron: number;
  weight: number;
}
