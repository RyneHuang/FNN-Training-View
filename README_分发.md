# FNN 神经网络训练与推理可视化教学应用

## 项目简介

这是一个与人工智能导论课程配套的 Web 应用，让学生直观感受前馈神经网络（FNN）的训练与推理过程。

### 主要功能

- **16 种内置数据集**：包括逻辑门、鸢尾花、手写数字、月亮/圆形等经典数据集，以及乳腺癌、葡萄酒、房价预测等真实世界数据集
- **可视化训练过程**：实时显示 Loss/Accuracy 曲线
- **网络结构可视化**：垂直布局展示网络结构
- **逐层推理可视化**：展示每一层的激活值和权重
- **数据集表格视图**：Excel 风格的数据浏览
- **数据集详细说明**：背景、特征含义等信息

### 技术栈

- **后端**：Python + FastAPI + TensorFlow/Keras
- **前端**：React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **可视化**：Recharts + React Flow

---

## 安装步骤

### 1. 解压文件

```bash
tar -xzf FNN_Training_View.tar.gz
cd FNN_Training_View
```

### 2. 后端安装

```bash
cd backend

# 创建虚拟环境（推荐）
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt
```

**后端依赖**：
- fastapi == 0.104.1
- uvicorn == 0.24.0
- tensorflow == 2.15.0
- scikit-learn == 1.3.2
- numpy == 1.26.2

### 3. 前端安装

```bash
cd ../frontend

# 安装依赖
npm install
```

**前端依赖**（主要）：
- react == 18.x
- typescript
- vite
- tailwindcss
- recharts
- zustand

---

## 运行方法

### 方式一：分别启动（开发模式）

**终端 1 - 启动后端**：
```bash
cd backend
source venv/bin/activate  # 激活虚拟环境
uvicorn app.main:app --reload --port 8000
```

后端将运行在：http://localhost:8000

**终端 2 - 启动前端**：
```bash
cd frontend
npm run dev
```

前端将运行在：http://localhost:5173

### 方式二：使用 concurrently 同时启动（推荐）

在项目根目录创建启动脚本：

