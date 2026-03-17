// 生成随机邀请码
export function generateInviteCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 格式化日期
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

// 格式化日期时间
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().replace('T', ' ').substring(0, 19);
}

// 计算积分余额
export function calculateBalance(records: { type: string; amount: number }[]): number {
  return records.reduce((balance, record) => {
    if (record.type === 'earn') {
      return balance + record.amount;
    } else if (record.type === 'deduct' || record.type === 'redeem') {
      return balance - record.amount;
    }
    return balance;
  }, 0);
}

// 验证邮箱格式
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 验证手机号格式（中国）
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}

// 深度克隆对象
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 计算游戏时间阶梯价格
export function calculateGameTimeCost(hours: number, baseCost: number = 200): number {
  // 1小时 = 200, 1.5小时 = 400, 2小时 = 800
  const multiplier = Math.pow(2, (hours - 1) * 2);
  return baseCost * multiplier;
}

// 检查成就是否达成
export function checkAchievementCompletion(
  conditionType: 'consecutive' | 'count' | 'accumulate',
  conditionValue: number,
  progress: number
): boolean {
  return progress >= conditionValue;
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 截断文本
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// 睡眠函数
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
