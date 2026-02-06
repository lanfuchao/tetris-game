#!/bin/bash

echo "🚀 构建生产版本..."
echo ""

# 清理旧的构建
npm run clean

# 构建
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 构建成功!"
    echo ""
    echo "📦 构建产物位于 dist/ 目录"
    echo ""
    echo "部署选项:"
    echo "1. 将 dist/ 目录内容上传到静态托管服务"
    echo "2. 使用 'npx serve dist' 本地预览"
    echo ""

    # 询问是否本地预览
    read -p "是否启动本地预览服务器? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "启动预览服务器..."
        npx serve dist
    fi
else
    echo ""
    echo "❌ 构建失败"
    exit 1
fi
