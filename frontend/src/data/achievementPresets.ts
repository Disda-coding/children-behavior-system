/**
 * 预设成就库（批量导入用）
 *
 * 设计原则：
 * 1. 所有条件必须是成就引擎真实可度量的 4 种类型：
 *    - count       累计获得积分次数（earn 记录数）
 *    - accumulate  累计获得积分总量
 *    - consecutive 连续每天获得积分的天数
 *    - streak      连续打卡保持天数（Streak 火苗）
 * 2. 奖励积分决定徽章档次（与 badgeTier 对齐）：
 *    铜 <50 / 银 50-199 / 金 200-499 / 铂 ≥500
 * 3. 每个预设尽量“说得清、够得着”：低龄孩子前几周能拿到铜银档，
 *    金铂档留给真正的大坚持。
 */

export interface AchievementPreset {
  name: string;
  description: string;
  icon: string;
  conditionType: 'count' | 'accumulate' | 'consecutive' | 'streak';
  conditionValue: number;
  conditionUnit: string;
  rewardPoints: number;
  tier: 'copper' | 'silver' | 'gold' | 'platinum';
}

export interface PresetCategory {
  key: string;
  label: string;
  icon: string;
  description: string;
  presets: AchievementPreset[];
}

const p = (
  name: string,
  description: string,
  icon: string,
  conditionType: AchievementPreset['conditionType'],
  conditionValue: number,
  conditionUnit: string,
  rewardPoints: number,
): AchievementPreset => ({
  name,
  description,
  icon,
  conditionType,
  conditionValue,
  conditionUnit,
  rewardPoints,
  tier: rewardPoints >= 500 ? 'platinum' : rewardPoints >= 200 ? 'gold' : rewardPoints >= 50 ? 'silver' : 'copper',
});

