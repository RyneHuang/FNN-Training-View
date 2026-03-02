/** 推理面板组件 - 训练完成后显示 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNetworkStore } from '@/store/networkStore';
import { inferenceApi } from '@/lib/api';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface LayerOutput {
  layer_name: string;
  layer_index: number;
  values: number[];
  shape: number[];
}

export function InferencePanel() {
  const { modelId, dataset, modelConfig, trainingStatus } = useNetworkStore();
  const [inputValues, setInputValues] = useState<number[]>([]);
  const [prediction, setPrediction] = useState<number[] | null>(null);
  const [layerOutputs, setLayerOutputs] = useState<LayerOutput[]>([]);
  const [isClassification, setIsClassification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 模型训练完成后初始化输入
  useEffect(() => {
    console.log('InferencePanel useEffect:', {
      trainingStatus,
      hasDataset: !!dataset,
      hasTrain: !!dataset?.train,
      hasInputs: !!dataset?.train?.inputs,
      firstInputLength: dataset?.train?.inputs?.[0]?.length
    });
    if (trainingStatus === 'completed' && dataset?.train?.inputs?.[0]) {
      const inputLength = dataset.train.inputs[0]?.length || 0;
      if (inputLength > 0) {
        setInputValues(new Array(inputLength).fill(0));
        setPrediction(null);
        setLayerOutputs([]);
      }
    }
  }, [trainingStatus, dataset]);

  // 没有训练完成的模型或不完整的数据集时不显示
  const shouldShowWaiting = trainingStatus !== 'completed' || !modelId || !dataset?.train?.inputs?.[0];
  console.log('InferencePanel render:', {
    trainingStatus,
    hasModelId: !!modelId,
    hasDataset: !!dataset,
    hasTrain: !!dataset?.train,
    hasInputs: !!dataset?.train?.inputs,
    shouldShowWaiting
  });

  if (shouldShowWaiting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>推理测试</CardTitle>
          <CardDescription>训练完成后可进行推理测试</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
            <p className="text-muted-foreground">
              {trainingStatus === 'idle' ? '请先配置网络并开始训练' : '训练中...'}
            </p>
            {trainingStatus === 'training' && (
              <p className="text-sm text-muted-foreground mt-2">
                训练完成后可在此测试模型
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleInputChange = (index: number, value: string) => {
    const newValues = [...inputValues];
    newValues[index] = parseFloat(value) || 0;
    setInputValues(newValues);
    setPrediction(null);
    setLayerOutputs([]);
    setError(null);
  };

  const handlePredict = async () => {
    if (!modelId || inputValues.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const result = await inferenceApi.predict({
        model_id: modelId,
        inputs: inputValues
      });

      setPrediction(result.prediction);
      setLayerOutputs(result.intermediate_outputs);
      setIsClassification(result.is_classification);
    } catch (err) {
      setError(err instanceof Error ? err.message : '推理失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    if (!dataset?.train?.inputs || dataset.train.inputs.length === 0) return;

    // 随机选择一个训练样本
    const randomIndex = Math.floor(Math.random() * dataset.train.inputs.length);
    const sample = dataset.train.inputs[randomIndex];
    if (!sample) return;

    setInputValues([...sample]);

    // 获取对应的标签用于对比
    const label = dataset.train.labels?.[randomIndex];
    // 清空之前的预测
    setPrediction(null);
    setLayerOutputs([]);
    setError(null);
  };

  const outputLayer = modelConfig?.layers[modelConfig.layers.length - 1];
  const hasResult = prediction !== null;

  return (
    <Card className={hasResult ? 'ring-2 ring-green-500' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hasResult && <CheckCircle2 className="w-5 h-5 text-green-500" />}
          推理测试
        </CardTitle>
        <CardDescription>
          训练已完成，输入数据进行预测
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 输入区域 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">输入数据</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLoadSample}
            >
              加载样本
            </Button>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {inputValues.map((value, index) => (
              <div key={index}>
                <label className="text-xs text-muted-foreground block mb-1">
                  {dataset?.metadata?.featureNames?.[index] || `X${index + 1}`}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="text-sm"
                />
              </div>
            ))}
          </div>

          <Button
            onClick={handlePredict}
            disabled={loading}
            className="w-full mt-4"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                预测中...
              </>
            ) : (
              '🔮 开始预测'
            )}
          </Button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 预测结果 */}
        {hasResult && (
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="font-medium mb-3 text-green-800 dark:text-green-200">预测结果</h3>

            {isClassification ? (
              <div className="space-y-3">
                <div className="text-center py-3">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    类别 {prediction.indexOf(Math.max(...prediction))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    置信度: {(Math.max(...prediction) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">概率分布:</div>
                  {prediction.map((prob, i) => {
                    const percentage = prob * 100;
                    const isMax = prob === Math.max(...prediction);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm w-16">类别 {i}:</span>
                        <div className="flex-1 bg-background rounded-full h-5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isMax ? 'bg-green-500' : 'bg-green-200 dark:bg-green-800'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm w-16 text-right font-mono">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-5xl font-bold text-green-600 dark:text-green-400">
                  {prediction[0].toFixed(4)}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  回归预测值
                </div>
              </div>
            )}
          </div>
        )}

        {/* 中间层输出 */}
        {layerOutputs.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">逐层激活值</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {layerOutputs.map((output) => {
                // 计算显示的值数量
                const displayCount = Math.min(output.values.length, 12);
                const hasMore = output.values.length > 12;

                return (
                  <div key={output.layer_index} className="p-3 border rounded-lg bg-muted/50">
                    <div className="text-sm font-medium mb-2 flex items-center justify-between">
                      <span>{output.layer_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {output.shape.join(' × ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {output.values.slice(0, displayCount).map((value, i) => {
                        const absValue = Math.abs(value);
                        const normalizedValue = Math.min(absValue, 1);
                        const isPositive = value >= 0;

                        return (
                          <div
                            key={i}
                            className="w-9 h-9 rounded flex items-center justify-center text-xs font-mono transition-all"
                            style={{
                              backgroundColor: isPositive
                                ? `rgba(34, 197, 94, ${normalizedValue})`
                                : `rgba(239, 68, 68, ${normalizedValue})`,
                              color: normalizedValue > 0.5 ? 'white' : 'black'
                            }}
                            title={value.toFixed(6)}
                          >
                            {value.toFixed(2)}
                          </div>
                        );
                      })}
                      {hasMore && (
                        <span className="text-xs text-muted-foreground self-center">
                          +{output.values.length - displayCount} 个
                        </span>
                      )}
                    </div>
                    {/* 显示统计信息 */}
                    <div className="mt-2 pt-2 border-t text-xs text-muted-foreground flex justify-between">
                      <span>范围: [{Math.min(...output.values).toFixed(3)}, {Math.max(...output.values).toFixed(3)}]</span>
                      <span>均值: {(output.values.reduce((a, b) => a + b, 0) / output.values.length).toFixed(3)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
