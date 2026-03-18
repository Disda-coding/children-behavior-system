# Cloudflare 部署指南

## 部署前准备

### 1. 安装依赖

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

### 2. 环境检查

确保你已经：
- 注册了 Cloudflare 账号
- 安装了 Wrangler CLI
- 完成了 `wrangler login` 登录

## 部署步骤

### 方式一：使用自动部署脚本

```bash
chmod +x deploy.sh
./deploy.sh
```

### 方式二：手动部署

#### 1. 创建 D1 数据库

```bash
# 创建数据库
wrangler d1 create children-behavior-db

# 记录数据库 ID，更新到 wrangler.toml
```

#### 2. 创建 R2 存储桶

```bash
# 创建存储桶（用于 PPT 文件存储）
wrangler r2 bucket create children-behavior-ppts
```

#### 3. 更新配置

编辑 `backend/wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "children-behavior-db"
database_id = "你的数据库ID"
```

#### 4. 执行数据库迁移

```bash
cd backend
wrangler d1 migrations apply children-behavior-db
```

#### 5. 部署后端

```bash
cd backend
wrangler deploy
```

记录部署后的 Workers URL，例如：
`https://children-behavior-api.your-subdomain.workers.dev`

#### 6. 构建并部署前端

```bash
cd frontend

# 创建生产环境配置
echo "VITE_API_URL=https://children-behavior-api.your-subdomain.workers.dev" > .env.production

# 构建
npm run build

# 部署到 Pages
wrangler pages deploy dist --project-name=children-behavior-system
```

## 部署后配置

### 1. 更新 JWT_SECRET

编辑 `backend/wrangler.toml`，将 `JWT_SECRET` 更改为安全的随机字符串：

```toml
[vars]
JWT_SECRET = "your-secure-random-secret-key-min-32-chars"
```

然后重新部署后端：

```bash
cd backend
wrangler deploy
```

### 2. 配置自定义域名（可选）

在 Cloudflare Dashboard 中：
- 为 Workers 配置自定义域名
- 为 Pages 配置自定义域名

### 3. 配置环境变量

如有需要，可以在 Cloudflare Dashboard 中设置加密的环境变量：

```bash
wrangler secret put JWT_SECRET
```

## 验证部署

### 1. 检查后端 API

访问：`https://your-api-url/`

应该返回：

```json
{
  "message": "Children Behavior Management System API",
  "version": "1.0.0",
  "status": "running"
}
```

### 2. 检查前端

访问：`https://children-behavior-system.pages.dev`

应该能看到登录页面。

### 3. 测试 PPT 上传

1. 注册/登录系统
2. 进入"家庭会议"页面
3. 上传 PPT 文件
4. 查看是否能正常显示和预览

## 常见问题

### 1. 数据库迁移失败

```bash
# 查看迁移状态
wrangler d1 migrations list children-behavior-db

# 手动执行迁移
wrangler d1 execute children-behavior-db --file=./src/db/migrations/0001_initial.sql
```

### 2. R2 存储桶访问失败

确保 `wrangler.toml` 中正确配置了 R2：

```toml
[[r2_buckets]]
binding = "PPT_BUCKET"
bucket_name = "children-behavior-ppts"
```

### 3. CORS 错误

后端已经配置了 CORS，如果仍有问题，检查：
- 前端 `.env.production` 中的 API URL 是否正确
- 是否使用了 HTTPS

### 4. 文件上传失败

检查：
- 文件大小是否超过 10MB
- 文件格式是否为 PPT、PPTX 或 PDF
- R2 存储桶是否存在且有写入权限

## 更新部署

### 更新后端

```bash
cd backend
wrangler deploy
```

### 更新前端

```bash
cd frontend
npm run build
wrangler pages deploy dist
```

### 更新数据库

创建新的迁移文件：

```bash
cd backend
npx drizzle-kit generate:sqlite
wrangler d1 migrations apply children-behavior-db
```

## 监控和日志

### 查看 Workers 日志

```bash
wrangler tail
```

### 查看 D1 查询日志

在 Cloudflare Dashboard > D1 > 数据库 > Query 中查看。

### 查看 R2 存储

在 Cloudflare Dashboard > R2 中查看文件。

## 安全建议

1. **使用强 JWT_SECRET**：至少 32 位随机字符
2. **启用 HTTPS**：Cloudflare 默认启用
3. **设置访问控制**：限制 R2 存储桶的访问权限
4. **定期备份**：导出 D1 数据库数据
5. **监控异常**：设置 Workers 的异常告警

## 成本估算

Cloudflare 免费额度：
- Workers: 100,000 请求/天
- D1: 500 万行读取/天，10 万行写入/天
- R2: 10 GB 存储，100 万次读取/月
- Pages: 无限请求，500 次构建/月

对于一般家庭使用，免费额度完全足够。

## 技术支持

如有问题：
1. 查看 Cloudflare 文档：https://developers.cloudflare.com/
2. 检查 Wrangler 文档：https://developers.cloudflare.com/workers/wrangler/
3. 提交 Issue 到项目仓库
