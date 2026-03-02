# GitHub 发布步骤

## 创建 GitHub 仓库后，执行以下命令：

```bash
# 添加远程仓库（替换 YOUR_USERNAME 为您的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/FNN-Training-View.git

# 推送代码到 GitHub
git push -u origin master
```

## 推送成功后

您将看到以下功能特性：

### 核心功能
- ✅ **16 种内置数据集**：9 分类 + 7 回归
- ✅ **实时训练可视化**：Loss/Accuracy 曲线
- ✅ **网络结构可视化**：逐层推理展示
- ✅ **多用户 Session 隔离**：支持教室部署
- ✅ **离线部署支持**：预生成数据集缓存

### 技术栈
- **后端**：Python + FastAPI + TensorFlow/Keras
- **前端**：React 18 + TypeScript + Vite + Tailwind CSS

### 文件结构
```
FNN-Training-View/
├── backend/              # Python 后端
│   ├── app/
│   │   ├── api/         # API 路由
│   │   ├── data/        # 数据集生成器 + 缓存
│   │   ├── middleware/  # Session 中间件
│   │   └── utils/       # 模型管理器
│   └── requirements.txt
├── frontend/             # React 前端
│   ├── src/
│   │   ├── components/  # UI 组件
│   │   ├── pages/       # 页面
│   │   ├── store/       # Zustand 状态管理
│   │   └── types/       # TypeScript 类型
│   └── package.json
├── README.md             # 项目说明
├── README_部署.md        # 部署指南（中文）
├── start.sh              # 启动脚本 (macOS/Linux)
└── start.bat             # 启动脚本 (Windows)
```

### 部署方式

#### 开发模式
```bash
# 后端
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 前端（新终端）
cd frontend
npm install
npm run dev
```

#### 生产模式
```bash
# 使用 Gunicorn + Nginx
cd backend
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000

cd frontend
npm run build
# 使用 Nginx 托管 frontend/dist/
```

详细说明请查看 `README_部署.md`。
