# 儿童行为管理与激励系统 - 部署指南

## 📋 项目信息

- **项目名称**: 儿童行为管理与激励系统
- **Git 仓库**: `https://github.com/yourusername/children-behavior-system.git`
- **部署平台**: Cloudflare (Pages + Workers + D1)
- **技术栈**: Vue 3 + TypeScript + Hono + Cloudflare D1

---

## 🚀 前置要求

### 1. 环境准备

```bash
# 安装 Node.js (推荐 v18+)
node -v

# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

### 2. Cloudflare 账号配置

- 注册 [Cloudflare](https://dash.cloudflare.com/sign-up) 账号
- 确保账号已验证邮箱
- 开启 Workers & Pages 功能

---

## 🗄️ 数据库配置

### 1. 创建 D1 数据库

```bash
# 创建数据库
wrangler d1 create children-behavior-db

# 输出示例：
# ✅ Successfully created DB 'children-behavior-db' in region ENAM
# [[d1_databases]]
# binding = "DB"
# database_name = "children-behavior-db"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. 配置 wrangler.toml

在 `backend/wrangler.toml` 中添加数据库配置：

```toml
name = "children-behavior-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "children-behavior-db"
database_id = "你的数据库ID"

[vars]
JWT_SECRET = "your-super-secret-jwt-key-change-this-in-production"
```

### 3. 执行数据库迁移

```bash
cd backend

# 执行迁移
wrangler d1 migrations apply children-behavior-db --local

# 生产环境
wrangler d1 migrations apply children-behavior-db
```

### 4. 数据库迁移文件说明

| 迁移文件 | 说明 |
|---------|------|
| `0001_initial.sql` | 初始表结构创建 |
| `0002_add_achievement_revoke.sql` | 添加成就撤销功能字段 |

---

## 🔧 后端部署

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

创建 `backend/.dev.vars` (开发环境):

```
JWT_SECRET=dev-jwt-secret-key
```

### 3. 本地开发

```bash
# 启动开发服务器
npm run dev

# 服务运行在 http://localhost:8787
```

### 4. 部署到 Cloudflare Workers

```bash
# 部署
wrangler deploy

# 输出示例：
# ✅ Published children-behavior-api
# https://children-behavior-api.your-account.workers.dev
```

### 5. 验证部署

```bash
# 测试 API 是否正常工作
curl https://children-behavior-api.your-account.workers.dev/api/health
```

---

## 🎨 前端部署

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 配置 API 地址

编辑 `frontend/.env.production`:

```
VITE_API_BASE_URL=https://children-behavior-api.your-account.workers.dev
```

开发环境配置 `frontend/.env.development`:

```
VITE_API_BASE_URL=http://localhost:8787
```

### 3. 本地开发

```bash
# 启动开发服务器
npm run dev

# 服务运行在 http://localhost:5173
```

### 4. 构建生产版本

```bash
# 构建
npm run build

# 输出在 dist/ 目录
```

### 5. 部署到 Cloudflare Pages

```bash
# 部署
wrangler pages deploy dist

# 或使用 Git 集成自动部署
```

### 6. Git 集成自动部署（推荐）

1. 在 Cloudflare Dashboard 中创建 Pages 项目
2. 连接 GitHub/GitLab 仓库
3. 配置构建设置：
   - **构建命令**: `npm run build`
   - **构建输出目录**: `dist`
   - **根目录**: `frontend`

---

## ⚙️ 完整部署脚本

### 一键部署脚本

创建 `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 开始部署儿童行为管理与激励系统..."

# 部署后端
echo "📦 部署后端..."
cd backend
npm install
wrangler deploy
echo "✅ 后端部署完成"

# 部署前端
echo "📦 部署前端..."
cd ../frontend
npm install
npm run build
wrangler pages deploy dist
echo "✅ 前端部署完成"

echo "🎉 部署完成！"
echo ""
echo "访问地址:"
echo "- 前端: https://children-behavior-system.pages.dev"
echo "- 后端: https://children-behavior-api.your-account.workers.dev"
```

赋予执行权限并运行：

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🔐 环境变量配置

### 必需的环境变量

| 变量名 | 说明 | 示例 |
|-------|------|------|
| `JWT_SECRET` | JWT 签名密钥 | `your-secret-key-min-32-chars` |
| `DATABASE_ID` | D1 数据库 ID | `xxx-xxx-xxx` |

### Cloudflare Dashboard 配置

1. 进入 Workers & Pages
2. 选择你的 Worker
3. 点击 **Settings** > **Variables**
4. 添加环境变量

---

## 📊 监控与日志

### 查看日志

```bash
# 实时查看日志
wrangler tail

# 查看特定时间段的日志
wrangler tail --format pretty
```

### 性能监控

在 Cloudflare Dashboard 中：
- **Workers**: 查看请求量、错误率、CPU 时间
- **Pages**: 查看访问量、核心网页指标
- **D1**: 查看查询性能

---

## 🔄 持续集成/持续部署 (CI/CD)

### GitHub Actions 配置

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install Wrangler
        run: npm install -g wrangler
      - name: Deploy Backend
        working-directory: ./backend
        run: |
          npm install
          wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Build Frontend
        working-directory: ./frontend
        run: |
          npm install
          npm run build
      - name: Deploy to Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: children-behavior-system
          directory: frontend/dist
```

### 配置 GitHub Secrets

在 GitHub 仓库设置中添加：
- `CLOUDFLARE_API_TOKEN`: Cloudflare API 令牌
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 账号 ID

---

## 🛠️ 故障排查

### 常见问题

#### 1. 数据库迁移失败

```bash
# 检查迁移状态
wrangler d1 migrations list children-behavior-db

# 手动执行特定迁移
wrangler d1 execute children-behavior-db --file=./src/db/migrations/0001_initial.sql
```

#### 2. API 返回 500 错误

```bash
# 查看日志
wrangler tail

# 本地调试
npm run dev
```

#### 3. 前端无法连接 API

- 检查 `VITE_API_BASE_URL` 配置
- 确认 API 地址正确
- 检查 CORS 配置

#### 4. 部署后样式丢失

- 检查构建输出路径
- 确认 `dist` 目录包含所有资源

---

## 📚 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [项目 Git 仓库](https://github.com/yourusername/children-behavior-system)

---

## 📝 更新日志

| 日期 | 版本 | 说明 |
|-----|------|------|
| 2026-03-20 | v1.0.0 | 初始版本部署 |

---

## 🤝 支持

如有部署问题，请联系：
- 邮箱: support@example.com
- Issues: [GitHub Issues](https://github.com/yourusername/children-behavior-system/issues)
