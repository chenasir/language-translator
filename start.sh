#!/bin/bash

# 多语言翻译助手启动脚本

echo "===================================="
echo "   多语言翻译助手 - 启动脚本"
echo "===================================="
echo

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未找到Python3，请先安装Python 3.6+"
    echo "Ubuntu/Debian: sudo apt install python3"
    echo "macOS: brew install python3"
    echo "或访问: https://www.python.org/downloads/"
    exit 1
fi

# 显示Python版本
echo "[信息] Python版本: $(python3 --version)"
echo

# 启动服务器
echo "[信息] 启动HTTP服务器..."
echo "按 Ctrl+C 停止服务器"
echo
python3 server.py