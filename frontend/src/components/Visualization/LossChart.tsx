/** 训练曲线图表组件 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useNetworkStore } from '@/store/networkStore';

export function LossChart() {
  const { trainingHistory, datasetInfo } = useNetworkStore();

  const chartData = trainingHistory.map((entry) => ({
    epoch: entry.epoch,
    loss: entry.loss,
    accuracy: entry.accuracy ? (entry.accuracy * 100) : undefined,
    valLoss: entry.valLoss,
    valAccuracy: entry.valAccuracy ? (entry.valAccuracy * 100) : undefined
  }));

  // 只对分类问题显示 accuracy
  const isClassification = datasetInfo?.type === 'classification';
  const hasAccuracy = isClassification && chartData.some(d => d.accuracy !== undefined);
  const hasValidation = chartData.some(d => d.valLoss !== undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>训练曲线</CardTitle>
        <CardDescription>
          {isClassification ? '实时显示训练过程中的损失和准确率' : '实时显示训练过程中的损失'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            开始训练后显示曲线
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="epoch" label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }} />
              <YAxis yAxisId="left" label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
              {hasAccuracy && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: 'Accuracy (%)', angle: 90, position: 'insideRight' }}
                />
              )}
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="loss" stroke="#ef4444" name="训练 Loss" dot={false} />
              {hasValidation && (
                <Line yAxisId="left" type="monotone" dataKey="valLoss" stroke="#f97316" name="验证 Loss" dot={false} />
              )}
              {hasAccuracy && (
                <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="#3b82f6" name="训练准确率" dot={false} />
              )}
              {hasAccuracy && hasValidation && (
                <Line yAxisId="right" type="monotone" dataKey="valAccuracy" stroke="#10b981" name="验证准确率" dot={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
