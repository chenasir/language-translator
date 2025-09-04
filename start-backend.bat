@echo off
echo 🚀 启动腾讯翻译后端代理服务器...
echo.

REM 检查Node.js是否已安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查是否存在node_modules目录
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖包...
    echo.
    npm install express cors node-fetch
    echo.
)

echo ✅ 启动代理服务器...
echo 📡 服务地址: http://localhost:3001
echo 🔗 翻译接口: POST http://localhost:3001/api/tencent-translate
echo.
echo 💡 保持此窗口打开，然后在浏览器中使用翻译工具
echo ⚠️  按 Ctrl+C 可以停止服务器
echo.

node backend-server.js

pause
