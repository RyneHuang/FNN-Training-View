# API 文档

## 基础信息

- Base URL: `http://localhost:8000`
- API 前缀: `/api`

## 端点

### 1. 获取数据集列表

**请求**
```
GET /api/datasets
```

**响应**
```json
{
  "datasets": [
    {
      "name": "xor",
      "type": "classification",
      "description": "XOR逻辑门数据集 - 经典的非线性分类问题",
      "features": 2,
      "samples": 500,
      "classes": 2,
      "feature_names": ["Input 1", "Input 2"]
    }
  ]
}
```

### 2. 获取指定数据集

**请求**
```
GET /api/datasets/{name}
```

**参数**
- `name`: 数据集名称 (如: xor, iris, linear, sine)

**响应**
```json
{
  "name": "xor",
  "train_inputs": [[0.0, 0.0], [0.0, 1.0], ...],
  "train_labels": [0.0, 1.0, ...],
  "test_inputs": [[1.0, 0.0], ...],
  "test_labels": [1.0, ...],
  "metadata": {
    "name": "xor",
    "type": "classification",
    "description": "XOR逻辑门数据集",
    "features": 2,
    "samples": 500,
    "classes": 2,
    "feature_names": ["Input 1", "Input 2"]
  }
}
```

## 可用数据集

### 分类数据集
- `xor` - XOR 逻辑门
- `and` - AND 逻辑门
- `or` - OR 逻辑门
- `iris` - 鸢尾花数据集
- `mnist_simple` - 简化手写数字
- `moons` - 月亮数据集
- `circles` - 圆形数据集

### 回归数据集
- `linear` - 线性回归
- `sine` - 正弦波拟合
- `polynomial` - 多项式回归
- `exponential` - 指数函数
- `multilinear` - 多元线性回归

## 错误响应

**404 Not Found**
```json
{
  "detail": "Dataset 'unknown' not found"
}
```
