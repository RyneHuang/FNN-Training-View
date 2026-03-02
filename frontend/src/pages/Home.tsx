/** 主页 */
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, LineChart, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FNN 训练与推理可视化
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            交互式神经网络教学工具，帮助理解前馈神经网络的训练和推理过程
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Brain className="w-12 h-12 text-blue-500 mb-4" />
              <CardTitle>可视化网络结构</CardTitle>
              <CardDescription>
                直观展示神经网络的层级结构和连接关系
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-12 h-12 text-yellow-500 mb-4" />
              <CardTitle>后端训练</CardTitle>
              <CardDescription>
                使用 TensorFlow/Keras 在服务端训练，稳定可靠
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <LineChart className="w-12 h-12 text-green-500 mb-4" />
              <CardTitle>实时推理测试</CardTitle>
              <CardDescription>
                训练完成后立即测试，查看逐层激活值
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA */}
        <div className="flex justify-center mb-16">
          <Button asChild size="lg" className="text-lg px-8">
            <Link to="/training">
              开始使用
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>

        {/* Info Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>支持的数据集</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  逻辑门数据集 (XOR, AND, OR)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  鸢尾花数据集 (3分类)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  简化手写数字数据集
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  月亮/圆形数据集
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  线性/多项式回归数据集
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  正弦波拟合数据集
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>使用流程</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                  <span>选择数据集（自动应用推荐配置）</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                  <span>调整隐藏层配置（可选）</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                  <span>设置训练参数并开始训练</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</span>
                  <span>观察训练曲线实时更新</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">5</span>
                  <span>训练完成后，输入数据进行推理测试</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Dataset Presets Info */}
        <div className="mt-16 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-center">每个数据集都有优化的推荐配置</h2>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">分类问题</div>
              <div className="text-muted-foreground">7个数据集</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-medium">回归问题</div>
              <div className="text-muted-foreground">5个数据集</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-medium">快速训练</div>
              <div className="text-muted-foreground">后端TensorFlow</div>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium">自动配置</div>
              <div className="text-muted-foreground">无需手动调整</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
