@echo off
title 多语言翻译助手
echo.
echo ====================================
echo    多语言翻译助手 - 启动脚本
echo ====================================
echo.
echo 正在启动本地服务器...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到Python，请先安装Python 3.6+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM 启动服务器
echo [信息] 启动HTTP服务器...
python server.py

echo.
echo 按任意键退出...
pause >nul