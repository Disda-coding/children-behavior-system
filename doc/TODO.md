# TODO List — 儿童行为管理系统 v2.0

> 基于 `doc/prd/PRD-v2.md` 与 2026-09-08 需求讨论结论。
> 状态标记：`[ ]` 未开始 / `[~]` 进行中 / `[x]` 完成
> 最后更新：2026-09-08 22:30

## ✅ 第二轮执行结果（2026-09-08 晚）

- **已上线**（本地+生产均已部署验证）：P1.3 徽章墙（四档质感 SVG + 实时进度 + 详情弹层）、P1.4 儿童商城、P2 兑换全流程前端（家长审核/驳回退分/标记兑现）、P3.1 家庭设置（三环目标+汇率+邀请码，parent/More 页）、P3.3 会议附件链接化（儿童端重做+家长端改链接）、P3.4 现金兑换（cash 类型+汇率折算显示）、P4 游戏化收尾（streak 里程碑条件类型、升级全屏庆祝、冻结卡提示已有）
- **后端 TS 错误**：72 → 51（AppEnv 统一泛型 + drizzle $dynamic 修复），剩余 51 个为逐个逻辑级修复（backups/notifications/logs/meetings 为主），运行时不受影响，记为技术债
- **P3.2 申诉页样式**、**P5.1 统计图表**、**P5.2 备份盘点**、**P5.3 Vitest**、**P5.5 文档回归**：未开始，下次继续

## 📌 已确认的产品决策（本轮讨论结论）

1. **完美一天 = 积分环 + 习惯环当日双满**（坚持环为长期激励，不参与当日判定）✅ 已改
2. **徽章按难度自动分档**：按奖励积分 `rewardPoints` 分档 —— 铜 <50 / 银 50–199 / 金 200–499 / 铂金 ≥500
3. **三环目标家长可配置**：`families` 表加 `ring_target_points`（默认 20）、`ring_target_count`（默认 3），家长端设置页可调
4. **现金兑换复用 rewards 流程**：`rewards` 表加 `is_cash` 标记，按 `families.cash_exchange_rate`（默认 100 分=1 元）折算，不加新表
5. **部署节奏**：每完成一大项即部署生产
6. 此前已定：产品名「星芽成长」；会议附件改链接形式；申诉保留

---

## ✅ 已完成

- [x] P0 设计系统（令牌/字体/图标/AppShell/路由）· 脚手架清理 · wrangler 安全修复
- [x] 成就自动达成 + 积分绑定 + 全屏庆祝动画全局化
- [x] P1.1 登录/注册页重做（品牌、密码规则实时校验、卡片式角色选择）
- [x] P1.2 游戏化后端（0005 迁移、streakService、/api/points/rings）
- [x] P1.2 儿童首页（三环/Streak火焰/等级条）+ /child/records 补页
- [x] 生产库账号重置（parent1/kid1）+ 0005 迁移同步远程
- [x] 完美一天改双环判定

---

## P1.3 — 徽章墙重做（下一步）

- [x] **1.3.1** `frontend/src/components/child/BadgeIcon.vue`：四档质感 SVG 徽章（铜/银/金/铂金渐变色板+高光），未解锁=灰度+锁定图标；档位按 `rewardPoints` 自动判定（<50/50-199/200-499/≥500）
- [x] **1.3.2** 重写 `frontend/src/views/child/Achievements.vue`：顶部等级进度+已解锁 x/y 统计；网格徽章墙（未解锁灰剪影+进度条）；点击弹详情卡（名称/条件/奖励/解锁日期）
- [x] **1.3.3** 后端 `GET /api/achievements/user/:id` 每项补 `currentProgress`（复用 achievementService 评估逻辑）

## P1.4 — 奖励商城重做（儿童端）

- [x] **1.4.1** 重写 `frontend/src/views/child/Rewards.vue`：卡片网格（图标/名称/所需积分/库存角标）；积分不足置灰+"还差 x 分"；兑换确认对话框（显示兑换后余额）
- [x] **1.4.2** "我的兑换" Tab：孩子查看兑换记录与状态（待审核/已通过/已驳回/已完成）

