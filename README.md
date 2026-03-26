# 儿童行为管理与激励系统

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.4+-green.svg" alt="Vue 3">
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Hono-4.0+-orange.svg" alt="Hono">
  <img src="https://img.shields.io/badge/Cloudflare-Workers-purple.svg" alt="Cloudflare">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
</p>

<p align="center">
  一个基于积分、成就、奖励兑换的儿童行为管理与激励系统
</p>

---

## 📖 项目简介

儿童行为管理与激励系统是一个帮助家长管理和激励孩子日常行为的 Web 应用。通过积分奖励机制、成就系统和奖励兑换，让孩子养成良好的行为习惯，同时增加亲子互动乐趣。

### ✨ 核心功能

- **🎯 积分系统**: 完成任务获得积分，不良行为扣除积分
- **🏆 成就系统**: 达成目标解锁成就，Apple Watch 风格动画展示
- **🎁 奖励兑换**: 用积分兑换游戏时间、零花钱、实物奖励等
- **📊 数据统计**: 行为数据可视化，了解孩子成长轨迹
- **🗣️ 申诉系统**: 孩子对扣分有异议可以申诉
- **👨‍👩‍👧‍👦 家庭会议**: 定期会议讨论和评分

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Cloudflare Platform                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   前端      │    │   后端      │    │      数据库         │  │
│  │  (Pages)    │◄──►│ (Workers)   │◄──►│   (D1 SQLite)       │  │
│  │             │    │             │    │                     │  │
│  │ • Vue 3     │    │ • Hono      │    │ • 用户信息          │  │
│  │ • Tailwind  │    │ • REST API  │    │ • 积分记录          │  │
│  │ • Pinia     │    │ • JWT Auth  │    │ • 成就数据          │  │
│  │             │    │             │    │ • 奖励规则          │  │
│  └─────────────┘    └─────────────┘    └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 框架**: Tailwind CSS
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios

### 后端
- **运行环境**: Cloudflare Workers
- **框架**: Hono (轻量级、高性能)
- **数据库**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **认证**: JWT

### 部署
- **平台**: Cloudflare (Pages + Workers + D1)
- **CLI**: Wrangler

---

## 📁 项目结构

```
children-behavior-system/
├── frontend/                    # 前端项目
│   ├── src/
│   │   ├── components/          # 公共组件
│   │   │   ├── common/          # 通用组件
│   │   │   │   ├── FlipNumber.vue         # 积分翻页动画
│   │   │   │   ├── AchievementBadge.vue   # 成就徽章
│   │   │   │   └── AchievementUnlockAnimation.vue  # 成就解锁动画
│   │   │   ├── child/           # 儿童端组件
│   │   │   └── parent/          # 家长端组件
│   │   ├── views/               # 页面视图
│   │   │   ├── child/           # 儿童端页面
│   │   │   │   ├── Dashboard.vue          # 积分展示首页
│   │   │   │   ├── Achievements.vue       # 成就系统
│   │   │   │   ├── Rewards.vue            # 奖励兑换
│   │   │   │   ├── Appeal.vue             # 申诉系统
│   │   │   │   └── Meeting.vue            # 会议系统
│   │   │   └── parent/          # 家长端页面
│   │   │       ├── Dashboard.vue          # 管理首页
│   │   │       ├── Achievements.vue       # 成就管理
│   │   │       ├── Points.vue             # 积分规则管理
│   │   │       ├── Rewards.vue            # 奖励管理
│   │   │       ├── Statistics.vue         # 数据统计
│   │   │       ├── Appeals.vue            # 申诉审核
│   │   │       └── Meetings.vue           # 会议管理
│   │   ├── stores/              # Pinia 状态管理
│   │   ├── router/              # 路由配置
│   │   ├── api/                 # API 接口
│   │   └── assets/              # 静态资源
│   ├── public/
│   └── package.json
│
├── backend/                     # 后端项目
│   ├── src/
│   │   ├── routes/              # 路由定义
│   │   │   ├── auth.ts          # 认证路由
│   │   │   ├── points.ts        # 积分路由
│   │   │   ├── achievements.ts  # 成就路由
│   │   │   ├── rewards.ts       # 奖励路由
│   │   │   ├── appeals.ts       # 申诉路由
│   │   │   ├── meetings.ts      # 会议路由
│   │   │   └── families.ts      # 家庭路由
│   │   ├── db/                  # 数据库相关
│   │   │   ├── schema.ts        # 数据库表结构
│   │   │   └── migrations/      # 数据库迁移文件
│   │   └── index.ts             # 入口文件
│   ├── wrangler.toml            # Wrangler 配置
│   └── package.json
│
├── doc/                         # 文档
│   ├── prd/                     # 产品需求文档
│   ├── api/                     # API 文档
│   └── deploy/                  # 部署文档
│
├── README.md                    # 项目说明
├── DEPLOY.md                    # 部署指南
└── PROGRESS.md                  # 项目进展
```

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Cloudflare 账号

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/children-behavior-system.git
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

后端配置 `backend/.dev.vars`:
```
JWT_SECRET=your-secret-key
```

前端配置 `frontend/.env.development`:
```
VITE_API_BASE_URL=http://localhost:8787
```

### 4. 启动开发服务器

```bash
# 启动后端（在 backend 目录）
npm run dev

# 启动前端（在 frontend 目录）
npm run dev
```

访问 http://localhost:5173 查看应用

---

## 📸 功能截图

### 儿童端首页
- 实时积分展示（翻页动画）
- 最近动态
- 快捷入口

### 成就系统
- 成就列表展示
- 进度追踪
- Apple Watch 风格解锁动画

### 奖励兑换
- 奖励展示
- 积分兑换
- 兑换历史

### 家长端管理
- 积分规则设置
- 成就管理
- 数据统计

---

## 🎯 核心特性

### 1. 实时积分更新
- 每10秒自动轮询服务器
- 积分变化时翻页数字动画
- 积分变化提示

### 2. 成就解锁动画
- Apple Watch 风格全屏动画
- 粒子爆炸效果
- 彩带飘落动画
- 徽章旋转展示

### 3. 成就撤销功能
- 家长可以撤销已赋予的成就
- 撤销时自动扣除积分
- 可填写撤销原因
- 支持恢复已撤销的成就

### 4. 游戏时间阶梯价格
```
1小时   = 200积分
1.5小时 = 400积分 (2倍)
2小时   = 800积分 (4倍)
```

### 5. 数据导入导出
- 成就系统 JSON 导入/导出
- 积分规则 JSON 导入/导出

---

## 📚 文档

- [部署指南](./DEPLOY.md) - 详细的部署步骤
- [项目进展](./PROGRESS.md) - 开发进度和计划
- [API 文档](./doc/api/README.md) - API 接口文档

---

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证

---

## 🙏 致谢

- [Vue.js](https://vuejs.org/)
- [Cloudflare](https://www.cloudflare.com/)
- [Hono](https://hono.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📧 联系我们

- 邮箱: your-email@example.com
- GitHub Issues: [提交问题](https://github.com/yourusername/children-behavior-system/issues)

---

<p align="center">
  Made with ❤️ for children and parents
</p>
