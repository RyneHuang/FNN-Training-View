# FNN 训练与推理可视化教学应用

一个与人工智能导论课程配套的 Web 应用，让学生直观感受前馈神经网络 (FNN) 的训练与推理过程。

## 功能特性

- **可视化网络结构**：直观展示神经网络的层级结构和连接关系
- **后端训练**：使用 TensorFlow/Keras 在服务端进行模型训练
- **实时进度**：通过轮询获取训练进度，观察 Loss 和 Accuracy 变化
- **推理可视化**：逐层展示神经元的激活值，理解数据在网络中的流动
- **多种数据集**：内置分类和回归数据集

## 技术栈

### 后端
- Python 3.10+
- FastAPI
- TensorFlow 2.15 / Keras
- NumPy, scikit-learn

### 前端
- React 18 + TypeScript
- Vite
- Recharts（图表）
- Zustand（状态管理）
- Tailwind CSS

## 项目结构

```
FNN_Training_View/
├── backend/                    # Python 后端
│   ├── app/
│   │   ├── main.py            # FastAPI 入口
│   │   ├── api/
│   │   │   ├── datasets.py    # 数据集 API
│   │   │   ├── training.py    # 训练 API
│   │   │   ├── inference.py   # 推理 API
│   │   │   └── models.py      # 数据模型
│   │   ├── data/
│   │   │   ├── classification.py  # 分类数据集
│   │   │   └── regression.py      # 回归数据集
│   │   └── utils/
│   │       └── model.py       # 模型管理
│   └── requirements.txt
│
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── components/        # UI 组件
│   │   ├── lib/
│   │   │   └── api.ts         # API 客户端
│   │   ├── store/             # Zustand 状态管理
│   │   ├── types/             # TypeScript 类型定义
│   │   └── pages/             # 页面
│   └── package.json
│
└── README.md
```

## 快速开始

### 后端设置

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

后端将在 http://localhost:8000 运行

### 前端设置

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:5173 运行

### 使用启动脚本

```bash
# Linux/Mac
./start.sh

# Windows
start.bat
```

## 支持的数据集

### 分类数据集
- XOR 逻辑门
- AND 逻辑门
- OR 逻辑门
- 鸢尾花 (Iris)
- 简化手写数字 (8x8 MNIST)
- 月亮数据集
- 圆形数据集

### 回归数据集
- 线性回归
- 正弦波拟合
- 多项式回归
- 指数函数
- 多元线性回归

## 支持的配置

- **网络层数**：1-5 层
- **激活函数**：ReLU, Sigmoid, Tanh, Linear, Softmax, Leaky ReLU
- **优化器**：Adam, SGD, RMSprop, Adamax
- **损失函数**：MSE, Binary Crossentropy, Categorical Crossentropy

## API 文档

启动后端服务后，访问 http://localhost:8000/docs 查看 API 文档。

### 主要端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/datasets` | GET | 获取所有数据集 |
| `/api/datasets/{name}` | GET | 获取指定数据集 |
| `/api/training/create` | POST | 创建模型 |
| `/api/training/start` | POST | 开始训练 |
| `/api/training/status/{model_id}` | GET | 获取训练状态 |
| `/api/inference/predict` | POST | 执行推理 |

## 使用流程

1. **选择数据集**：在训练页面左侧选择一个数据集
2. **配置网络**：设置网络层数、神经元数量、激活函数和训练参数
3. **应用配置**：点击"应用配置"按钮保存设置
4. **创建并训练**：点击"创建并训练"按钮开始训练
5. **观察训练**：实时查看训练曲线和进度
6. **推理测试**：训练完成后切换到推理页面进行测试

## License

MIT
