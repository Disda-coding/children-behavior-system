import { Hono } from 'hono';

// 登录失败记录存储（使用内存存储，生产环境建议使用 Redis 或 Durable Objects）
const loginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();

// 配置
const MAX_ATTEMPTS = 5; // 最大尝试次数
const LOCKOUT_DURATION = 15 * 60 * 1000; // 锁定时间 15 分钟
const ATTEMPT_WINDOW = 5 * 60 * 1000; // 尝试窗口 5 分钟

/**
 * 检查登录是否被限制
 */
export function checkLoginLimit(identifier: string): { allowed: boolean; message?: string; remainingAttempts?: number } {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // 检查是否被锁定
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return {
      allowed: false,
      message: `登录失败次数过多，请 ${remainingMinutes} 分钟后重试`,
    };
  }

  // 如果锁定时间已过，重置记录
  if (record.lockedUntil && now >= record.lockedUntil) {
    loginAttempts.delete(identifier);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // 检查是否在尝试窗口内
  if (now - record.lastAttempt > ATTEMPT_WINDOW) {
    // 超过窗口期，重置计数
    loginAttempts.delete(identifier);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // 检查尝试次数
  if (record.count >= MAX_ATTEMPTS) {
    // 锁定账户
    record.lockedUntil = now + LOCKOUT_DURATION;
    loginAttempts.set(identifier, record);
    return {
      allowed: false,
      message: `登录失败次数过多，账户已锁定 15 分钟`,
    };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - record.count,
  };
}

/**
 * 记录登录失败
 */
export function recordLoginFailure(identifier: string): void {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record) {
    loginAttempts.set(identifier, {
      count: 1,
      lastAttempt: now,
    });
  } else {
    // 检查是否需要重置（超过窗口期）
    if (now - record.lastAttempt > ATTEMPT_WINDOW) {
      loginAttempts.set(identifier, {
        count: 1,
        lastAttempt: now,
      });
    } else {
      record.count += 1;
      record.lastAttempt = now;
      loginAttempts.set(identifier, record);
    }
  }
}

/**
 * 清除登录限制（登录成功时调用）
 */
export function clearLoginLimit(identifier: string): void {
  loginAttempts.delete(identifier);
}

/**
 * 获取客户端标识符（IP + 用户名）
 */
export function getClientIdentifier(c: any, username: string): string {
  // 获取客户端 IP
  const ip = c.req.header('CF-Connecting-IP') ||
             c.req.header('X-Forwarded-For') ||
             'unknown';
  return `${ip}:${username}`;
}
