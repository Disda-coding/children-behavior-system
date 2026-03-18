#!/bin/bash

# 儿童行为管理与激励系统部署脚本
# 部署到 Cloudflare 平台

set -e

echo "🚀 开始部署儿童行为管理与激励系统..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 Wrangler 是否安装
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI 未安装${NC}"
    echo "请先安装 Wrangler: npm install -g wrangler"
    exit 1
fi

# 检查是否登录
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  未登录 Cloudflare${NC}"
    echo "请先运行: wrangler login"
    exit 1
fi

echo -e "${BLUE}✓ Wrangler 已安装并登录${NC}"

# 创建 D1 数据库
echo -e "\n${BLUE}📦 创建 D1 数据库...${NC}"
if ! wrangler d1 list | grep -q "children-behavior-db"; then
    echo "创建数据库 children-behavior-db..."
    wrangler d1 create children-behavior-db
    echo -e "${GREEN}✓ 数据库创建成功${NC}"
else
    echo -e "${YELLOW}数据库已存在，跳过创建${NC}"
fi

# 获取数据库 ID
DB_ID=$(wrangler d1 list | grep "children-behavior-db" | awk '{print $1}')
echo -e "${BLUE}数据库 ID: $DB_ID${NC}"

# 更新 wrangler.toml
echo -e "\n${BLUE}📝 更新 wrangler.toml...${NC}"
sed -i.bak "s/database_id = \"your-database-id\"/database_id = \"$DB_ID\"/" backend/wrangler.toml
echo -e "${GREEN}✓ wrangler.toml 已更新${NC}"

# 创建 R2 存储桶
echo -e "\n${BLUE}📦 创建 R2 存储桶...${NC}"
if ! wrangler r2 bucket list | grep -q "children-behavior-ppts"; then
    echo "创建存储桶 children-behavior-ppts..."
    wrangler r2 bucket create children-behavior-ppts
    echo -e "${GREEN}✓ 存储桶创建成功${NC}"
else
    echo -e "${YELLOW}存储桶已存在，跳过创建${NC}"
fi

# 执行数据库迁移
echo -e "\n${BLUE}🔄 执行数据库迁移...${NC}"
cd backend
wrangler d1 migrations apply children-behavior-db --local
echo -e "${GREEN}✓ 数据库迁移完成${NC}"

# 部署后端
echo -e "\n${BLUE}🚀 部署后端到 Cloudflare Workers...${NC}"
wrangler deploy
echo -e "${GREEN}✓ 后端部署成功${NC}"

# 获取后端 URL
BACKEND_URL=$(wrangler deployment list | grep -o 'https://[^[:space:]]*' | head -1)
echo -e "${BLUE}后端 URL: $BACKEND_URL${NC}"

cd ..

# 构建前端
echo -e "\n${BLUE}🏗️  构建前端...${NC}"
cd frontend

# 创建 .env.production
echo "VITE_API_URL=$BACKEND_URL" > .env.production
echo -e "${GREEN}✓ 环境变量已配置${NC}"

npm run build
echo -e "${GREEN}✓ 前端构建成功${NC}"

# 部署前端到 Pages
echo -e "\n${BLUE}🚀 部署前端到 Cloudflare Pages...${NC}"
wrangler pages deploy dist --project-name=children-behavior-system
echo -e "${GREEN}✓ 前端部署成功${NC}"

cd ..

echo -e "\n${GREEN}🎉 部署完成！${NC}"
echo -e "${BLUE}前端访问地址: https://children-behavior-system.pages.dev${NC}"
echo -e "${BLUE}后端 API 地址: $BACKEND_URL${NC}"
echo ""
echo -e "${YELLOW}⚠️  注意事项:${NC}"
echo "1. 请更新 backend/wrangler.toml 中的 JWT_SECRET 为安全的随机字符串"
echo "2. 建议配置自定义域名"
echo "3. 生产环境请启用 HTTPS 和适当的安全策略"
