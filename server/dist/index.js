"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("./middleware/cors"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const comments_1 = __importDefault(require("./routes/comments"));
// 加载环境变量
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// 安全中间件
app.use((0, helmet_1.default)({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false
}));
// CORS中间件
app.use(cors_1.default);
// 通用限流
app.use(rateLimiter_1.generalLimiter);
// 解析JSON
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// 健康检查端点
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Universal Comments API is running',
        timestamp: new Date().toISOString()
    });
});
// 为特定路由添加限流
app.use('/api/comments', rateLimiter_1.commentLimiter);
app.use('/api/comments/:commentId/like', rateLimiter_1.likeLimiter);
// API路由
app.use('/api/comments', comments_1.default);
// 404处理
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});
// 全局错误处理
app.use((error, req, res, next) => {
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
exports.default = app;
//# sourceMappingURL=index.js.map