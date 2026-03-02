/** 训练控制面板组件 */
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNetworkStore } from '@/store/networkStore';
import { Play, Square, Loader2 } from 'lucide-react';

export function TrainingPanel() {
  const {
    trainingStatus,
    trainingHistory,
    currentEpoch,
    modelId,
    modelConfig,
    datasetInfo,
    createModel,
    startTraining,
    stopTraining,
    resetTraining,
    cleanup,
    error
  } = useNetworkStore();

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // 监听训练状态变化
  useEffect(() => {
    console.log('TrainingPanel: trainingStatus changed to:', trainingStatus);
  }, [trainingStatus]);

  const canStart = datasetInfo && modelConfig && modelConfig.training && trainingStatus === 'idle';
  const isTraining = trainingStatus === 'training';
  const totalEpochs = modelConfig?.training?.epochs || 100;
  const latestEpoch = trainingHistory[trainingHistory.length - 1];

  const handleStartClick = async () => {
    try {
      if (!modelId) {
        // 先创建模型
        await createModel();
      }
      // 然后开始训练
      await startTraining();
    } catch (err) {
      console.error('Failed to start training:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>训练控制</CardTitle>
        <CardDescription>控制神经网络的训练过程</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 错误提示 */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        {/* 训练配置显示 */}
        {modelConfig?.training && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-muted-foreground">Epochs:</span>{' '}
                <span className="font-medium">{modelConfig.training.epochs}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Batch:</span>{' '}
                <span className="font-medium">{modelConfig.training.batchSize}</span>
              </div>
              <div>
                <span className="text-muted-foreground">验证:</span>{' '}
                <span className="font-medium">{(modelConfig.training.validationSplit * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* 训练状态 */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">训练状态</span>
            <span className={`text-sm px-2 py-1 rounded ${
              trainingStatus === 'training' ? 'bg-blue-500 text-white animate-pulse' :
              trainingStatus === 'completed' ? 'bg-green-500 text-white' :
              'bg-gray-500 text-white'
            }`}>
              {trainingStatus === 'training' && (
                <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
              )}
              {trainingStatus === 'training' ? '训练中' :
               trainingStatus === 'completed' ? '已完成' : '空闲'}
            </span>
          </div>

          {latestEpoch && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Epoch:</span>{' '}
                <span className="font-mono">{currentEpoch}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Loss:</span>{' '}
                <span className="font-mono">{latestEpoch.loss.toFixed(4)}</span>
              </div>
              {latestEpoch.accuracy !== undefined && datasetInfo?.type === 'classification' && (
                <div>
                  <span className="text-muted-foreground">Accuracy:</span>{' '}
                  <span className="font-mono">{(latestEpoch.accuracy * 100).toFixed(2)}%</span>
                </div>
              )}
              {latestEpoch.valLoss !== undefined && (
                <div>
                  <span className="text-muted-foreground">Val Loss:</span>{' '}
                  <span className="font-mono">{latestEpoch.valLoss.toFixed(4)}</span>
                </div>
              )}
              {latestEpoch.valAccuracy !== undefined && datasetInfo?.type === 'classification' && (
                <div>
                  <span className="text-muted-foreground">Val Accuracy:</span>{' '}
                  <span className="font-mono">{(latestEpoch.valAccuracy * 100).toFixed(2)}%</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 训练建议 */}
        {isTraining && latestEpoch && trainingHistory.length >= 10 && (
          <TrainingAdvice
            currentEpoch={currentEpoch}
            totalEpochs={totalEpochs}
            recentLoss={trainingHistory.slice(-10)}
            latestLoss={latestEpoch.loss}
            latestValLoss={latestEpoch.valLoss}
            datasetType={datasetInfo?.type}
          />
        )}

        {/* 控制按钮 */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleStartClick}
            disabled={!canStart || isTraining}
            className="col-span-1"
          >
            <Play className="w-4 h-4 mr-1" />
            {modelId ? '开始训练' : '创建并训练'}
          </Button>

          <Button
            onClick={stopTraining}
            disabled={!isTraining}
            variant="outline"
            className="col-span-1"
          >
            <Square className="w-4 h-4 mr-1" />
            停止
          </Button>
        </div>

        <Button
          onClick={resetTraining}
          disabled={trainingHistory.length === 0}
          variant="outline"
          className="w-full"
        >
          重置
        </Button>

        {/* 训练进度 */}
        {isTraining && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>训练进度</span>
              <span>Epoch {currentEpoch} / {totalEpochs}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((currentEpoch / totalEpochs) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 训练建议组件
interface TrainingAdviceProps {
  currentEpoch: number;
  totalEpochs: number;
  recentLoss: Array<{ loss: number; valLoss?: number }>;
  latestLoss: number;
  latestValLoss?: number;
  datasetType?: string;
}

function TrainingAdvice({
  currentEpoch,
  totalEpochs,
  recentLoss,
  latestLoss,
  latestValLoss,
  datasetType
}: TrainingAdviceProps) {
  // 计算最近 10 轮的 loss 变化
  const lossChanges = recentLoss.map((e, i) => {
    if (i === 0) return 0;
    return e.loss - recentLoss[i - 1].loss;
  });
  const avgLossChange = lossChanges.reduce((a, b) => a + b, 0) / lossChanges.length;

  // 检查是否过拟合
  const hasOverfitting = latestValLoss && recentLoss.length >= 5 &&
    recentLoss.slice(-5).every((e, i) => {
      const prev = recentLoss[recentLoss.length - 5 + i - 1];
      return prev && e.valLoss !== undefined && prev.valLoss !== undefined && e.valLoss > prev.valLoss;
    });

  // 检查 loss 是否平稳
  const isStable = Math.abs(avgLossChange) < 0.0001;

  // 根据数据集类型给出建议
  const getAdvice = () => {
    if (hasOverfitting) {
      return {
        level: 'warning',
        title: '⚠️ 检测到过拟合',
        message: '验证 Loss 持续上升，建议停止训练以防止过拟合',
        action: '停止训练'
      };
    }

    if (isStable && currentEpoch > 50) {
      return {
        level: 'info',
        title: '📊 训练已收敛',
        message: `Loss 已趋于平稳 (${avgLossChange >= 0 ? '不再下降' : '下降缓慢'})`,
        action: '可以停止'
      };
    }

    if (datasetType === 'regression') {
      if (latestLoss < 0.001) {
        return {
          level: 'success',
          title: '✅ 训练效果优秀',
          message: `Loss (${latestLoss.toFixed(5)}) 已达到优秀水平`,
          action: '可以停止'
        };
      } else if (latestLoss < 0.01) {
        return {
          level: 'success',
          title: '✅ 训练效果良好',
          message: `Loss (${latestLoss.toFixed(5)}) 已达到良好水平`,
          action: '继续训练'
        };
      } else if (latestLoss < 0.05) {
        return {
          level: 'info',
          title: '📈 训练进行中',
          message: `Loss (${latestLoss.toFixed(5)}) 还有下降空间`,
          action: '继续训练'
        };
      } else {
        return {
          level: 'warning',
          title: '🔧 Loss 较高',
          message: `Loss (${latestLoss.toFixed(5)}) 可能需要调整网络结构或训练参数`,
          action: '考虑调整'
        };
      }
    }

    // 分类问题
    if (latestLoss < 0.1) {
      return {
        level: 'success',
        title: '✅ 训练效果良好',
        message: 'Loss 已较低，可以继续训练以提高准确率',
        action: '继续训练'
      };
    }

    return {
      level: 'info',
      title: '📈 训练进行中',
      message: `当前 Loss: ${latestLoss.toFixed(4)}，继续训练`,
      action: '继续训练'
    };
  };

  const advice = getAdvice();

  const levelStyles = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
  };

  return (
    <div className={`p-3 rounded-lg border ${levelStyles[advice.level]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium text-sm">{advice.title}</p>
          <p className="text-xs mt-1 opacity-90">{advice.message}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded bg-white/50 dark:bg-black/20">
          {advice.action}
        </span>
      </div>
    </div>
  );
}
