import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import type { Env } from '../index';

// JWT 工具函数
async function signJWT(payload: object, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  
  // 创建签名
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
  
  // Base64 编码
  const base64Payload = btoa(JSON.stringify(payload));
  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${base64Payload}.${base64Signature}`;
}

async function verifyJWT(token: string, secret: string): Promise<any> {
  const [payloadBase64, signatureBase64] = token.split('.');
  
  if (!payloadBase64 || !signatureBase64) {
    throw new Error('Invalid token format');
  }
  
  const encoder = new TextEncoder();
  const payload = JSON.parse(atob(payloadBase64));
  
  // 验证签名
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  
  const signature = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));
  const data = encoder.encode(JSON.stringify(payload));
  
  const isValid = await crypto.subtle.verify('HMAC', cryptoKey, signature, data);
  
  if (!isValid) {
    throw new Error('Invalid signature');
  }
  
  // 检查过期时间
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }
  
  return payload;
}

// 验证 Schema
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  role: z.enum(['child', 'parent']),
  displayName: z.string().min(1).max(50),
  familyId: z.number().optional(),
  familyName: z.string().optional(),
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const authRoutes = new Hono<{ Bindings: Env }>();

// 注册
authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const data = c.req.valid('json');
  const { JWT_SECRET } = c.env;
  
  try {
    // 检查用户名是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, data.username))
      .get();
    
    if (existingUser) {
      return c.json({ error: 'Username already exists' }, 400);
    }
    
    // 哈希密码
    const passwordHash = await hashPassword(data.password);
    
    // 创建用户
    const result = await db.insert(users).values({
      username: data.username,
      passwordHash,
      role: data.role,
      displayName: data.displayName,
      familyId: data.familyId || 1, // 默认家庭ID
    }).returning();
    
    const user = result[0];
    
    // 生成 JWT
    const token = await signJWT(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7天过期
      },
      JWT_SECRET
    );
    
    return c.json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
      },
      token,
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// 登录
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const { username, password } = c.req.valid('json');
  const { JWT_SECRET } = c.env;
  
  try {
    // 查找用户
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();
    
    if (!user) {
      return c.json({ error: 'Invalid username or password' }, 401);
    }
    
    // 验证密码
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    
    if (!isValidPassword) {
      return c.json({ error: 'Invalid username or password' }, 401);
    }
    
    // 生成 JWT
    const token = await signJWT(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7天过期
      },
      JWT_SECRET
    );
    
    return c.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        familyId: user.familyId,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// 密码哈希函数
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// 导出 JWT 工具函数供其他模块使用
export { signJWT, verifyJWT };

export { authRoutes };
