/** 推理可视化组件 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNetworkStore } from '@/store/networkStore';
import { inferenceApi } from '@/lib/api';

interface LayerOutput {
  layer_name: string;
  layer_index: number;
  values: number[];
  shape: number[];
}

export function InferenceViz() {
  const { modelId, dataset } = useNetworkStore();
  const [inputValues, setInputValues] = useState<number[]>([]);
  const [prediction, setPrediction] = useState<number[] | null>(null);
  const [layerOutputs, setLayerOutputs] = useState<LayerOutput[]>([]);
  const [isClassification, setIsClassification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dataset?.train.inputs[0]) {
      setInputValues(new Array(dataset.train.inputs[0].length).fill(0));
    }
  }, [dataset]);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>推理测试</CardTitle>
        <CardDescription>输入测试数据查看模型预测结果</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!modelId ? (
          <div className="text-center text-muted-foreground py-8">
            请先在训练页面训练模型
          </div>
        ) : (
          <>
            {/* 输入区域 */}
            <div>
              <h3 className="font-medium mb-3">输入数据</h3>
              <div className="grid grid-cols-4 gap-2">
                {inputValues.map((value, index) => (
                  <div key={index}>
                    <label className="text-xs text-muted-foreground">
                      {dataset?.metadata.featureNames[index] || `X${index + 1}`}
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={value}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <Button
                onClick={handlePredict}
                disabled={loading}
                className="w-full mt-4"
              >
                {loading ? '预测中...' : '预测'}
              </Button>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            {/* 预测结果 */}
            {prediction && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium mb-2">预测结果</h3>
                {isClassification ? (
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      类别 {prediction.indexOf(Math.max(...prediction))}
                    </div>
                    <div className="space-y-1">
                      {prediction.map((prob, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-sm w-16">类别 {i}:</span>
                          <div className="flex-1 bg-background rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-primary h-full transition-all"
                              style={{ width: `${prob * 100}%` }}
                            />
                          </div>
                          <span className="text-sm w-16 text-right">{(prob * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-2xl font-bold">
                    {prediction[0].toFixed(4)}
                  </div>
                )}
              </div>
            )}

            {/* 中间层输出 */}
            {layerOutputs.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">逐层激活值</h3>
                <div className="space-y-3">
                  {layerOutputs.map((output, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="text-sm font-medium mb-2">
                        {output.layer_name} ({output.shape.join(' × ')})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {output.values.slice(0, 20).map((value, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded flex items-center justify-center text-xs font-mono"
                            style={{
                              backgroundColor: `rgba(59, 130, 246, ${Math.min(Math.abs(value), 1)})`,
                              color: Math.abs(value) > 0.5 ? 'white' : 'black'
                            }}
                          >
                            {value.toFixed(2)}
                          </div>
                        ))}
                        {output.values.length > 20 && (
                          <span className="text-xs text-muted-foreground self-center">
                            ... 还有 {output.values.length - 20} 个
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
