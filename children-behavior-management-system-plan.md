# 儿童行为管理与激励系统实施计划

## 项目概述

本系统是一个部署在 Cloudflare 平台的儿童行为管理与激励系统，包含前端、后端（Cloudflare Workers）和数据库（Cloudflare D1 SQLite），通过积分、成就、奖励兑换和数据统计等机制，帮助家长管理孩子的日常行为。

---

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

---

## 技术栈选择

### 前端
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI 框架**: Tailwind CSS + 自定义组件
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios
- **动画库**: GSAP (用于成就动画和积分翻页效果)
- **图表库**: Chart.js (用于数据统计)

### 后端
- **运行环境**: Cloudflare Workers
- **框架**: Hono (轻量级、高性能)
- **数据库**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **认证**: JWT
- **API 风格**: RESTful

### 部署工具
- **CLI**: Wrangler

---

## 目录结构

```
children-behavior-system/
├── frontend/                          # 前端项目
│   ├── src/
│   │   ├── components/                # 公共组件
│   │   │   ├── common/                # 通用组件
│   │   │   ├── child/                 # 儿童端组件
│   │   │   └── parent/                # 家长端组件
│   │   ├── views/                     # 页面视图
│   │   │   ├── child/                 # 儿童端页面
│   │   │   │   ├── Dashboard.vue      # 积分展示首页
│   │   │   │   ├── Achievements.vue   # 成就系统
│   │   │   │   ├── Rewards.vue        # 奖励兑换
│   │   │   │   ├── Appeal.vue         # 申诉系统
│   │   │   │   └── Meeting.vue        # 会议系统
│   │   │   └── parent/                # 家长端页面
│   │   │       ├── Dashboard.vue      # 管理首页
│   │   │       ├── Achievements.vue   # 成就管理
│   │   │       ├── Points.vue         # 积分规则管理
│   │   │       ├── Rewards.vue        # 奖励管理
│   │   │       ├── Statistics.vue     # 数据统计
│   │   │       ├── Appeals.vue        # 申诉审核
│   │   │       └── Meetings.vue       # 会议管理
│   │   ├── stores/                    # Pinia 状态管理
│   │   ├── router/                    # 路由配置
│   │   ├── api/                       # API 接口
│   │   ├── utils/                     # 工具函数
│   │   └── assets/                    # 静态资源
│   ├── public/
│   └── package.json
│
├── backend/                           # 后端项目
│   ├── src/
│   │   ├── routes/                    # 路由定义
│   │   ├── handlers/                  # 请求处理器
│   │   ├── models/                    # 数据模型
│   │   ├── middleware/                # 中间件
│   │   ├── services/                  # 业务逻辑
│   │   ├── utils/                     # 工具函数
│   │   └── db/                        # 数据库相关
│   │       ├── schema.ts              # 数据库表结构
│   │       └── migrations/            # 数据库迁移文件
│   ├── wrangler.toml                  # Wrangler 配置
│   └── package.json
│
├── shared/                            # 共享类型定义
│   └── types/
│       ├── user.ts
│       ├── points.ts
│       ├── achievement.ts
│       ├── reward.ts
│       └── index.ts
│
└── doc/                               # 文档
    ├── prd/                           # 产品需求文档
    ├── api/                           # API 文档
    └── deploy/                        # 部署文档
```

---

## 数据库设计

### 表结构

```sql
-- 用户表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('child', 'parent')),
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    family_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 家庭表
CREATE TABLE families (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 积分记录表
CREATE TABLE point_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('earn', 'deduct', 'redeem', 'convert')),
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reason TEXT NOT NULL,
    rule_id INTEGER,
    related_record_id INTEGER,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (rule_id) REFERENCES point_rules(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 积分规则表
CREATE TABLE point_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK(type IN ('earn', 'deduct')),
    points INTEGER NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id)
);

-- 成就表
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id INTEGER,
    template_id INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    condition_type TEXT NOT NULL CHECK(condition_type IN ('consecutive', 'count', 'accumulate')),
    condition_value INTEGER NOT NULL,
    condition_unit TEXT,
    reward_points INTEGER DEFAULT 0,
    is_template BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id)
);

-- 用户成就表
CREATE TABLE user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT 0,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

-- 奖励表
CREATE TABLE rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK(type IN ('physical', 'virtual', 'activity', 'cash')),
    points_cost INTEGER NOT NULL,
    icon_url TEXT,
    stock INTEGER,
    is_active BOOLEAN DEFAULT 1,
    config JSON,  -- 存储额外配置，如游戏时间的阶梯价格
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id)
);

-- 奖励兑换记录表
CREATE TABLE reward_redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reward_id INTEGER NOT NULL,
    points_spent INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'completed')),
    note TEXT,
    approved_by INTEGER,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reward_id) REFERENCES rewards(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- 申诉表
CREATE TABLE appeals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    point_record_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    response TEXT,
    handled_by INTEGER,
    handled_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (point_record_id) REFERENCES point_records(id),
    FOREIGN KEY (handled_by) REFERENCES users(id)
);

-- 会议表
CREATE TABLE meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id INTEGER NOT NULL,
    child_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    ppt_url TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'scheduled', 'completed', 'cancelled')),
    scheduled_at DATETIME,
    score INTEGER,
    score_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id),
    FOREIGN KEY (child_id) REFERENCES users(id)
);

-- 系统日志表
CREATE TABLE system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    old_value JSON,
    new_value JSON,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 兑换比例配置表
CREATE TABLE exchange_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id INTEGER NOT NULL,
    cash_to_points_rate INTEGER NOT NULL DEFAULT 10,  -- 1元现金 = X积分
    points_to_cash_rate INTEGER NOT NULL DEFAULT 100, -- X积分 = 1元现金
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(id)
);
```

