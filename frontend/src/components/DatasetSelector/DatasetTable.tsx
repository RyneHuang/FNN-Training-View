/** 数据集表格显示组件 - 类似 Excel 的数据展示 */
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNetworkStore } from '@/store/networkStore';
import { DATASET_DESCRIPTIONS } from './datasetInfo';
import { ChevronLeft, ChevronRight, Database, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

const PAGE_SIZE = 20;

export function DatasetTable() {
  const { dataset } = useNetworkStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState<'train' | 'test'>('train');
  const [showDescription, setShowDescription] = useState(false);

  // 获取当前显示的数据
  const currentData = useMemo(() => {
    console.log('DatasetTable useMemo:', {
      hasDataset: !!dataset,
      hasTrain: !!dataset?.train,
      hasTest: !!dataset?.test,
      hasMetadata: !!dataset?.metadata
    });

    if (!dataset || !dataset.train || !dataset.test) return null;

    const data = activeTab === 'train' ? dataset.train : dataset.test;
    if (!data.inputs || !data.labels) return null;

    const start = currentPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    return {
      inputs: data.inputs.slice(start, end),
      labels: data.labels.slice(start, end),
      totalRows: data.inputs.length,
      featureNames: dataset.metadata?.featureNames || [],
      datasetType: dataset.metadata?.type || 'classification',
      startIndex: start
    };
  }, [dataset, activeTab, currentPage]);

  // 获取数据集简介
  const datasetDesc = useMemo(() => {
    if (!dataset) return null;
    return DATASET_DESCRIPTIONS[dataset.name] || null;
  }, [dataset]);

  // 计算总页数
  const totalPages = useMemo(() => {
    if (!currentData) return 0;
    return Math.ceil(currentData.totalRows / PAGE_SIZE);
  }, [currentData]);

  // 格式化标签显示
  const formatLabel = (label: number | number[]): string => {
    if (Array.isArray(label)) {
      // One-hot 编码，找到最大值的索引作为类别
      const maxIndex = label.indexOf(Math.max(...label));
      return `类别 ${maxIndex}`;
    }
    if (Number.isInteger(label)) {
      return `类别 ${label}`;
    }
    return label.toFixed(4);
  };

  // 判断是否为高亮行（取模用于视觉效果）
  const isHighlightRow = (index: number) => {
    return index % 5 === 0;
  };

  if (!dataset || !currentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            数据集预览
          </CardTitle>
          <CardDescription>选择数据集后可查看详细数据</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>请先选择一个数据集</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const desc = datasetDesc;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              {desc ? desc.chineseName : dataset.name} 数据集
            </CardTitle>
            <CardDescription className="mt-1">
              {currentData.totalRows} 条数据 · {currentData.inputs[0]?.length || currentData.featureNames.length || 0} 个特征 ·
              {activeTab === 'train' ? ' 训练集' : ' 测试集'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {currentData.datasetType === 'classification' ? '分类' : '回归'}
            </Badge>
            {desc && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDescription(!showDescription)}
                className="gap-1"
              >
                <BookOpen className="w-4 h-4" />
                数据集简介
                {showDescription ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* 数据集简介详情 */}
        {showDescription && desc && (
          <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="space-y-4">
              {/* 基本信息 */}
              <div>
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  数据集背景
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {desc.background}
                </p>
              </div>

              {/* 用途 */}
              <div>
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                  🎯 应用场景
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {desc.purpose}
                </p>
              </div>

              {/* 特征说明 */}
              <div>
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                  📊 特征说明
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {desc.features.map((feature, index) => (
                    <div key={index} className="p-2 bg-white dark:bg-gray-800 rounded border border-blue-100 dark:border-blue-900">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-xs font-mono bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">
                          {feature.name}
                        </code>
                        {feature.unit && (
                          <span className="text-xs text-muted-foreground">({feature.unit})</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 类别说明（分类问题） */}
              {desc.classes && desc.classes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                    🏷️ 类别说明
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {desc.classes.map((cls, index) => (
                      <div key={index} className="p-2 bg-white dark:bg-gray-800 rounded border border-green-100 dark:border-green-900">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {cls.label}
                          </Badge>
                        </div>
                        {cls.description && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {cls.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 额外说明 */}
              {desc.notes && (
                <div>
                  <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                    💡 注意事项
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                    {desc.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 训练集/测试集切换 */}
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            variant={activeTab === 'train' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('train');
              setCurrentPage(0);
            }}
          >
            训练集 ({dataset.train?.inputs?.length || 0} 条)
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'test' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('test');
              setCurrentPage(0);
            }}
          >
            测试集 ({dataset.test?.inputs?.length || 0} 条)
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* 数据表格 */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16 text-center">#</TableHead>
                  {currentData.featureNames && currentData.featureNames.length > 0 ? (
                    currentData.featureNames.map((name, index) => (
                      <TableHead key={index} className="min-w-[100px]">
                        {name}
                        <span className="block text-xs font-normal text-muted-foreground">
                          (特征 {index + 1})
                        </span>
                      </TableHead>
                    ))
                  ) : (
                    // 如果没有特征名称，使用默认名称
                    currentData.inputs[0] && Array.from({ length: currentData.inputs[0].length }).map((_, index) => (
                      <TableHead key={index} className="min-w-[100px]">
                        特征 {index + 1}
                        <span className="block text-xs font-normal text-muted-foreground">
                          (Feature {index + 1})
                        </span>
                      </TableHead>
                    ))
                  )}
                  <TableHead className="min-w-[100px] bg-primary/10">
                    标签
                    <span className="block text-xs font-normal text-muted-foreground">
                      Label
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.inputs.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className={isHighlightRow(rowIndex) ? 'bg-muted/30' : ''}
                  >
                    <TableCell className="text-center font-medium text-muted-foreground">
                      {currentData.startIndex + rowIndex + 1}
                    </TableCell>
                    {row.map((value, cellIndex) => (
                      <TableCell key={cellIndex} className="font-mono text-sm">
                        {typeof value === 'number' ? (
                          Math.abs(value) < 0.01 && value !== 0 ? (
                            value.toExponential(2)
                          ) : (
                            value.toFixed(4)
                          )
                        ) : (
                          value
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="font-medium">
                      <Badge
                        variant={currentData.datasetType === 'classification' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {formatLabel(currentData.labels[rowIndex])}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* 分页控制 */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            显示 {currentData.startIndex + 1} -{' '}
            {Math.min(currentData.startIndex + PAGE_SIZE, currentData.totalRows)} / 共{' '}
            {currentData.totalRows} 条
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一页
            </Button>
            <div className="flex items-center gap-1 px-3">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i;
                } else if (currentPage < 2) {
                  pageNum = i;
                } else if (currentPage > totalPages - 3) {
                  pageNum = totalPages - 5 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum + 1}
                  </Button>
                );
              })}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              下一页
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* 数据统计 */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">特征数</div>
              <div className="font-semibold text-lg">
                {currentData.inputs[0]?.length || currentData.featureNames.length || '-'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">{activeTab === 'train' ? '训练' : '测试'}样本</div>
              <div className="font-semibold text-lg">{currentData.totalRows}</div>
            </div>
            <div>
              <div className="text-muted-foreground">类别数</div>
              <div className="font-semibold text-lg">
                {dataset.metadata?.classes || '-'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">数据类型</div>
              <div className="font-semibold text-lg capitalize">
                {currentData.datasetType === 'classification' ? '分类' : '回归'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
