# 儿童行为管理与激励系统

一个部署在 Cloudflare 平台的儿童行为管理与激励系统，通过积分、成就、奖励兑换和数据统计等机制，帮助家长管理孩子的日常行为。

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cloudflare Platform                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   前端      │    │   后端      │    │      数据库         │  │
│  │  (Pages)    │◄──►│ (Workers)   │◄──►│   (D1 SQLite)       │  │
│  │             │    │             │    │                     │  │
│  │ • 用户端    │    │ • REST API  │    │ • 用户信息          │  │
│  │ • 管理端    │    │ • 业务逻辑  │    │ • 积分记录          │  │
│  │             │    │ • 认证授权  │    │ • 成就数据          │  │
│  │             │    │             │    │ • 奖励规则          │  │
│  │             │    │             │    │ • 行为记录          │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 技术栈

### 前端
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 框架**: Tailwind CSS
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios
- **动画库**: GSAP
- **图表库**: Chart.js

### 后端
- **运行环境**: Cloudflare Workers
- **框架**: Hono
- **数据库**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **认证**: JWT
- **API 风格**: RESTful

### 部署工具
- **CLI**: Wrangler

## 项目结构

```
children-behavior-system/
├── frontend/                          # 前端项目
│   ├── src/
│   │   ├── components/                # 公共组件
│   │   ├── views/                     # 页面视图
│   │   │   ├── child/                 # 儿童端页面
│   │   │   └── parent/                # 家长端页面
│   │   ├── stores/                    # Pinia 状态管理
│   │   ├── router/                    # 路由配置
│   │   ├── api/                       # API 接口
│   │   └── assets/                    # 静态资源
│   └── package.json
│
├── backend/                           # 后端项目
│   ├── src/
│   │   ├── routes/                    # 路由定义
│   │   ├── db/                        # 数据库相关
│   │   └── index.ts                   # 入口文件
│   ├── wrangler.toml                  # Wrangler 配置
│   └── package.json
│
├── shared/                            # 共享类型定义
│   └── types/
│
└── doc/                               # 文档
    ├── prd/                           # 产品需求文档
    ├── api/                           # API 文档
    └── deploy/                        # 部署文档
```

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd children-behavior-system
```

### 2. 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 3. 配置环境变量

#### 前端
创建 `frontend/.env` 文件：
```env
VITE_API_URL=http://localhost:8787
```

#### 后端
编辑 `backend/wrangler.toml` 文件，配置数据库信息：
```toml
[[d1_databases]]
binding = "DB"
database_name = "children-behavior-db"
database_id = "your-database-id"
```

### 4. 本地开发

#### 启动后端服务
```bash
cd backend
npm run dev
```

#### 启动前端服务
```bash
cd frontend
npm run dev
```

### 5. 部署

#### 部署后端
```bash
cd backend
wrangler deploy
```

#### 部署前端
```bash
cd frontend
npm run build
wrangler pages deploy dist
```

## 数据库迁移

### 创建数据库
```bash
wrangler d1 create children-behavior-db
```

### 执行迁移
```bash
wrangler d1 migrations apply children-behavior-db
```

## 功能特性

### 用户端（小孩端）
- 📊 积分展示（今日、本周、总积分）
- 🏆 成就系统（支持连续型、次数型、累积型）
- 🎁 奖励兑换（实物、虚拟、活动、现金）
- 📝 申诉系统
- 🗣️ 家庭会议（PPT 展示与评分）

### 管理端（家长端）
- 👨‍👩‍👧‍👦 家庭成员管理
- 📋 积分规则管理
- 🏅 成就模板管理
- 🎁 奖励兑换管理
- 📈 数据统计与图表
- ✅ 申诉审核
- 📅 会议管理

## 核心功能

### 积分系统
- 支持积分赚取和扣除
- 积分规则可配置
- 积分历史记录
- 积分统计图表

### 成就系统
- 连续型成就（连续7天、21天、365天）
- 次数型成就（完成50次家务）
- 累积型成就（学习100小时）
- 成就模板机制
- 成就获得动画

### 奖励系统
- 实物奖励（小礼物、玩具、书籍）
- 虚拟奖励（电子游戏时长）
- 活动奖励（去公园、外出活动）
- 现金奖励
- 阶梯价格机制（游戏时间兑换）

### 申诉与会议
- 积分申诉机制
- 家庭会议申请
- PPT 上传与展示
- 会议评分系统

## 安全特性

- JWT 身份认证
- 密码 SHA-256 加密
- 角色权限控制
- API 速率限制
- 儿童隐私保护

## 部署环境

- **平台**: Cloudflare
- **前端**: Cloudflare Pages
- **后端**: Cloudflare Workers
- **数据库**: Cloudflare D1 (SQLite)
- **CDN**: Cloudflare CDN

## 开发计划

### 第一阶段：基础架构 ✅
- [x] 项目初始化
- [x] 数据库设计
- [x] 基础组件
- [x] 路由配置

### 第二阶段：用户认证 ✅
- [x] 注册/登录
- [x] JWT 认证
- [x] 家庭管理

### 第三阶段：积分系统 ✅
- [x] 积分规则
- [x] 积分记录
- [x] 积分统计

### 第四阶段：成就系统 🚧
- [x] 成就模板
- [ ] 成就动画
- [ ] 进度追踪

### 第五阶段：奖励系统 🚧
- [x] 奖励管理
- [x] 阶梯价格
- [ ] 兑换流程

### 第六阶段：申诉与会议 🚧
- [x] 申诉系统
- [x] 会议系统
- [ ] PPT 上传

### 第七阶段：数据统计 🚧
- [ ] 统计图表
- [ ] 数据导出
- [ ] 日志系统

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。

---

**注意**: 这是一个教育性质的项目，旨在帮助家长更好地管理和激励孩子的日常行为。请根据孩子的实际情况合理使用。
