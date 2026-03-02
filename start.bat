@echo off
REM FNN 训练可视化应用 - 启动脚本 (Windows)

echo ======================================
echo   FNN 神经网络训练可视化应用
echo ======================================
echo.

REM 检查 Python 版本
echo 检查 Python 版本...
python --version
if errorlevel 1 (
    echo 错误: 未找到 Python，请先安装 Python 3.9-3.12
    pause
    exit /b 1
)

REM 检查 Node.js 版本
echo 检查 Node.js 版本...
node --version
if errorlevel 1 (
    echo 错误: 未找到 Node.js，请先安装 Node.js 16.x 或更高版本
    pause
    exit /b 1
)

REM 启动后端
echo.
echo 启动后端服务...
cd backend

REM 检查虚拟环境
if not exist "venv" (
    echo 创建虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
call venv\Scripts\activate.bat

REM 检查依赖
echo 检查后端依赖...
pip install -q -r requirements.txt

REM 启动后端服务（在新窗口中）
start "FNN Backend" cmd /k "uvicorn app.main:app --reload --port 8000"

REM 等待后端启动
timeout /t 3 /nobreak > nul

REM 启动前端
echo.
echo 启动前端服务...
cd ..\frontend

REM 检查依赖
if not exist "node_modules" (
    echo 安装前端依赖...
    call npm install
)

REM 启动前端服务
echo 前端服务启动在 http://localhost:5173
echo.
echo ======================================
echo   应用已启动！
echo   前端: http://localhost:5173
echo   后端: http://localhost:8000
echo   API文档: http://localhost:8000/docs
echo ======================================
echo.
echo 关闭此窗口将停止前端服务，后端服务在单独窗口中运行
echo.

call npm run dev
