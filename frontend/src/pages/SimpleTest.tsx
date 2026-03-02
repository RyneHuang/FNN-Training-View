/** 简化的测试页面 - 用于调试 */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNetworkStore } from '@/store/networkStore';
import { datasetApi } from '@/lib/api';

export default function SimpleTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [step, setStep] = useState(0);

  const {
    datasetInfo,
    modelConfig,
    trainingStatus,
    trainingHistory,
    currentEpoch,
    modelId,
    error,
    createModel,
    startTraining
  } = useNetworkStore();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog('页面已加载');
  }, []);

  const handleLoadDatasets = async () => {
    try {
      addLog('开始加载数据集列表...');
      const datasets = await datasetApi.list();
      addLog(`成功加载 ${datasets.length} 个数据集`);
      datasets.forEach((ds, i) => {
        addLog(`  ${i + 1}. ${ds.name}: ${ds.description}`);
      });
    } catch (err) {
      addLog(`加载数据集失败: ${err}`);
    }
  };

  const handleSelectIris = async () => {
    try {
      addLog('选择鸢尾花数据集...');
      const dataset = await datasetApi.get('iris');
      useNetworkStore.getState().setDataset(dataset);
      addLog('鸢尾花数据集加载成功');
    } catch (err) {
      addLog(`加载数据集失败: ${err}`);
    }
  };

  const handleApplyConfig = () => {
    const config = {
      layers: [
        { units: 16, activation: 'relu' },
        { units: 8, activation: 'relu' },
        { units: 3, activation: 'softmax' }
      ],
      optimizer: 'adam' as const,
      learningRate: 0.01,
      lossFunction: 'categoricalCrossentropy' as const,
      training: { epochs: 10, batchSize: 32, validationSplit: 0.2 }
    };
    useNetworkStore.getState().setModelConfig(config);
    addLog('模型配置已应用: 3层网络, 10 epochs');
  };

  const handleCreateModel = async () => {
    try {
      addLog('开始创建模型...');
      await createModel();
      addLog(`模型创建成功! ID: ${useNetworkStore.getState().modelId?.slice(0, 8)}...`);
    } catch (err) {
      addLog(`创建模型失败: ${err}`);
    }
  };

  const handleStartTraining = async () => {
    try {
      addLog('开始训练...');
      await startTraining();
      addLog('训练已启动');
    } catch (err) {
      addLog(`训练失败: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-4">调试测试页面</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 左侧：日志和操作 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>操作日志</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] overflow-y-auto bg-black text-green-400 p-4 font-mono text-xs">
                {logs.length === 0 ? (
                  <p className="text-gray-500">等待操作...</p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>测试操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={handleLoadDatasets}
                variant="outline"
                className="w-full"
              >
                1. 加载数据集列表
              </Button>

              <Button
                onClick={handleSelectIris}
                variant="outline"
                className="w-full"
              >
                2. 选择鸢尾花数据集
              </Button>

              <Button
                onClick={handleApplyConfig}
                variant="outline"
                className="w-full"
              >
                3. 应用模型配置
              </Button>

              <Button
                onClick={handleCreateModel}
                variant="outline"
                className="w-full"
              >
                4. 创建模型
              </Button>

              <Button
                onClick={handleStartTraining}
                variant="default"
                className="w-full"
              >
                5. 开始训练
              </Button>

              <Button
                onClick={() => setLogs([])}
                variant="outline"
                className="w-full"
              >
                清空日志
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：状态显示 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>应用状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>数据集:</span>
                <span className="font-mono">{datasetInfo?.name || '无'}</span>
              </div>
              <div className="flex justify-between">
                <span>模型配置:</span>
                <span className="font-mono">{modelConfig ? '✓' : '✗'}</span>
              </div>
              <div className="flex justify-between">
                <span>模型ID:</span>
                <span className="font-mono">{modelId || '无'}</span>
              </div>
              <div className="flex justify-between">
                <span>训练状态:</span>
                <span className={`font-mono px-2 py-1 rounded ${
                  trainingStatus === 'training' ? 'bg-blue-500 text-white' :
                  trainingStatus === 'completed' ? 'bg-green-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {trainingStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span>当前Epoch:</span>
                <span className="font-mono">{currentEpoch}</span>
              </div>
              <div className="flex justify-between">
                <span>历史长度:</span>
                <span className="font-mono">{trainingHistory.length}</span>
              </div>
              {error && (
                <div className="p-2 bg-red-100 text-red-700 rounded">
                  错误: {error}
                </div>
              )}
            </CardContent>
          </Card>

          {trainingHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>训练历史</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm max-h-40 overflow-y-auto">
                  {trainingHistory.map((entry) => (
                    <div key={entry.epoch} className="font-mono">
                      Epoch {entry.epoch}: Loss={entry.loss.toFixed(4)}
                      {entry.accuracy && `, Acc=${(entry.accuracy * 100).toFixed(2)}%`}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
