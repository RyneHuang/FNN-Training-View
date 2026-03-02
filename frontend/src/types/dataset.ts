/** 数据集相关类型定义 */

/** 数据集类型 */
export type DatasetType = 'classification' | 'regression';

/** 数据集元信息 */
export interface DatasetInfo {
  name: string;
  type: DatasetType;
  description: string;
  features: number;
  samples: number;
  classes?: number;  // 分类问题才有
  featureNames: string[];
}

/** 训练数据 */
export interface TrainingData {
  inputs: number[][];
  labels: number[] | number[][];
}

/** 完整数据集 */
export interface Dataset {
  name: string;
  train: TrainingData;
  test: TrainingData;
  metadata: DatasetInfo;
}

/** 数据集列表响应 */
export interface DatasetsResponse {
  datasets: DatasetInfo[];
}
