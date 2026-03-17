import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../index';

const uploadRoutes = new Hono<{ Bindings: Env }>();

// 应用认证中间件
uploadRoutes.use('*', authMiddleware);

// 生成预签名上传 URL
uploadRoutes.post('/ppt/presign', async (c) => {
  try {
    const user = c.get('user');
    const { filename, contentType } = await c.req.json();
    
    if (!filename || !contentType) {
      return c.json({ error: 'Filename and contentType are required' }, 400);
    }
    
    // 验证文件类型
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-powerpoint',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(contentType)) {
      return c.json({ error: 'Invalid file type. Only PPT, PPTX, and PDF are allowed' }, 400);
    }
    
    // 生成唯一文件名
    const timestamp = Date.now();
    const uniqueFilename = `ppt/${user.userId}/${timestamp}_${filename}`;
    
    // 生成预签名 URL（15分钟有效期）
    const signedUrl = await c.env.PPT_BUCKET.createPresignedUrl(uniqueFilename, {
      method: 'PUT',
      expirySeconds: 900,
      customMetadata: {
        'user-id': user.userId.toString(),
        'upload-time': new Date().toISOString()
      }
    });
    
    // 生成公共访问 URL
    const publicUrl = `${c.req.url.split('/api')[0]}/api/upload/ppt/${uniqueFilename}`;
    
    return c.json({
      uploadUrl: signedUrl,
      fileUrl: publicUrl,
      filename: uniqueFilename
    });
  } catch (error) {
    console.error('Generate presign URL error:', error);
    return c.json({ error: 'Failed to generate upload URL' }, 500);
  }
});

// 直接上传文件（小文件）
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
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only PPT, PPTX, and PDF are allowed' }, 400);
    }
    
    // 验证文件大小（最大 10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return c.json({ error: 'File too large. Maximum size is 10MB' }, 400);
    }
    
    // 生成唯一文件名
    const timestamp = Date.now();
    const uniqueFilename = `ppt/${user.userId}/${timestamp}_${file.name}`;
    
    // 上传到 R2
    await c.env.PPT_BUCKET.put(uniqueFilename, file.stream(), {
      httpMetadata: {
        contentType: file.type,
        contentDisposition: `inline; filename="${file.name}"`
      },
      customMetadata: {
        'user-id': user.userId.toString(),
        'original-name': file.name,
        'upload-time': new Date().toISOString(),
        'file-size': file.size.toString()
      }
    });
    
    // 生成公共访问 URL
    const publicUrl = `${c.req.url.split('/api')[0]}/api/upload/ppt/${uniqueFilename}`;
    
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
uploadRoutes.get('/ppt/:key{.+}', async (c) => {
  try {
    const key = c.req.param('key');
    
    const object = await c.env.PPT_BUCKET.get(key);
    
    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }
    
    // 设置响应头
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Access-Control-Allow-Origin', '*');
    
    // 对于 PPT/PDF 文件，设置 inline 显示
    if (key.match(/\.(pptx?|pdf)$/i)) {
      headers.set('Content-Disposition', `inline; filename="${key.split('/').pop()}"`);
    }
    
    return new Response(object.body, { headers });
  } catch (error) {
    console.error('Get file error:', error);
    return c.json({ error: 'Failed to get file' }, 500);
  }
});

// 删除文件
uploadRoutes.delete('/ppt/:key{.+}', async (c) => {
  try {
    const user = c.get('user');
    const key = c.req.param('key');
    
    // 验证文件所有权（文件路径中包含用户ID）
    if (!key.includes(`/${user.userId}/`)) {
      return c.json({ error: 'Forbidden - Not your file' }, 403);
    }
    
    await c.env.PPT_BUCKET.delete(key);
    
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
    const prefix = `ppt/${user.userId}/`;
    
    const objects = await c.env.PPT_BUCKET.list({
      prefix
    });
    
    const files = objects.objects.map(obj => ({
      key: obj.key,
      filename: obj.key.split('/').pop(),
      size: obj.size,
      uploadedAt: obj.uploaded,
      url: `${c.req.url.split('/api')[0]}/api/upload/ppt/${obj.key}`
    }));
    
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
