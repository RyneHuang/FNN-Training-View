/** 神经网络结构可视化组件 - 从上到下的层级结构 */
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNetworkStore } from '@/store/networkStore';
import { ChevronDown } from 'lucide-react';

interface Layer {
  index: number;
  name: string;
  units: number;
  activation: string;
  type: 'input' | 'hidden' | 'output';
}

export function NetworkGraph() {
  const { modelConfig, modelId, datasetInfo } = useNetworkStore();

  // 动态构建完整的层列表（包含输入层）
  const layers = useMemo((): Layer[] => {
    if (!modelConfig) return [];

    const result: Layer[] = [];

    // 添加输入层（占位符）
    const inputUnits = datasetInfo?.features || 2;
    result.push({
      index: 0,
      name: '输入层',
      units: inputUnits,
      activation: 'linear',  // 输入层没有激活函数
      type: 'input'
    });

    // 添加隐藏层和输出层
    modelConfig.layers.forEach((layer, index) => {
      const actualIndex = index + 1;  // +1 因为有输入层
      const isLast = index === modelConfig.layers.length - 1;

      result.push({
        index: actualIndex,
        name: isLast ? '输出层' : `隐藏层 ${index + 1}`,  // 从 1 开始编号
        units: layer.units,
        activation: layer.activation,
        type: isLast ? 'output' : 'hidden'
      });
    });

    return result;
  }, [modelConfig, datasetInfo]);

  // 计算总参数量（必须在条件返回之前）
  const totalParams = useMemo(() => {
    if (layers.length < 2) return 0;

    let total = 0;
    for (let i = 1; i < layers.length; i++) {
      const prevLayer = layers[i - 1];
      const currentLayer = layers[i];
      // 参数 = (输入单元数 * 输出单元数) + 偏置
      total += (prevLayer.units * currentLayer.units) + currentLayer.units;
    }
    return total;
  }, [layers]);

  // 获取输入形状描述
  const getInputShape = () => {
    if (datasetInfo) {
      return `${datasetInfo.features} 个特征`;
    }
    return '未配置';
  };

  if (layers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>网络结构</CardTitle>
          <CardDescription>当前配置的神经网络结构</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            请先配置神经网络
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>网络结构</CardTitle>
        <CardDescription>
          {modelId ? '已创建的神经网络' : '当前配置的神经网络'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {layers.map((layer, layerIndex) => (
            <div key={layer.index} className="relative">
              {/* 层容器 */}
              <div
                className={`
                  rounded-lg border-2 p-4 transition-all
                  ${layer.type === 'input' ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' :
                    layer.type === 'output' ? 'border-green-500 bg-green-50 dark:bg-green-950/20' :
                    'border-purple-500 bg-purple-50 dark:bg-purple-950/20'}
                `}
              >
                {/* 层标题 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{layer.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {layer.units} 神经元
                    </Badge>
                  </div>
                  <Badge
                    variant={layer.type === 'input' ? 'default' : layer.type === 'output' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {layer.activation}
                  </Badge>
                </div>

                {/* 输入层显示输入形状 */}
                {layer.type === 'input' && (
                  <div className="text-xs text-muted-foreground mb-2">
                    接收输入: {getInputShape()}
                  </div>
                )}

                {/* 神经元可视化 */}
                <div className="flex flex-wrap gap-1 justify-center">
                  {Array.from({ length: Math.min(layer.units, 20) }).map((_, neuronIndex) => (
                    <div
                      key={neuronIndex}
                      className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs
                        transition-all hover:scale-110
                        ${layer.type === 'input' ? 'bg-blue-500 text-white' :
                          layer.type === 'output' ? 'bg-green-500 text-white' :
                          'bg-purple-500 text-white'}
                      `}
                      title={`神经元 ${neuronIndex + 1}`}
                    >
                      {layer.units <= 10 ? neuronIndex + 1 : ''}
                    </div>
                  ))}
                  {layer.units > 20 && (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                      +{layer.units - 20}
                    </div>
                  )}
                </div>

                {/* 显示更多信息 */}
                {layer.units > 20 && (
                  <div className="text-xs text-muted-foreground text-center mt-2">
                    共 {layer.units} 个神经元
                  </div>
                )}
              </div>

              {/* 连接箭头 */}
              {layerIndex < layers.length - 1 && (
                <div className="flex justify-center py-2">
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 网络摘要 */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>总层数:</span>
              <span className="font-medium">{layers.length} 层</span>
            </div>
            <div className="flex justify-between">
              <span>总参数:</span>
              <span className="font-medium">{totalParams.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>隐藏层数:</span>
              <span className="font-medium">{layers.filter(l => l.type === 'hidden').length} 层</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
