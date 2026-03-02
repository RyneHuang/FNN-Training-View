#!/bin/bash
# FNN 训练可视化应用 - 启动脚本 (macOS/Linux)

echo "======================================"
echo "  FNN 神经网络训练可视化应用"
echo "======================================"
echo ""

# 检查 Python 版本
echo "检查 Python 版本..."
python3 --version
if [ $? -ne 0 ]; then
    echo "错误: 未找到 Python3，请先安装 Python 3.9-3.12"
    exit 1
fi

# 检查 Node.js 版本
echo "检查 Node.js 版本..."
node --version
if [ $? -ne 0 ]; then
    echo "错误: 未找到 Node.js，请先安装 Node.js 16.x 或更高版本"
    exit 1
fi

# 启动后端
echo ""
echo "启动后端服务..."
cd backend

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
source venv/bin/activate

# 检查依赖
echo "检查后端依赖..."
pip install -q -r requirements.txt

# 启动后端服务
echo "后端服务启动在 http://localhost:8000"
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 启动前端
echo ""
echo "启动前端服务..."
cd ../frontend

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

# 启动前端服务
echo "前端服务启动在 http://localhost:5173"
echo ""
echo "======================================"
echo "  应用已启动！"
echo "  前端: http://localhost:5173"
echo "  后端: http://localhost:8000"
echo "  API文档: http://localhost:8000/docs"
echo "======================================"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

npm run dev

# 清理
kill $BACKEND_PID 2>/dev/null
