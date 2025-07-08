"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeUrl = exports.validateDeleteComment = exports.validateToggleLike = exports.validateCreateComment = exports.validateUrl = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
// 验证结果处理中间件
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
// URL验证
const validateUrl = () => [
    (0, express_validator_1.query)('url')
        .trim()
        .notEmpty()
        .withMessage('URL is required')
        .isLength({ max: 2048 })
        .withMessage('URL too long')
        .custom((value) => {
        try {
            new URL(value);
            return true;
        }
        catch {
            throw new Error('Invalid URL format');
        }
    })
];
exports.validateUrl = validateUrl;
// 评论创建验证
const validateCreateComment = () => [
    (0, express_validator_1.body)('url')
        .isURL({ require_protocol: true })
        .withMessage('Invalid URL format')
        .isLength({ max: 2048 })
        .withMessage('URL too long'),
    (0, express_validator_1.body)('content')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Content must be between 1 and 1000 characters'),
    (0, express_validator_1.body)('display_name')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Display name must be between 1 and 50 characters')
        .matches(/^[a-zA-Z0-9\u4e00-\u9fa5_\-\s]+$/)
        .withMessage('Display name contains invalid characters'),
    (0, express_validator_1.body)('device_id')
        .isLength({ min: 1, max: 100 })
        .withMessage('Invalid device ID'),
    (0, express_validator_1.body)('parent_id')
        .optional()
        .isUUID()
        .withMessage('Invalid parent comment ID')
];
exports.validateCreateComment = validateCreateComment;
// 点赞验证
const validateToggleLike = () => [
    (0, express_validator_1.param)('commentId')
        .isUUID()
        .withMessage('Invalid comment ID'),
    (0, express_validator_1.body)('device_id')
        .isLength({ min: 1, max: 100 })
        .withMessage('Invalid device ID')
];
exports.validateToggleLike = validateToggleLike;
// 删除评论验证
const validateDeleteComment = () => [
    (0, express_validator_1.param)('commentId')
        .isUUID()
        .withMessage('Invalid comment ID'),
    (0, express_validator_1.body)('device_id')
        .isLength({ min: 1, max: 100 })
        .withMessage('Invalid device ID')
];
exports.validateDeleteComment = validateDeleteComment;
// URL标准化函数 - 保留重要的查询参数，移除片段标识符和无关参数
const normalizeUrl = (url) => {
    try {
        const urlObj = new URL(url);
        // 移除片段标识符
        urlObj.hash = '';
        // 移除一些常见的跟踪参数，但保留内容相关的参数
        const paramsToRemove = [
            'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
            'fbclid', 'gclid', 'ref', 'source', 'from', 'share',
            '_ga', '_gid', 'mc_cid', 'mc_eid'
        ];
        paramsToRemove.forEach(param => {
            urlObj.searchParams.delete(param);
        });
        return urlObj.toString();
    }
    catch {
        throw new Error('Invalid URL format');
    }
};
exports.normalizeUrl = normalizeUrl;
//# sourceMappingURL=validation.js.map