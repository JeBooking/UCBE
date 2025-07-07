import cors from 'cors';

// CORS配置
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // 允许的来源
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      // 允许所有Chrome扩展
      /^chrome-extension:\/\//,
      // 允许所有Firefox扩展
      /^moz-extension:\/\//,
      // 开发环境允许所有来源
      ...(process.env.NODE_ENV === 'development' ? [undefined] : [])
    ];

    // 检查来源是否被允许
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin === undefined) return true; // 开发环境
      if (typeof allowedOrigin === 'string') return origin === allowedOrigin;
      if (allowedOrigin instanceof RegExp) return origin && allowedOrigin.test(origin);
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Device-Id'
  ]
};

export default cors(corsOptions);
