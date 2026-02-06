#!/bin/bash

echo "🚀 准备推送到 GitHub..."
echo ""

# 检查是否已有远程仓库
if git remote | grep -q "origin"; then
    echo "✅ 远程仓库已配置"
    git remote -v
else
    echo "📝 配置远程仓库..."
    git remote add origin https://github.com/lanfuchao/tetris-game.git
    echo "✅ 远程仓库配置完成"
fi

echo ""
echo "📦 推送到 GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                  ✅ 推送成功！                                   ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🔗 仓库地址:"
    echo "   https://github.com/lanfuchao/tetris-game"
    echo ""
    echo "🌐 配置 GitHub Pages:"
    echo "   1. 访问: https://github.com/lanfuchao/tetris-game/settings/pages"
    echo "   2. Source 选择: Deploy from a branch"
    echo "   3. Branch 选择: main 和 /dist"
    echo "   4. 保存后访问: https://lanfuchao.github.io/tetris-game"
    echo ""
else
    echo ""
    echo "❌ 推送失败"
    echo ""
    echo "可能的原因:"
    echo "1. 仓库还未在 GitHub 上创建"
    echo "   → 访问 https://github.com/new 创建 tetris-game 仓库"
    echo ""
    echo "2. 需要身份验证"
    echo "   → 使用 Personal Access Token (PAT)"
    echo "   → 设置 → Developer settings → Personal access tokens"
    echo ""
    echo "3. 仓库已存在内容"
    echo "   → 使用 git push -f origin main 强制推送（谨慎使用）"
    echo ""
fi