## P2 — 奖励兑换全流程

- [ ] **2.1** 检查 `backend/src/routes/rewards.ts` 现状，补全缺口
- [x] **2.2** `POST /api/rewards/:id/redeem`：校验库存+余额；事务式扣积分（type='redeem'）+减库存+写 redemption（status='pending'）
- [x] **2.3** 家长审核端点：approve（通知）/ reject（**退积分+回库存**+通知）/ fulfill（已完成）
- [x] **2.4** 重写 `frontend/src/views/parent/Rewards.vue`：奖励 CRUD + 待审核列表置顶（红点）+ 通过/驳回（驳回填原因）+ 全量记录筛选
- [ ] **2.5** 顺手修复 rewards.ts 历史 TS 类型错误（与其他 10 个文件的遗留错误同类）

## P3 — 家庭配置 + 事务模块

### 3.1 家庭配置（三环目标 + 现金汇率）

- [x] **3.1.1** 迁移 `0006_family_settings.sql`：`families` 加 `ring_target_points INTEGER DEFAULT 20`、`ring_target_count INTEGER DEFAULT 3`、`cash_exchange_rate INTEGER DEFAULT 100`；`rewards` 加 `is_cash INTEGER DEFAULT 0`；schema.ts 同步
- [x] **3.1.2** streakService.getRings 读家庭配置替代硬编码常量
- [x] **3.1.3** 家长端"家庭设置"页（挂到 parent/More 或新页面）：三环目标、汇率、邀请码展示

### 3.2 申诉系统（现有页面质量盘点后决定重写程度）

- [ ] **3.2.1** 盘点 child/Appeals.vue + parent/Appeals.vue + backend/routes/appeals.ts 现状（appeals 表已存在）
- [ ] **3.2.2** 补缺：驳回填理由、撤销扣分时反向积分记录、通知
- [ ] **3.2.3** 修复 appeals.ts 历史 TS 错误；按新设计令牌改版两个页面

### 3.3 会议系统（简化版）

- [ ] **3.3.1** 盘点 meetings.ts 与双端会议页现状
- [x] **3.3.2** 附件改链接：孩子粘贴腾讯文档/网盘链接，清除残留上传代码
- [ ] **3.3.3** 评分换算积分（暂硬编码 1 星=10 分）

### 3.4 现金兑换

- [x] **3.4.1** 家长创建奖励时可选"零花钱"类型（is_cash），展示按汇率折算的金额
- [x] **3.4.2** 孩子端商城零花钱卡片特殊样式

## P4 — 游戏化收尾

- [x] **4.1** Streak 里程碑成就：`achievementService` 加 `streak` 条件类型（7/30/100 天）
- [x] **4.2** 升级揭示动画：EXP 跨等级时全屏庆祝（celebration store 加 level-up 类型）
- [x] **4.3** 断签消耗冻结卡时的提示 UI（StreakFlame 旁）

## P5 — 数据与收尾

- [ ] **5.1** 统计页：`GET /api/stats/family`（趋势/占比/对比）+ parent/Statistics.vue 图表重做（SVG 手绘或 chart.js）
- [ ] **5.2** 备份/导入导出盘点与补全（parent/Backups.vue 现状评估）
- [ ] **5.3** Vitest 补齐（celebration store、三环计算、成就评估、兑换边界）
- [x] **5.4** 绑定自定义域名（⚠️ 国内访问刚需）→ 更新 .env.production → 重新部署
- [ ] **5.5** 更新 README/DEPLOY 文档；全站双角色回归

---

## 执行顺序

```
部署当前版（进行中）→ P1.3 徽章墙 → P1.4 商城 → 部署
→ P2 兑换全流程 → 部署
→ P3.1 家庭配置 → P3.2 申诉 → P3.3 会议 → P3.4 现金 → 部署
→ P4 游戏化收尾 → P5 统计/备份/测试/域名
```
