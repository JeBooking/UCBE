"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeLimiter = exports.commentLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// 通用限流器
exports.generalLimiter = (0, express_rate_limit_1.default)({
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
exports.commentLimiter = (0, express_rate_limit_1.default)({
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
exports.likeLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1分钟
    max: 30, // 每个IP最多30次点赞操作
    message: {
        success: false,
        error: 'Too many like operations, please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimiter.js.map