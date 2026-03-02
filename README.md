# FNN 神经网络训练与推理可视化教学应用 v2.0

一个与人工智能导论课程配套的 Web 应用，让学生直观感受前馈神经网络（FNN）的训练与推理过程。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.9%2B-blue)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18%2B-blue)](https://react.dev/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15-orange)](https://www.tensorflow.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)](https://fastapi.tiangolo.com/)
[![GitHub Stars](https://img.shields.io/github/stars/RyneHuang/FNN-Training-View?style=social)](https://github.com/RyneHuang/FNN-Training-View/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/RyneHuang/FNN-Training-View)](https://github.com/RyneHuang/FNN-Training-View/issues)

[English](README_EN.md) | [简体中文](README.md) | [部署指南](README_部署.md) | [贡献指南](CONTRIBUTING.md)

---

## 🆕 v2.0 新特性

### 多用户 Session 隔离
- ✅ **Session 隔离**：不同用户的数据完全隔离
- ✅ **并行训练**：多个用户可以同时训练不同的模型
- ✅ **推理隔离**：用户只能访问自己训练的模型
- ✅ **自动管理**：无需登录，自动生成 session

**部署场景**：学校服务器，学生各自通过 WEB 访问

### 离线部署支持
- ✅ **预生成数据集缓存**：16 种数据集预打包，无需联网下载
- ✅ **缓存优先加载**：优先使用本地缓存，提升加载速度

---

## 📸 功能预览

| 训练可视化 | 网络结构 | 推理分析 | 数据集浏览 |
|------------|----------|----------|------------|
| 实时 Loss/Accuracy 曲线 | 垂直层级布局 | 逐层激活值展示 | Excel 风格表格 |
| 过拟合检测 | 可配置隐藏层 | 权重可视化 | 详细数据说明 |
| 训练建议 | 推荐配置 | 分类/回归支持 | 16 种数据集 |

---

## 🎯 功能特性

### 核心功能
- **16 种内置数据集**：包括逻辑门、鸢尾花、手写数字、月亮/圆形等经典数据集，以及乳腺癌、葡萄酒、房价预测等真实世界数据集
- **实时训练可视化**：训练过程中实时显示 Loss/Accuracy 曲线
- **网络结构可视化**：垂直布局展示输入层 → 隐藏层 → 输出层的网络结构
- **逐层推理可视化**：展示每一层的激活值和权重，理解数据在网络中的流动
- **数据集表格视图**：Excel 风格的数据浏览，支持查看所有样本
- **数据集详细说明**：每个数据集都有背景介绍、特征含义等信息

### 训练指导
- **实时训练建议**：根据训练状态提供上下文相关的建议
- **过拟合检测**：当验证 Loss 持续上升时自动警告
- **问题专用指标**：分类问题显示准确率，回归问题专注损失值

---

## 🛠 技术栈

### 后端
- **Python** 3.9+
- **FastAPI** 0.104 - 高性能异步 Web 框架
- **TensorFlow/Keras** 2.15 - 深度学习框架
- **scikit-learn** 1.3.2 - 数据集生成与预处理

### 前端
- **React** 18 + **TypeScript**
- **Vite** - 极速构建工具
- **Zustand** - 轻量级状态管理
- **Recharts** - 训练曲线可视化
- **Tailwind CSS** + **shadcn/ui** - 现代 UI 组件库

---

## 📦 项目结构

```
FNN-Training-View/
├── backend/                    # Python 后端
│   ├── app/
│   │   ├── main.py            # FastAPI 入口
│   │   ├── api/
│   │   │   ├── datasets.py    # 数据集 API
│   │   │   ├── training.py    # 训练 API（支持 session 隔离）
│   │   │   ├── inference.py   # 推理 API
│   │   │   ├── models.py      # 数据模型
│   │   │   └── dependencies.py # Session 依赖注入
│   │   ├── data/
│   │   │   ├── classification.py  # 9 种分类数据集
│   │   │   ├── regression.py      # 7 种回归数据集
│   │   │   └── cache/             # 预生成的 .npz 缓存文件
│   │   ├── middleware/
│   │   │   └── session.py     # Session 中间件（多用户支持）
│   │   └── utils/
│   │       └── model.py       # 模型管理器（嵌套字典结构）
│   └── requirements.txt
│
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── DatasetSelector/  # 数据集选择（含表格视图）
│   │   │   ├── NeuralNetwork/    # 网络配置面板
│   │   │   ├── Training/         # 训练面板（含建议）
│   │   │   ├── Inference/        # 推理可视化
│   │   │   └── Visualization/    # 图表与网络图
│   │   ├── store/            # Zustand 状态管理
│   │   ├── types/            # TypeScript 类型定义
│   │   └── pages/            # 页面组件
│   └── package.json
│
├── .github/                    # GitHub 配置
│   ├── ISSUE_TEMPLATE/        # Issue 模板
│   └── PULL_REQUEST_TEMPLATE.md
├── README.md                   # 项目说明（本文件）
├── README_EN.md                # 英文版 README
├── README_部署.md              # 详细部署指南（中文）
├── CONTRIBUTING.md             # 贡献指南
├── CHANGELOG.md                # 更新日志
├── LICENSE                     # MIT 开源许可证
└── start.sh / start.bat        # 启动脚本
```

---

## 🚀 快速开始

### 环境要求
- Python 3.9+
- Node.js 16+
- （可选）支持 CUDA 的 GPU，用于加速训练

### 后端安装

```bash
cd backend

# 创建虚拟环境（推荐）
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 启动服务
uvicorn app.main:app --reload --port 8000
```

后端将运行在 http://localhost:8000

### 前端安装

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 http://localhost:5173

### 使用启动脚本（推荐）

```bash
# macOS/Linux
./start.sh

# Windows
start.bat
```

---

## 📚 支持的数据集

### 分类数据集（9 种）

| 数据集 | 特征数 | 类别数 | 样本数 | 难度 | 说明 |
|--------|--------|--------|--------|------|------|
| xor | 2 | 2 | 500 | 中等 | 异或逻辑门 |
| and | 2 | 2 | 500 | 简单 | 与逻辑门 |
| or | 2 | 2 | 500 | 简单 | 或逻辑门 |
| iris | 4 | 3 | 150 | 中等 | 鸢尾花分类 |
| mnist_simple | 64 | 10 | 1797 | 困难 | 手写数字识别（8x8） |
| moons | 2 | 2 | 500 | 中等 | 月亮数据集 |
| circles | 2 | 2 | 500 | 中等 | 同心圆数据集 |
| breast_cancer | 30 | 2 | 569 | 困难 | 乳腺癌诊断 |
| wine | 13 | 3 | 178 | 中等 | 葡萄酒分类 |

### 回归数据集（7 种）

| 数据集 | 特征数 | 样本数 | 难度 | 说明 |
|--------|--------|--------|------|------|
| linear | 1 | 500 | 简单 | 线性回归 y=2x+3 |
| sine | 1 | 500 | 中等 | 正弦波拟合 |
| polynomial | 1 | 500 | 中等 | 多项式回归 y=0.5x²-2x+1 |
| exponential | 1 | 500 | 中等 | 指数函数 y=e^(0.5x) |
| multilinear | 3 | 500 | 中等 | 多元线性回归 |
| california_housing | 8 | 20640 | 困难 | 加州房价预测 |
| diabetes | 10 | 442 | 中等 | 糖尿病进展预测 |

---

## ⚙️ 网络配置选项

### 支持的配置
- **隐藏层数量**：0-5 层
- **每层神经元数量**：1-128
- **激活函数**：ReLU, Sigmoid, Tanh, Linear, Softmax, Leaky ReLU
- **优化器**：Adam, SGD, RMSprop, Adamax
- **损失函数**：MSE, Binary Crossentropy, Categorical Crossentropy
- **学习率**：0.0001 - 0.1
- **批大小**：1 - 128
- **训练轮数**：1 - 1000

### 推荐配置

每个数据集都有预配置的推荐网络结构。学生可以根据以下情况调整：
- **欠拟合**：增加层数/神经元数量，调整学习率
- **过拟合**：减少网络规模，考虑正则化
- **收敛慢**：提高学习率，更换优化器

---

## 📡 API 端点

### 数据集 API
- `GET /api/datasets` - 获取所有可用数据集列表
- `GET /api/datasets/{name}` - 获取指定数据集

### 训练 API
- `POST /api/training/create` - 创建新模型
- `POST /api/training/start` - 开始训练
- `POST /api/training/stop` - 停止训练
- `GET /api/training/status/{model_id}` - 获取训练状态
- `DELETE /api/training/model/{model_id}` - 删除模型

### 推理 API
- `POST /api/inference/predict` - 执行推理
- `GET /api/inference/model/{model_id}` - 获取模型信息

启动后端服务后，访问 http://localhost:8000/docs 查看交互式 API 文档。

---

## 🎓 使用流程

1. **选择数据集**：从 16 种内置数据集中选择一个
2. **配置网络**：设置隐藏层数量、神经元数量、激活函数和训练参数
3. **应用配置**：点击"应用配置"按钮保存设置
4. **创建并训练**：点击"创建并训练"按钮开始训练
5. **观察训练**：实时查看训练曲线和进度，接收训练建议
6. **推理测试**：训练完成后进行推理，查看逐层激活值

---

## 🚢 服务器部署

### 生产环境部署

#### 1. 后端部署（使用 Gunicorn）

```bash
cd backend
source venv/bin/activate
pip install gunicorn

# 启动生产服务器（4个工作进程）
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```

#### 2. 前端构建

```bash
cd frontend
npm run build
```

构建产物在 `frontend/dist/` 目录，可以使用 Nginx 或 Apache 托管。

#### 3. Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-server.edu;

    # 前端静态文件
    location / {
        root /path/to/FNN-Training-View/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cookie_path / /;
    }
}
```

### 并发支持

- **单服务器**（8核 CPU，32GB RAM）：4-6 个舒适并发训练，8-10 个最大并发
- **使用 Gunicorn**：可扩展到 16-24 个并发训练
- **GPU 加速**：训练速度提升 10-50 倍，并发能力显著提高

详细部署说明请查看 [README_部署.md](README_部署.md)

---

## 🎨 教学应用场景

### 课堂演示
- 直观展示神经网络训练过程
- 实时对比不同网络架构的效果
- 演示过拟合/欠拟合现象

### 学生实验
- 独立探索不同配置对训练的影响
- 培养调试和问题诊断能力
- 理解激活函数、优化器的作用

### 比较研究
- 在同一数据集上测试不同架构
- 分析模型复杂度与泛化能力的关系
- 研究学习率对收敛速度的影响

---

## 👥 多用户使用说明

### Session 隔离机制

系统使用 HTTP-Only Cookie 进行用户识别：

| 特性 | 说明 |
|------|------|
| 自动生成 | 首次访问自动生成 session_id |
| 安全存储 | 存储在 HTTP-Only cookie 中，防止 XSS |
| 完全隔离 | 不同用户的数据互不可见 |
| 无需登录 | 打开浏览器即可使用 |

### 学生操作流程

1. **打开浏览器**访问应用地址
2. **选择数据集**（16 种可选）
3. **配置网络**或使用推荐配置
4. **开始训练**
5. **训练完成后**进行推理可视化

---

## 📈 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细的版本更新历史。

---

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

---

## 📄 许可证

本项目采用 MIT 开源许可证。详见 [LICENSE](LICENSE) 文件。

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FRyneHuang%2FFNN-Training-View.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FRyneHuang%2FFNN-Training-View?ref=badge_large)

---

## 🙏 致谢

- TensorFlow 和 Keras 团队提供的深度学习框架
- scikit-learn 提供的优秀数据集集合
- React 和 Vite 社区提供的现代前端工具

---

## 📧 联系方式

- **GitHub Issues**: [提交问题](https://github.com/RyneHuang/FNN-Training-View/issues)
- **GitHub Discussions**: [参与讨论](https://github.com/RyneHuang/FNN-Training-View/discussions)

---

## ⭐ Star History

如果这个项目对您有帮助，请给我们一个 Star！

[![Star History Chart](https://api.star-history.com/svg?repos=RyneHuang/FNN-Training-View&type=Date)](https://star-history.com/#RyneHuang/FNN-Training-View&Date)

---

**版本**：2.0.0（多用户支持版）
**最后更新**：2025 年 3 月
