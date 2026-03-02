/** 推理页面 */
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InferenceViz } from '@/components/Inference';
import { NetworkGraph } from '@/components/Visualization';
import { Home } from 'lucide-react';

export default function Inference() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                首页
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">推理可视化</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <NetworkGraph />
          <InferenceViz />
        </div>

        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-lg font-semibold mb-4">使用说明</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>首先在训练页面训练一个神经网络模型</li>
            <li>模型训练完成后，切换到此页面进行推理测试</li>
            <li>输入测试数据，点击预测按钮查看结果</li>
            <li>观察逐层激活值，理解数据在网络中的流动</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