export const presetCategories: PresetCategory[] = [
  {
    key: 'starter',
    label: '初来乍到',
    icon: '🌱',
    description: '孩子的第一枚徽章，轻松达成、建立信心',
    presets: [
      p('第一颗星', '获得人生中第 1 次积分', '⭐', 'count', 1, '次', 10),
      p('小试牛刀', '累计获得 5 次积分', '🐣', 'count', 5, '次', 15),
      p('连续两天', '连续 2 天都有进步', '🌤️', 'consecutive', 2, '天', 10),
      p('首周亮相', '累计获得 10 次积分', '🎈', 'count', 10, '次', 25),
      p('百分起步', '累计积分达到 100 分', '💯', 'accumulate', 100, '分', 25),
    ],
  },
  {
    key: 'habit',
    label: '坚持与习惯',
    icon: '🔥',
    description: '连续打卡和连续进步，习惯养成的核心赛道',
    presets: [
      p('三日坚持', '连续 3 天获得积分', '🌿', 'consecutive', 3, '天', 20),
      p('一周之星', '连续 7 天获得积分', '📅', 'consecutive', 7, '天', 60),
      p('半月坚持者', '连续 14 天获得积分', '🌗', 'consecutive', 14, '天', 120),
      p('整月不断档', '连续 30 天获得积分', '🏵️', 'consecutive', 30, '天', 300),
      p('百日恒心', '连续 100 天获得积分', '👑', 'consecutive', 100, '天', 800),
      p('火苗初燃', '打卡火苗保持 3 天', '🕯️', 'streak', 3, '天', 20),
      p('火焰正旺', '打卡火苗保持 7 天', '🔥', 'streak', 7, '天', 60),
      p('烈焰不灭', '打卡火苗保持 21 天', '☄️', 'streak', 21, '天', 200),
      p('薪火相传', '打卡火苗保持 60 天', '🌋', 'streak', 60, '天', 500),
    ],
  },
  {
    key: 'study',
    label: '学习成长',
    icon: '📚',
    description: '围绕学习任务，家长每天按完成情况给分即可点亮',
    presets: [
      p('作业小标兵', '累计 10 次「按时完成作业」得分', '✏️', 'count', 10, '次', 30),
      p('阅读小书虫', '累计 20 次「阅读打卡」得分', '🐛', 'count', 20, '次', 50),
      p('预习先行者', '累计 15 次「主动预习/复习」得分', '🔭', 'count', 15, '次', 40),
      p('专注小达人', '累计 30 次「专注学习」得分', '🎯', 'count', 30, '次', 80),
      p('勤学小硕士', '累计 60 次学习类得分', '🎓', 'count', 60, '次', 150),
      p('学习马拉松', '连续 14 天学习类得分', '🏃', 'consecutive', 14, '天', 120),
    ],
  },
  {
    key: 'life',
    label: '生活自理',
    icon: '🧹',
    description: '起床、整理、洗漱这些日常小事，天天见分',
    presets: [
      p('早起小闹钟', '连续 7 天「按时起床」得分', '⏰', 'consecutive', 7, '天', 60),
      p('整理小能手', '累计 15 次「整理房间/书包」得分', '🧺', 'count', 15, '次', 40),
      p('洗漱小卫士', '连续 7 天「认真洗漱」得分', '🪥', 'consecutive', 7, '天', 50),
      p('吃饭不挑食', '累计 20 次「光盘/不挑食」得分', '🍚', 'count', 20, '次', 50),
      p('家务小帮手', '累计 20 次「主动做家务」得分', '🧽', 'count', 20, '次', 60),
      p('独立小当家', '累计 40 次生活自理类得分', '🏠', 'count', 40, '次', 100),
    ],
  },
  {
    key: 'character',
    label: '品德社交',
    icon: '💛',
    description: '礼貌、助人、分享——这些闪光点值得被看见',
    presets: [
      p('礼貌小天使', '累计 10 次「礼貌用语/问好」得分', '😇', 'count', 10, '次', 30),
      p('助人小雷锋', '累计 10 次「帮助他人」得分', '🤝', 'count', 10, '次', 40),
      p('分享小太阳', '累计 10 次「主动分享」得分', '☀️', 'count', 10, '次', 30),
      p('情绪小主人', '累计 15 次「管理情绪/不乱发脾气」得分', '🧘', 'count', 15, '次', 50),
      p('诚信小榜样', '累计 10 次「诚实/守承诺」得分', '💎', 'count', 10, '次', 40),
      p('暖心小棉袄', '累计 30 次品德类得分', '🧣', 'count', 30, '次', 100),
    ],
  },
  {
    key: 'health',
    label: '健康运动',
    icon: '⚽',
    description: '动起来！运动、护眼、早睡早起',
    presets: [
      p('运动小健将', '累计 15 次「运动锻炼」得分', '🏅', 'count', 15, '次', 40),
      p('跳绳小飞人', '连续 7 天运动打卡', '🤸', 'consecutive', 7, '天', 60),
      p('护眼小卫士', '累计 15 次「控制屏幕时间」得分', '👀', 'count', 15, '次', 40),
      p('早睡小月亮', '连续 7 天「按时睡觉」得分', '🌙', 'consecutive', 7, '天', 60),
      p('喝水小达人', '累计 15 次「主动喝水」得分', '💧', 'count', 15, '次', 30),
      p('健康小铁人', '累计 50 次健康类得分', '🦾', 'count', 50, '次', 150),
    ],
  },
  {
    key: 'milestone',
    label: '积分里程碑',
    icon: '🏆',
    description: '攒积分路上的里程碑，越大越闪亮',
    presets: [
      p('五百小富翁', '累计积分达到 500 分', '💰', 'accumulate', 500, '分', 50),
      p('千元小金库', '累计积分达到 1000 分', '🏦', 'accumulate', 1000, '分', 100),
      p('两千大玩家', '累计积分达到 2000 分', '🎰', 'accumulate', 2000, '分', 200),
      p('五千大亨', '累计积分达到 5000 分', '💎', 'accumulate', 5000, '分', 500),
      p('万分传奇', '累计积分达到 10000 分', '🌟', 'accumulate', 10000, '分', 1000),
    ],
  },
  {
    key: 'grandmaster',
    label: '挑战大师',
    icon: '👑',
    description: '最高荣誉，留给真正的大坚持',
    presets: [
      p('五十次勋章', '累计获得 50 次积分', '🎖️', 'count', 50, '次', 100),
      p('百次勋章', '累计获得 100 次积分', '🥇', 'count', 100, '次', 250),
      p('两百次传说', '累计获得 200 次积分', '🏅', 'count', 200, '次', 500),
      p('全年之星', '累计获得 365 次积分', '🌠', 'count', 365, '次', 1000),
    ],
  },
];

export const allPresets: AchievementPreset[] = presetCategories.flatMap((c) => c.presets);

export const tierMeta: Record<AchievementPreset['tier'], { label: string; color: string; bg: string }> = {
  copper: { label: '铜', color: '#a05a30', bg: '#f7e3d3' },
  silver: { label: '银', color: '#5f6b7a', bg: '#e8edf3' },
  gold: { label: '金', color: '#a07a0e', bg: '#fbeec2' },
  platinum: { label: '铂', color: '#6b4fc4', bg: '#e6dcfb' },
};