**package.json**（根目录）：
```json
{
  "scripts": {
    "dev": "concurrently \"cd backend && uvicorn app.main:app --reload --port 8000\" \"cd frontend && npm run dev\""
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

然后运行：
```bash
npm run dev
```

---

## 使用指南

### 1. 选择数据集

在首页选择一个数据集，应用会自动加载推荐的网络配置：
- **分类数据集**（8 种）：xor, and, or, iris, mnist_simple, moons, circles, breast_cancer, wine
- **回归数据集**（7 种）：linear, sine, polynomial, exponential, multilinear, california_housing, diabetes

### 2. 配置网络

- **隐藏层**：可添加/删除/修改隐藏层，设置神经元数量和激活函数
- **训练参数**：设置训练轮次、批大小
- **高级选项**：优化器、学习率、损失函数

### 3. 训练模型

点击"创建并训练"按钮：
- 实时显示训练进度
- Loss/Accuracy 曲线动态更新
- 支持暂停/继续/停止训练

### 4. 推理可视化

训练完成后：
- 查看网络结构图（垂直布局）
- 输入测试数据进行推理
- 逐层查看激活值和权重

---

## 项目结构

```
FNN_Training_View/
├── backend/                    # Python 后端
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI 入口
│   │   ├── api/
│   │   │   ├── datasets.py    # 数据集 API
│   │   │   ├── models.py      # 数据模型
│   │   │   ├── training.py    # 训练 API
│   │   │   └── inference.py   # 推理 API
│   │   ├── data/
│   │   │   ├── classification.py  # 分类数据集
│   │   │   └── regression.py      # 回归数据集
│   │   └── utils/
│   │       └── model.py       # 模型构建
│   └── requirements.txt
│
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── NeuralNetwork/     # 网络配置组件
│   │   │   ├── Training/          # 训练组件
│   │   │   ├── Inference/         # 推理组件
│   │   │   ├── Visualization/     # 可视化组件
│   │   │   └── DatasetSelector/   # 数据集选择组件
│   │   ├── store/
│   │   │   └── networkStore.ts    # Zustand 状态管理
│   │   ├── lib/
│   │   │   └── api.ts             # API 客户端
│   │   ├── types/                 # TypeScript 类型
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README_分发.md              # 本文件
```

---

## 数据集列表

### 分类数据集

| 数据集 | 特征数 | 类别数 | 样本数 | 难度 | 说明 |
|--------|--------|--------|--------|------|------|
| xor | 2 | 2 | 500 | 中等 | 异或逻辑门 |
| and | 2 | 2 | 500 | 简单 | 与逻辑门 |
| or | 2 | 2 | 500 | 简单 | 或逻辑门 |
| iris | 4 | 3 | 150 | 中等 | 鸢尾花分类 |
| mnist_simple | 64 | 10 | 1797 | 困难 | 手写数字识别 |
| moons | 2 | 2 | 500 | 中等 | 月亮数据集 |
| circles | 2 | 2 | 500 | 中等 | 同心圆数据集 |
| breast_cancer | 30 | 2 | 569 | 困难 | 乳腺癌诊断 |
| wine | 13 | 3 | 178 | 中等 | 葡萄酒分类 |

### 回归数据集

| 数据集 | 特征数 | 样本数 | 难度 | 说明 |
|--------|--------|--------|------|------|
| linear | 1 | 500 | 简单 | 线性回归 |
| sine | 1 | 500 | 中等 | 正弦波拟合 |
| polynomial | 1 | 500 | 中等 | 多项式回归 |
| exponential | 1 | 500 | 中等 | 指数增长 |
| multilinear | 3 | 500 | 中等 | 多元线性回归 |
| california_housing | 8 | 20640 | 困难 | 加州房价预测 |
| diabetes | 10 | 442 | 中等 | 糖尿病进展预测 |

---

## API 端点

### 数据集 API

- `GET /api/datasets` - 获取所有数据集列表
- `GET /api/datasets/{name}` - 获取指定数据集

### 训练 API

- `POST /api/training/create` - 创建模型
- `POST /api/training/start` - 开始训练
- `POST /api/training/stop` - 停止训练
- `GET /api/training/status/{model_id}` - 获取训练状态
- `DELETE /api/training/model/{model_id}` - 删除模型

### 推理 API

- `POST /api/inference/predict` - 执行推理
- `GET /api/inference/model/{model_id}` - 获取模型信息

---

## 常见问题

### Q1: 后端启动失败，提示模块未找到

**A**: 确保已激活虚拟环境并安装了所有依赖：
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Q2: 前端无法连接后端

**A**: 检查后端是否运行在 http://localhost:8000，前端配置是否正确。

### Q3: TensorFlow 安装失败

**A**: TensorFlow 2.15 需要 Python 3.9-3.12。确保 Python 版本正确：
```bash
python3 --version
```

### Q4: 训练时内存不足

**A**: 减小批大小（batch_size）或使用较小的数据集。

### Q5: 前端页面空白

**A**: 打开浏览器控制台查看错误信息，通常是因为：
- 后端未启动
- API 地址配置错误
- 依赖未正确安装

---

## 系统要求

### 最低配置

- **操作系统**：macOS, Linux, Windows
- **Python**：3.9 - 3.12
- **Node.js**：16.x 或更高版本
- **内存**：4GB RAM
- **存储**：500MB 可用空间

### 推荐配置

- **内存**：8GB RAM 或更高
- **存储**：2GB 可用空间
- **GPU**：支持 CUDA 的 NVIDIA GPU（可选，用于加速训练）

---

## 许可证

本项目仅用于教学目的。

---

## 联系方式

如有问题或建议，请联系课程助教。

---

**最后更新**：2025年3月1日
**版本**：1.0.0
