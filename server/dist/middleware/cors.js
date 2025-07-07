"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
// CORS配置
const corsOptions = {
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
            if (allowedOrigin === undefined)
                return true; // 开发环境
            if (typeof allowedOrigin === 'string')
                return origin === allowedOrigin;
            if (allowedOrigin instanceof RegExp)
                return origin && allowedOrigin.test(origin);
            return false;
        });
        if (isAllowed) {
            callback(null, true);
        }
        else {
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
exports.default = (0, cors_1.default)(corsOptions);
//# sourceMappingURL=cors.js.map