import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../index';

const uploadRoutes = new Hono<{ Bindings: Env }>();

// 应用认证中间件
uploadRoutes.use('*', authMiddleware);

// 直接上传文件（小文件，使用 KV 存储）
uploadRoutes.post('/ppt', async (c) => {
  try {
    const user = c.get('user');
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // 验证文件类型
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'application/pdf',
      'application/octet-stream'
    ];

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isValidExtension = ['ppt', 'pptx', 'pdf'].includes(fileExtension || '');

    if (!allowedTypes.includes(file.type) && !isValidExtension) {
      return c.json({ error: 'Invalid file type. Only PPT, PPTX, and PDF are allowed' }, 400);
    }

    // 验证文件大小（最大 5MB - KV 限制）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return c.json({ error: 'File too large. Maximum size is 5MB for KV storage' }, 400);
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const uniqueFilename = `ppt/${user.userId}/${timestamp}_${file.name}`;

    // 读取文件为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const base64Content = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // 存储文件元数据到 KV
    const fileMetadata = {
      key: uniqueFilename,
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      size: file.size,
      userId: user.userId,
      uploadedAt: new Date().toISOString(),
      content: base64Content
    };

    // 存储到 KV（24小时过期）
    await c.env.PPT_STORAGE.put(uniqueFilename, JSON.stringify(fileMetadata), {
      expirationTtl: 86400 * 7 // 7天过期
    });

    // 同时存储文件列表索引
    const userFilesKey = `ppt_list:${user.userId}`;
    const existingList = await c.env.PPT_STORAGE.get(userFilesKey);
    let fileList = [];
    if (existingList) {
      fileList = JSON.parse(existingList);
    }
    fileList.push({
      key: uniqueFilename,
      filename: file.name,
      size: file.size,
      uploadedAt: fileMetadata.uploadedAt
    });
    await c.env.PPT_STORAGE.put(userFilesKey, JSON.stringify(fileList), {
      expirationTtl: 86400 * 7
    });

    // 生成公共访问 URL
    const publicUrl = `${c.req.url.split('/api')[0]}/api/upload/ppt/file/${encodeURIComponent(uniqueFilename)}`;

    return c.json({
      success: true,
      fileUrl: publicUrl,
      filename: uniqueFilename,
      size: file.size
    });
  } catch (error) {
    console.error('Upload file error:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

// 获取文件（公共访问）
uploadRoutes.get('/ppt/file/:key', async (c) => {
  try {
    const key = decodeURIComponent(c.req.param('key'));

    const fileData = await c.env.PPT_STORAGE.get(key);

    if (!fileData) {
      return c.json({ error: 'File not found' }, 404);
    }

    const metadata = JSON.parse(fileData);

    // 解码 Base64 内容
    const binaryString = atob(metadata.content);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 设置响应头
    const headers = new Headers();
    headers.set('Content-Type', metadata.contentType);
    headers.set('Content-Length', metadata.size.toString());
    headers.set('Access-Control-Allow-Origin', '*');

    // 对于 PPT/PDF 文件，设置 inline 显示
    if (metadata.filename.match(/\.(pptx?|pdf)$/i)) {
      headers.set('Content-Disposition', `inline; filename="${metadata.filename}"`);
    }

    return new Response(bytes, { headers });
  } catch (error) {
    console.error('Get file error:', error);
    return c.json({ error: 'Failed to get file' }, 500);
  }
});

// 删除文件
uploadRoutes.delete('/ppt/:key', async (c) => {
  try {
    const user = c.get('user');
    const key = c.req.param('key');

    // 验证文件所有权（文件路径中包含用户ID）
    if (!key.includes(`/${user.userId}/`)) {
      return c.json({ error: 'Forbidden - Not your file' }, 403);
    }

    // 删除文件
    await c.env.PPT_STORAGE.delete(key);

    // 更新文件列表
    const userFilesKey = `ppt_list:${user.userId}`;
    const existingList = await c.env.PPT_STORAGE.get(userFilesKey);
    if (existingList) {
      let fileList = JSON.parse(existingList);
      fileList = fileList.filter((f: any) => f.key !== key);
      await c.env.PPT_STORAGE.put(userFilesKey, JSON.stringify(fileList), {
        expirationTtl: 86400 * 7
      });
    }

    return c.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});

// 获取用户的 PPT 文件列表
uploadRoutes.get('/ppt/list', async (c) => {
  try {
    const user = c.get('user');
    const userFilesKey = `ppt_list:${user.userId}`;

    const fileListData = await c.env.PPT_STORAGE.get(userFilesKey);
    let files = [];

    if (fileListData) {
      const fileList = JSON.parse(fileListData);
      files = fileList.map((f: any) => ({
        key: f.key,
        filename: f.filename,
        size: f.size,
        uploadedAt: f.uploadedAt,
        url: `${c.req.url.split('/api')[0]}/api/upload/ppt/file/${encodeURIComponent(f.key)}`
      }));
    }

    return c.json({
      files,
      count: files.length
    });
  } catch (error) {
    console.error('List files error:', error);
    return c.json({ error: 'Failed to list files' }, 500);
  }
});

export { uploadRoutes };
