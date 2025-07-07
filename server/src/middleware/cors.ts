import cors from 'cors';

// CORS配置
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // 允许的来源
    const allowedOrigins = [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      // 允许所有Chrome扩展
      /^chrome-extension:\/\//,
      // 允许所有Firefox扩展
      /^moz-extension:\/\//,
      // 生产环境允许无来源（直接访问API）
      undefined
    ];

    // 检查来源是否被允许
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin === undefined) return true; // 允许直接访问
      if (typeof allowedOrigin === 'string') return origin === allowedOrigin;
      if (allowedOrigin instanceof RegExp) return origin && allowedOrigin.test(origin);
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // 在生产环境中暂时允许所有来源
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