---

## 实施阶段

### 第一阶段：项目初始化与基础架构（预计 2 天）

#### 1.1 项目结构搭建
- [ ] 创建项目根目录和子目录结构
- [ ] 初始化前端项目（Vue 3 + Vite + TypeScript）
- [ ] 初始化后端项目（Cloudflare Workers + Hono）
- [ ] 配置共享类型定义
- [ ] 设置代码规范（ESLint + Prettier）

#### 1.2 数据库设计与初始化
- [ ] 设计完整的数据库表结构
- [ ] 使用 Drizzle ORM 定义 Schema
- [ ] 创建数据库迁移文件
- [ ] 配置 Wrangler 和 D1 数据库

#### 1.3 基础组件与工具
- [ ] 配置 Tailwind CSS
- [ ] 创建基础 UI 组件库
- [ ] 设置 API 请求封装
- [ ] 配置路由和状态管理

### 第二阶段：用户认证与家庭管理（预计 2 天）

#### 2.1 后端实现
- [ ] 用户注册/登录 API
- [ ] JWT 认证中间件
- [ ] 家庭创建/加入 API
- [ ] 家庭成员管理 API

#### 2.2 前端实现
- [ ] 登录/注册页面
- [ ] 家庭创建/加入页面
- [ ] 路由守卫和权限控制
- [ ] 用户信息管理

### 第三阶段：积分系统核心功能（预计 3 天）

#### 3.1 后端实现
- [ ] 积分规则 CRUD API
- [ ] 积分记录 API
- [ ] 积分计算服务
- [ ] 积分统计 API

#### 3.2 前端实现
- [ ] 儿童端积分展示页面（含翻页动画）
- [ ] 家长端积分规则管理页面
- [ ] 积分记录列表
- [ ] 积分统计图表

### 第四阶段：成就系统（预计 3 天）

#### 4.1 后端实现
- [ ] 成就模板管理 API
- [ ] 成就创建/编辑 API
- [ ] 成就进度追踪服务
- [ ] 成就达成检测与奖励发放

#### 4.2 前端实现
- [ ] 成就展示页面（含 Apple Watch 风格动画）
- [ ] 成就管理页面
- [ ] 成就模板选择器
- [ ] 成就获得动画组件

### 第五阶段：奖励兑换系统（预计 3 天）

#### 5.1 后端实现
- [ ] 奖励 CRUD API
- [ ] 奖励兑换逻辑（含阶梯价格计算）
- [ ] 兑换审核 API
- [ ] 现金/积分兑换 API

#### 5.2 前端实现
- [ ] 奖励展示页面
- [ ] 奖励管理页面
- [ ] 兑换确认流程
- [ ] 兑换历史记录

### 第六阶段：申诉与会议系统（预计 3 天）

#### 6.1 后端实现
- [ ] 申诉提交/审核 API
- [ ] 会议创建/管理 API
- [ ] PPT 上传/存储
- [ ] 会议评分 API

#### 6.2 前端实现
- [ ] 申诉提交页面
- [ ] 申诉审核页面
- [ ] 会议申请页面
- [ ] PPT 上传与展示
- [ ] 会议评分页面

### 第七阶段：数据统计与日志（预计 2 天）

#### 7.1 后端实现
- [ ] 统计数据聚合 API
- [ ] 日志记录服务
- [ ] 数据导出 API

#### 7.2 前端实现
- [ ] 数据统计仪表板
- [ ] 图表组件（Chart.js）
- [ ] 日志查看页面
- [ ] 数据导出功能

### 第八阶段：数据导入导出与优化（预计 2 天）

#### 8.1 后端实现
- [ ] 成就系统 JSON 导入/导出 API
- [ ] 积分规则 JSON 导入/导出 API
- [ ] 数据验证与迁移

