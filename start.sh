#!/bin/bash

echo "🎮 启动俄罗斯方块游戏..."
echo ""
echo "📦 正在安装依赖..."
npm install

echo ""
echo "🚀 启动开发服务器..."
echo "游戏将在浏览器中自动打开: http://localhost:8080"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev
