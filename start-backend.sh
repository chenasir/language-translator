#!/bin/bash

echo "🚀 启动腾讯翻译后端代理服务器..."
echo

# 检查Node.js是否已安装
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到Node.js，请先安装Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

# 检查是否存在node_modules目录
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖包..."
    echo
    npm install express cors node-fetch
    echo
fi

echo "✅ 启动代理服务器..."
echo "📡 服务地址: http://localhost:3001"
echo "🔗 翻译接口: POST http://localhost:3001/api/tencent-translate"
echo
echo "💡 保持此终端打开，然后在浏览器中使用翻译工具"
echo "⚠️  按 Ctrl+C 可以停止服务器"
echo

node backend-server.js