#### 8.2 前端实现
- [ ] 导入/导出界面
- [ ] 文件上传/下载组件
- [ ] 数据预览与确认

### 第九阶段：部署与测试（预计 2 天）

#### 9.1 部署配置
- [ ] Wrangler 配置优化
- [ ] 环境变量配置
- [ ] 生产环境部署

#### 9.2 测试
- [ ] 单元测试
- [ ] 集成测试
- [ ] 端到端测试
- [ ] 性能测试

---

## API 设计概览

### 认证相关
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
DELETE /api/auth/logout
```

### 用户与家庭
```
GET    /api/users/me
PUT    /api/users/me
POST   /api/families
GET    /api/families/:id
POST   /api/families/:id/join
GET    /api/families/:id/members
```

### 积分系统
```
GET    /api/points/rules
POST   /api/points/rules
PUT    /api/points/rules/:id
DELETE /api/points/rules/:id
POST   /api/points/records
GET    /api/points/records
GET    /api/points/stats
GET    /api/points/balance
```

### 成就系统
```
GET    /api/achievements
POST   /api/achievements
PUT    /api/achievements/:id
DELETE /api/achievements/:id
GET    /api/achievements/templates
GET    /api/users/:id/achievements
POST   /api/achievements/:id/progress
```

### 奖励系统
```
GET    /api/rewards
POST   /api/rewards
PUT    /api/rewards/:id
DELETE /api/rewards/:id
POST   /api/rewards/:id/redeem
GET    /api/rewards/redemptions
PUT    /api/rewards/redemptions/:id/approve
```

### 申诉系统
```
POST   /api/appeals
GET    /api/appeals
PUT    /api/appeals/:id
```

### 会议系统
```
POST   /api/meetings
GET    /api/meetings
PUT    /api/meetings/:id
POST   /api/meetings/:id/score
```

### 数据统计
```
GET    /api/stats/points
GET    /api/stats/achievements
GET    /api/stats/behavior
GET    /api/export/achievements
GET    /api/export/point-rules
POST   /api/import/achievements
POST   /api/import/point-rules
```

---

## 关键技术实现要点

### 1. 积分翻页动画
使用 GSAP 实现类似日历翻页的积分数字动画效果：
- 数字变化时触发翻页动画
- 支持多个数字位同时动画
- 动画流畅，适合儿童观看

### 2. 成就获得动画
参考 Apple Watch 成就动画风格：
- 圆形进度条动画
- 粒子爆炸效果
- 徽章旋转展示
- 配合音效（可选）

### 3. 游戏时间阶梯价格计算
```typescript
function calculateGameTimeCost(hours: number): number {
  const baseCost = 200;
  const multiplier = Math.pow(2, hours - 1);
  return baseCost * multiplier;
}
// 1小时 = 200, 1.5小时 = 400, 2小时 = 800
```

### 4. 成就进度追踪
- 使用数据库触发器或定时任务检查成就条件
- 支持连续型、次数型、累积型三种成就类型
- 实时更新进度并推送通知

### 5. 数据导入导出
- 成就系统和积分规则支持 JSON 格式导入导出
- 数据验证确保格式正确
- 支持批量导入和选择性导出

---

## 部署步骤

### 1. 环境准备
```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

### 2. 数据库创建
```bash
# 创建 D1 数据库
wrangler d1 create children-behavior-db

# 执行迁移
wrangler d1 migrations apply children-behavior-db
```

### 3. 后端部署
```bash
cd backend
wrangler deploy
```

### 4. 前端部署
```bash
cd frontend
npm run build
wrangler pages deploy dist
```

---

## 安全考虑

1. **认证安全**
   - 使用 JWT 进行身份验证
   - Token 设置合理过期时间
   - 支持 Token 刷新

2. **数据安全**
   - 密码使用 bcrypt 加密存储
   - 敏感操作需要二次确认
   - 数据库访问使用参数化查询防止 SQL 注入

3. **API 安全**
   - 实施速率限制
   - 输入数据验证
   - CORS 配置

4. **儿童隐私保护**
   - 最小化收集儿童个人信息
   - 家长控制所有数据访问权限

---

## 后续扩展计划

1. **多语言支持**
   - 支持中文、英文等语言

2. **移动端优化**
   - 开发原生 App 或 PWA

3. **AI 辅助**
   - 智能行为建议
   - 自动成就推荐

4. **社交功能**
   - 家庭间成就分享
   - 排行榜（可选）

---

## 总结

本计划详细描述了儿童行为管理与激励系统的完整实施方案，包括：
- 系统架构设计
- 技术栈选择
- 数据库设计
- 分阶段实施计划
- API 设计
- 关键技术实现
- 部署步骤

预计总开发周期为 **22 天**，可根据实际情况调整各阶段时间安排。