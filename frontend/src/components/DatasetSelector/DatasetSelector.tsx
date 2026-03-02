/** 数据集选择器组件 */
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { datasetApi } from '@/lib/api';
import type { DatasetInfo } from '@/types/dataset';
import { useNetworkStore } from '@/store/networkStore';

// 数据集分组和说明
const DATASET_INFO: Record<string, {
  difficulty: '简单' | '中等' | '困难';
  recommendedEpochs: number;
  tip: string;
}> = {
  'xor': {
    difficulty: '中等',
    recommendedEpochs: 100,
    tip: '经典非线性问题，需要隐藏层'
  },
  'and': {
    difficulty: '简单',
    recommendedEpochs: 50,
    tip: '线性可分，适合初学者'
  },
  'or': {
    difficulty: '简单',
    recommendedEpochs: 50,
    tip: '线性可分，适合初学者'
  },
  'iris': {
    difficulty: '中等',
    recommendedEpochs: 100,
    tip: '经典3分类问题，4个特征'
  },
  'mnist_simple': {
    difficulty: '困难',
    recommendedEpochs: 200,
    tip: '手写数字识别，需要更多神经元'
  },
  'moons': {
    difficulty: '中等',
    recommendedEpochs: 100,
    tip: '非线性边界，可视化效果好'
  },
  'circles': {
    difficulty: '中等',
    recommendedEpochs: 150,
    tip: '同心圆分类，需要更深的网络'
  },
  'linear': {
    difficulty: '简单',
    recommendedEpochs: 50,
    tip: '线性回归入门'
  },
  'sine': {
    difficulty: '中等',
    recommendedEpochs: 100,
    tip: '周期函数拟合'
  },
  'polynomial': {
    difficulty: '中等',
    recommendedEpochs: 100,
    tip: '非线性回归'
  },
  'exponential': {
    difficulty: '中等',
    recommendedEpochs: 100,
    tip: '指数函数增长'
  },
  'multilinear': {
    difficulty: '中等',
    recommendedEpochs: 100,
    tip: '多变量回归'
  },
  // ===== 新增现实数据集 =====
  'breast_cancer': {
    difficulty: '困难',
    recommendedEpochs: 150,
    tip: '医学诊断数据，30个特征，高准确率可达95%以上'
  },
  'wine': {
    difficulty: '中等',
    recommendedEpochs: 100,
    tip: '葡萄酒分类，13个化学成分特征'
  },
  'california_housing': {
    difficulty: '困难',
    recommendedEpochs: 500,
    tip: '大规模房价数据集（20640样本），建议训练500+轮，学习率0.0005'
  },
  'diabetes': {
    difficulty: '中等',
    recommendedEpochs: 500,
    tip: '小样本数据集（442样本），建议训练500+轮，学习率0.0005，防止过拟合'
  }
};

export function DatasetSelector() {
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { datasetInfo, loadDataset } = useNetworkStore();

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      setLoading(true);
      const data = await datasetApi.list();
      setDatasets(data);
    } catch (error) {
      console.error('Failed to load datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDataset = async (name: string) => {
    if (name) {
      await loadDataset(name);
    }
  };

  // 按类型分组数据集
  const classificationDatasets = datasets.filter(d => d.type === 'classification');
  const regressionDatasets = datasets.filter(d => d.type === 'regression');

  const selectedInfo = datasetInfo ? DATASET_INFO[datasetInfo.name] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>选择数据集</CardTitle>
        <CardDescription>选择一个数据集来训练神经网络</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">加载中...</p>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium mb-2 block">数据集</label>
              <Select
                value={datasetInfo?.name || ''}
                onChange={(e) => handleSelectDataset(e.target.value)}
              >
                <option value="">-- 请选择 --</option>
                <optgroup label="📊 分类问题">
                  {classificationDatasets.map((dataset) => {
                    const info = DATASET_INFO[dataset.name];
                    return (
                      <option key={dataset.name} value={dataset.name}>
                        {dataset.name} - {dataset.description} ({info?.difficulty})
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="📈 回归问题">
                  {regressionDatasets.map((dataset) => {
                    const info = DATASET_INFO[dataset.name];
                    return (
                      <option key={dataset.name} value={dataset.name}>
                        {dataset.name} - {dataset.description} ({info?.difficulty})
                      </option>
                    );
                  })}
                </optgroup>
              </Select>
            </div>

            {datasetInfo && selectedInfo && (
              <div className="space-y-3">
                {/* 数据集信息卡片 */}
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{datasetInfo.description}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      selectedInfo.difficulty === '简单' ? 'bg-green-100 text-green-700' :
                      selectedInfo.difficulty === '中等' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedInfo.difficulty}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>类型: {datasetInfo.type === 'classification' ? '分类' : '回归'}</div>
                    <div>样本数: {datasetInfo.samples}</div>
                    <div>特征数: {datasetInfo.features}</div>
                    {datasetInfo.classes && <div>类别数: {datasetInfo.classes}</div>}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    💡 {selectedInfo.tip}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    推荐训练轮次: {selectedInfo.recommendedEpochs}
                  </div>
                </div>

                {/* 特征名称 */}
                {datasetInfo.featureNames && datasetInfo.featureNames.length <= 8 && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">特征:</span> {datasetInfo.featureNames.join(', ')}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
