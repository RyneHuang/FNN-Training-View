/** 统一的训练与推理页面 */
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DatasetSelector } from '@/components/DatasetSelector';
import { DatasetTable } from '@/components/DatasetSelector/DatasetTable';
import { NetworkConfig } from '@/components/NeuralNetwork';
import { TrainingPanel } from '@/components/Training';
import { LossChart } from '@/components/Visualization';
import { NetworkGraph } from '@/components/Visualization';
import { InferencePanel } from '@/components/Inference';
import { Home } from 'lucide-react';

export default function UnifiedTrainingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                首页
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">神经网络训练与推理</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* 第一阶段：配置和训练 */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* 左侧：数据集和网络配置 */}
          <div className="space-y-6">
            <DatasetSelector />
            <NetworkConfig />
          </div>

          {/* 中间：训练控制 */}
          <div className="space-y-6">
            <TrainingPanel />
          </div>

          {/* 右侧：可视化 */}
          <div className="space-y-6">
            <NetworkGraph />
          </div>
        </div>

        {/* 训练曲线 */}
        <div className="mb-8">
          <LossChart />
        </div>

        {/* 数据集表格 */}
        <div className="mb-8">
          <DatasetTable />
        </div>

        {/* 第二阶段：推理测试 */}
        <div>
          <InferencePanel />
        </div>
      </main>
    </div>
  );
}
