/** 训练页面 */
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DatasetSelector } from '@/components/DatasetSelector';
import { NetworkConfig } from '@/components/NeuralNetwork';
import { TrainingPanel } from '@/components/Training';
import { LossChart } from '@/components/Visualization';
import { ArrowLeft, Home } from 'lucide-react';

export default function Training() {
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
            <h1 className="text-xl font-semibold">神经网络训练</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <DatasetSelector />
            <NetworkConfig />
          </div>

          {/* Middle Column */}
          <div className="space-y-6">
            <TrainingPanel />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <LossChart />
          </div>
        </div>
      </main>
    </div>
  );
}
