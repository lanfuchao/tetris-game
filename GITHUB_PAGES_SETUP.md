# GitHub Pages 部署问题修复指南

## 问题原因

错误 `Creating Pages deployment failed - Not Found (404)` 表示 GitHub Pages 功能还没有在仓库中启用。

## 解决方案

### 步骤 1: 启用 GitHub Pages

1. 访问仓库设置页面：
   ```
   https://github.com/lanfuchao/tetris-game/settings/pages
   ```

2. 在 **Build and deployment** 部分：
   - **Source**: 选择 `GitHub Actions`
   - ✅ **不要选择** "Deploy from a branch"

3. 点击保存（如果有保存按钮）

### 步骤 2: 重新运行 Workflow

1. 访问 Actions 页面：
   ```
   https://github.com/lanfuchao/tetris-game/actions
   ```

2. 找到失败的 workflow run

3. 点击 `Re-run all jobs`

### 步骤 3: 验证部署

部署成功后，访问：
```
https://lanfuchao.github.io/tetris-game
```

## 详细步骤截图说明

### 1. 进入 Pages 设置

```
仓库主页 → Settings (右上角) → Pages (左侧边栏)
```

### 2. 配置 Source

找到 "Build and deployment" 部分:

```
┌─────────────────────────────────────────┐
│ Build and deployment                    │
├─────────────────────────────────────────┤
│ Source:                                 │
│ ┌─────────────────────────────────────┐ │
│ │ [GitHub Actions]        ▼           │ │  ← 选择这个
│ └─────────────────────────────────────┘ │
│                                         │
│ ⚠️ 不要选择 "Deploy from a branch"     │
└─────────────────────────────────────────┘
```

### 3. 确认 Permissions

在仓库设置中确认 Actions 有正确权限：

```
Settings → Actions → General → Workflow permissions

选择: ✅ Read and write permissions
```

## 如果仍然失败

### 方案 A: 临时使用 Branch 部署

如果 GitHub Actions 部署持续失败，可以临时使用分支部署：

1. **Source** 选择: `Deploy from a branch`
2. **Branch** 选择: `main` 和 `/dist`
3. 点击 Save

但这需要你提交 `dist/` 目录到 git（不推荐）。

### 方案 B: 修改 .gitignore

如果使用分支部署，需要修改 `.gitignore`:

```bash
# 注释掉这一行
# dist/
```

然后：

```bash
git add dist/
git commit -m "chore: 添加构建产物用于 GitHub Pages"
git push
```

### 方案 C: 使用 gh-pages 分支

创建专门的部署分支：

```bash
npm install -D gh-pages

# 添加到 package.json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

# 部署
npm run deploy
```

然后在 Pages 设置中：
- Source: Deploy from a branch
- Branch: gh-pages / root

## 推荐方案（使用 GitHub Actions）

最佳实践是使用 GitHub Actions，配置已经正确，只需：

### ✅ 检查清单

- [ ] Pages 功能已启用
- [ ] Source 设置为 "GitHub Actions"
- [ ] Workflow permissions 设置为 "Read and write"
- [ ] 重新运行失败的 workflow

### 正确的 Pages 配置

```yaml
# .github/workflows/deploy.yml 已经正确配置

permissions:
  contents: read
  pages: write        # ← 需要这个权限
  id-token: write     # ← 需要这个权限
```

## 验证部署成功

访问以下 URL 应该显示游戏：

```
https://lanfuchao.github.io/tetris-game
```

如果看到 404，等待 1-2 分钟让 GitHub 完成部署。

## 查看部署日志

1. Actions → 选择最新的 workflow run
2. 点击 "deploy" job
3. 查看 "Deploy to GitHub Pages" 步骤
4. 应该看到：
   ```
   Created deployment for 95f5e565e14a33a82199c3409c1d501b027b2353
   ```

## 常见问题

### Q: 为什么选择 GitHub Actions 而不是分支部署？

**优势：**
- ✅ 不需要提交构建产物
- ✅ 自动化构建和部署
- ✅ 保持仓库整洁
- ✅ 每次推送自动更新

### Q: 部署后访问 404？

**可能原因：**
1. DNS 传播需要时间（等待 1-2 分钟）
2. 缓存问题（清除浏览器缓存）
3. 路径配置错误（检查 dist/ 目录）

### Q: Actions 显示权限错误？

**解决方案：**
```
Settings → Actions → General → Workflow permissions
→ 选择 "Read and write permissions"
→ 勾选 "Allow GitHub Actions to create and approve pull requests"
```

## 手动部署命令（备选）

如果 Actions 完全不工作，可以手动部署：

```bash
# 构建
npm run build

# 使用 gh-pages 工具
npx gh-pages -d dist

# 或者使用 git subtree
git subtree push --prefix dist origin gh-pages
```

## 最终确认

部署成功的标志：

1. ✅ Actions workflow 显示绿色勾号
2. ✅ Pages 设置页面显示 "Your site is live at https://..."
3. ✅ 访问 URL 能看到游戏界面

## 需要帮助？

如果按照以上步骤仍然失败，检查：

1. 仓库是否是 Public（私有仓库需要 Pro 账号）
2. GitHub 账号是否有权限启用 Pages
3. workflow 文件是否在正确位置（.github/workflows/）

---

**快速修复命令：**

```bash
# 1. 确保在正确目录
cd /Users/eric/work/games/tetris

# 2. 查看当前 git 状态
git status

# 3. 如果有更改，提交
git add .
git commit -m "docs: 添加 Pages 部署指南"
git push

# 4. 然后去 GitHub 启用 Pages 并重新运行 workflow
```
