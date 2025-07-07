import express from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import corsMiddleware from './middleware/cors';
import { generalLimiter, commentLimiter, likeLimiter } from './middleware/rateLimiter';
import commentsRouter from './routes/comments';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

// CORS中间件
app.use(corsMiddleware);

// 通用限流
app.use(generalLimiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Universal Comments API is running',
    timestamp: new Date().toISOString()
  });
});

// 为特定路由添加限流
app.use('/api/comments', commentLimiter);
app.use('/api/comments/:commentId/like', likeLimiter);

// API路由
app.use('/api/comments', commentsRouter);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// 全局错误处理
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 启动服务器（仅在非 Vercel 环境）
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Universal Comments API server is running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`💬 Comments API: http://localhost:${PORT}/api/comments`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
  });
}

// 导出 app 供 Vercel 使用
export default app;
