/** 神经网络配置组件 - 简化版，固定输入输出层 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useNetworkStore } from '@/store/networkStore';
import type { LayerConfig, ModelConfig } from '@/types/neural';
import { Plus, Trash2, Settings, Info } from 'lucide-react';

const OPTIMIZERS = [
  { value: 'adam', label: 'Adam (推荐)' },
  { value: 'sgd', label: 'SGD' },
  { value: 'rmsprop', label: 'RMSprop' },
  { value: 'adamax', label: 'Adamax' }
];

// 数据集推荐配置
const DATASET_PRESETS: Record<string, {
  hiddenLayers: Omit<LayerConfig, 'useBias'>[];
  optimizer: string;
  learningRate: number;
  lossFunction: string;
  description: string;
}> = {
  // ===== 分类数据集 =====
  'xor': {
    hiddenLayers: [
      { units: 8, activation: 'relu' },
      { units: 8, activation: 'relu' }
    ],
    optimizer: 'adam',
    learningRate: 0.01,
    lossFunction: 'categoricalCrossentropy',
    description: 'XOR需要至少一个隐藏层来处理非线性关系'
  },
  'and': {
    hiddenLayers: [
      { units: 4, activation: 'relu' }
    ],
    optimizer: 'adam',
    learningRate: 0.01,
    lossFunction: 'categoricalCrossentropy',
    description: 'AND是线性可分问题，一个隐藏层即可'
  },
  'or': {
    hiddenLayers: [
      { units: 4, activation: 'relu' }
    ],
    optimizer: 'adam',
    learningRate: 0.01,
    lossFunction: 'categoricalCrossentropy',
    description: 'OR是线性可分问题，一个隐藏层即可'
  },
  'iris': {
    hiddenLayers: [
      { units: 16, activation: 'relu' },
      { units: 8, activation: 'relu' }
    ],
    optimizer: 'adam',
    learningRate: 0.01,
    lossFunction: 'categoricalCrossentropy',
    description: '鸢尾花是3分类问题，需要softmax输出层'
  },
  'mnist_simple': {
    hiddenLayers: [
      { units: 128, activation: 'relu' },
      { units: 64, activation: 'relu' }
    ],
    optimizer: 'adam',
    learningRate: 0.001,
    lossFunction: 'categoricalCrossentropy',
    description: '手写数字识别需要更多隐藏神经元处理图像特征'
  },
  'moons': {
    hiddenLayers: [
      { units: 16, activation: 'relu' },
      { units: 8, activation: 'tanh' }
    ],
    optimizer: 'adam',
    learningRate: 0.01,
    lossFunction: 'categoricalCrossentropy',
    description: '月亮数据集是非线性的，使用tanh激活函数效果更好'
  },
  'circles': {
    hiddenLayers: [
      { units: 16, activation: 'relu' },
      { units: 16, activation: 'relu' },
      { units: 8, activation: 'tanh' }
    ],
    optimizer: 'adam',
    learningRate: 0.01,
    lossFunction: 'categoricalCrossentropy',
    description: '圆形数据集需要更深的网络来处理复杂的边界'
  },

  // ===== 回归数据集 =====
  'linear': {
    hiddenLayers: [
      { units: 8, activation: 'relu' }
    ],
    optimizer: 'adam',
    learningRate: 0.01,
    lossFunction: 'mse',
    description: '线性回归使用简单的网络结构即可'
  },
  'sine': {
    hiddenLayers: [
      { units: 32, activation: 'tanh' },
      { units: 32, activation: 'tanh' }
    ],
    optimizer: 'adam',
    learningRate: 0.01,
    lossFunction: 'mse',
    description: '正弦波需要更多神经元来拟合周期性函数'
  },
  'polynomial': {
    hiddenLayers: [
      { units: 32, activation: 'relu' },
      { units: 16, activation: 'relu' }
    ],
    optimizer: 'adam',
    learningRate: 0.01,
    lossFunction: 'mse',
    description: '多项式回归需要足够的容量来学习非线性关系'
  },
  'exponential': {
    hiddenLayers: [
      { units: 32, activation: 'relu' },
      { units: 16, activation: 'relu' }
    ],
    optimizer: 'adam',
    learningRate: 0.001,
    lossFunction: 'mse',
    description: '指数函数增长较快，使用较小的学习率'
  },
  'multilinear': {
    hiddenLayers: [
      { units: 16, activation: 'relu' },
      { units: 8, activation: 'relu' }
    ],
    optimizer: 'adam',
    learningRate: 0.01,
    lossFunction: 'mse',
    description: '多元线性回归使用中等大小的网络'
  },

  // ===== 新增现实数据集配置 =====
  'breast_cancer': {
    hiddenLayers: [
      { units: 32, activation: 'relu' },
      { units: 16, activation: 'relu' },
      { units: 8, activation: 'relu' }
    ],
    optimizer: 'adam',
    learningRate: 0.001,
    lossFunction: 'categoricalCrossentropy',
    description: '乳腺癌有30个特征，使用较深的网络捕捉复杂关系'
  },
  'wine': {
    hiddenLayers: [
      { units: 16, activation: 'relu' },
      { units: 8, activation: 'tanh' }
    ],
    optimizer: 'adam',
    learningRate: 0.01,
    lossFunction: 'categoricalCrossentropy',
    description: '葡萄酒分类使用tanh激活函数效果较好'
  },
  'california_housing': {
    hiddenLayers: [
      { units: 128, activation: 'relu' },
      { units: 64, activation: 'relu' },
      { units: 32, activation: 'relu' },
      { units: 16, activation: 'relu' }
    ],
    optimizer: 'adam',
    learningRate: 0.0005,
    lossFunction: 'mse',
    description: '房价数据集样本量大(20640)，使用更深的网络和较小的学习率'
  },
  'diabetes': {
    hiddenLayers: [
      { units: 16, activation: 'relu' },
      { units: 8, activation: 'relu' }
    ],
    optimizer: 'adam',
    learningRate: 0.0005,
    lossFunction: 'mse',
    description: '糖尿病数据集样本少(442)，使用更小的网络防止过拟合'
  }
};

// 默认配置（未选择数据集时）
const DEFAULT_PRESET = {
  hiddenLayers: [
    { units: 8, activation: 'relu' },
    { units: 4, activation: 'relu' }
  ],
  optimizer: 'adam',
  learningRate: 0.01,
  lossFunction: 'binaryCrossentropy',
  description: '默认配置，适合二分类问题'
};

export function NetworkConfig() {
  const { modelConfig, setModelConfig, datasetInfo } = useNetworkStore();

  // 获取当前数据集的推荐配置
  const currentPreset = datasetInfo?.name
    ? (DATASET_PRESETS[datasetInfo.name] || DEFAULT_PRESET)
    : DEFAULT_PRESET;

  // 状态管理
  const [hiddenLayers, setHiddenLayers] = useState<Omit<LayerConfig, 'useBias'>[]>(currentPreset.hiddenLayers);
  const [optimizer, setOptimizer] = useState(currentPreset.optimizer);
  const [learningRate, setLearningRate] = useState(currentPreset.learningRate);
  const [lossFunction, setLossFunction] = useState(currentPreset.lossFunction);
  const [epochs, setEpochs] = useState(50);
  const [batchSize, setBatchSize] = useState(32);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 当数据集改变时，自动应用推荐配置
  useEffect(() => {
    if (datasetInfo?.name && DATASET_PRESETS[datasetInfo.name]) {
      const preset = DATASET_PRESETS[datasetInfo.name];
      setHiddenLayers(preset.hiddenLayers);
      setOptimizer(preset.optimizer);
      setLearningRate(preset.learningRate);
      setLossFunction(preset.lossFunction);
      setEpochs(50);
      setBatchSize(32);
    }
  }, [datasetInfo?.name]);

  // 监听配置变化，自动更新 modelConfig
  useEffect(() => {
    if (datasetInfo) {
      const currentConfig = buildFullConfig();
      setModelConfig(currentConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenLayers, optimizer, learningRate, lossFunction, epochs, batchSize, datasetInfo]);

  // 获取输出层信息（固定）
  const getOutputLayer = (): LayerConfig => {
    if (!datasetInfo) {
      return { units: 1, activation: 'sigmoid', useBias: true };
    }

    if (datasetInfo.type === 'classification') {
      // 注意：后端使用 one-hot 编码，所以即使是二分类也应该使用 softmax
      // 二分类：2 个输出 + softmax
      // 多分类：3+ 个输出 + softmax
      const numClasses = datasetInfo.classes || 2;
      return {
        units: numClasses,
        activation: 'softmax',  // 所有分类问题都使用 softmax
        useBias: true
      };
    } else {
      return { units: 1, activation: 'linear', useBias: true };
    }
  };

  const outputLayer = getOutputLayer();
  const inputUnits = datasetInfo?.features || 2;

  // 构建完整的模型配置（不包含输入层，输入层是隐式的）
  const buildFullConfig = (): ModelConfig => {
    return {
      layers: [
        ...hiddenLayers.map(l => ({ ...l, useBias: true })),
        outputLayer
      ],
      optimizer: optimizer as any,
      learningRate: learningRate,
      lossFunction: lossFunction as any,
      training: {
        epochs,
        batchSize,
        validationSplit: 0.2
      }
    };
  };

  const handleApplyConfig = () => {
    setModelConfig(buildFullConfig());
  };

  const handleResetToPreset = () => {
    setHiddenLayers(currentPreset.hiddenLayers);
    setOptimizer(currentPreset.optimizer);
    setLearningRate(currentPreset.learningRate);
    setLossFunction(currentPreset.lossFunction);
    setEpochs(50);
    setBatchSize(32);
  };

  const handleAddHiddenLayer = () => {
    const newLayers = [...hiddenLayers, { units: 8, activation: 'relu' }];
    setHiddenLayers(newLayers);
    // 自动更新 modelConfig
    setModelConfig(buildFullConfig());
  };

  const handleRemoveHiddenLayer = (index: number) => {
    if (hiddenLayers.length > 1) {
      const newLayers = hiddenLayers.filter((_, i) => i !== index);
      setHiddenLayers(newLayers);
      // 自动更新 modelConfig
      setModelConfig(buildFullConfig());
    }
  };

  const handleUpdateHiddenLayer = (index: number, field: string, value: any) => {
    const newLayers = [...hiddenLayers];
    newLayers[index] = { ...newLayers[index], [field]: value };
    setHiddenLayers(newLayers);
    // 自动更新 modelConfig
    setModelConfig(buildFullConfig());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>网络配置</CardTitle>
        <CardDescription>
          {datasetInfo ? (
            <span>数据集: <strong>{datasetInfo.name}</strong> - {currentPreset.description}</span>
          ) : (
            '请先选择数据集以获取推荐配置'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 网络结构概览 */}
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            网络结构
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded">
              输入: {inputUnits} 特征
            </div>
            <span>→</span>
            {hiddenLayers.map((layer, i) => (
              <div key={i} className="px-3 py-1 bg-purple-100 dark:bg-purple-900 rounded">
                隐藏{i + 1}: {layer.units} / {layer.activation}
              </div>
            ))}
            <span>→</span>
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900 rounded">
              输出: {outputLayer.units} / {outputLayer.activation}
            </div>
          </div>
        </div>

        {/* 隐藏层配置 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">隐藏层配置</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetToPreset}
              >
                重置为推荐
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddHiddenLayer}
              >
                <Plus className="w-4 h-4 mr-1" />
                添加层
              </Button>
            </div>
          </div>

          {hiddenLayers.map((layer, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">隐藏层 {index + 1}</span>
                {hiddenLayers.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveHiddenLayer(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>神经元数量</Label>
                  <Input
                    type="number"
                    min="1"
                    max="256"
                    value={layer.units}
                    onChange={(e) => handleUpdateHiddenLayer(index, 'units', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div>
                  <Label>激活函数</Label>
                  <Select
                    value={layer.activation}
                    onChange={(e) => handleUpdateHiddenLayer(index, 'activation', e.target.value)}
                  >
                    <option value="relu">ReLU</option>
                    <option value="sigmoid">Sigmoid</option>
                    <option value="tanh">Tanh</option>
                    <option value="leakyRelu">Leaky ReLU</option>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 输出层信息（只读） */}
        <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="font-medium mb-2 text-green-800 dark:text-green-200">输出层（自动配置）</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-600 dark:text-green-400">神经元数量:</span>{' '}
              <span className="font-mono">{outputLayer.units}</span>
              <span className="text-green-600 dark:text-green-400 ml-2">
                ({datasetInfo?.type === 'classification' ? `${datasetInfo.classes} 类` : '回归值'})
              </span>
            </div>
            <div>
              <span className="text-green-600 dark:text-green-400">激活函数:</span>{' '}
              <span className="font-mono">{outputLayer.activation}</span>
            </div>
          </div>
        </div>

        {/* 训练参数 */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">训练参数</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="w-4 h-4 mr-1" />
              {showAdvanced ? '隐藏高级选项' : '显示高级选项'}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>训练轮次</Label>
              <Input
                type="number"
                min="1"
                max="1000"
                value={epochs}
                onChange={(e) => setEpochs(parseInt(e.target.value) || 50)}
              />
            </div>

            <div>
              <Label>批大小</Label>
              <Input
                type="number"
                min="1"
                max="256"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value) || 32)}
              />
            </div>
          </div>

          {showAdvanced && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>优化器</Label>
                  <Select
                    value={optimizer}
                    onChange={(e) => setOptimizer(e.target.value)}
                  >
                    {OPTIMIZERS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Label>损失函数</Label>
                  <Select
                    value={lossFunction}
                    onChange={(e) => setLossFunction(e.target.value)}
                    disabled={datasetInfo?.type === 'classification'}
                  >
                    {datasetInfo?.type === 'classification' ? (
                      <>
                        <option value="binaryCrossentropy">Binary Crossentropy (二分类)</option>
                        <option value="categoricalCrossentropy">Categorical Crossentropy (多分类)</option>
                      </>
                    ) : (
                      <>
                        <option value="mse">MSE (均方误差)</option>
                        <option value="mae">MAE (平均绝对误差)</option>
                      </>
                    )}
                  </Select>
                </div>
              </div>

              <div>
                <Label>学习率</Label>
                <Input
                  type="number"
                  step="0.001"
                  min="0.0001"
                  max="1"
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value) || 0.01)}
                />
              </div>
            </>
          )}
        </div>

        <Button onClick={handleResetToPreset} variant="outline" className="w-full" size="lg">
          重置为推荐配置
        </Button>
      </CardContent>
    </Card>
  );
}
