import rateLimit from 'express-rate-limit';

// 通用限流器
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 评论创建限流器（更严格）
export const commentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5分钟
  max: 10, // 每个IP最多10条评论
  message: {
    success: false,
    error: 'Too many comments, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 点赞限流器
export const likeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 30, // 每个IP最多30次点赞操作
  message: {
    success: false,
    error: 'Too many like operations, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
