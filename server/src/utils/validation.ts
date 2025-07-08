import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// 验证结果处理中间件
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// URL验证
export const validateUrl = () => [
  query('url')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isLength({ max: 2048 })
    .withMessage('URL too long')
    .custom((value) => {
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Invalid URL format');
      }
    })
];

// 评论创建验证
export const validateCreateComment = () => [
  body('url')
    .isURL({ require_protocol: true })
    .withMessage('Invalid URL format')
    .isLength({ max: 2048 })
    .withMessage('URL too long'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Content must be between 1 and 1000 characters'),
  body('display_name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9\u4e00-\u9fa5_\-\s]+$/)
    .withMessage('Display name contains invalid characters'),
  body('device_id')
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid device ID'),
  body('parent_id')
    .optional()
    .isUUID()
    .withMessage('Invalid parent comment ID')
];

// 点赞验证
export const validateToggleLike = () => [
  param('commentId')
    .isUUID()
    .withMessage('Invalid comment ID'),
  body('device_id')
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid device ID')
];

// 删除评论验证
export const validateDeleteComment = () => [
  param('commentId')
    .isUUID()
    .withMessage('Invalid comment ID'),
  body('device_id')
    .isLength({ min: 1, max: 100 })
    .withMessage('Invalid device ID')
];

// URL标准化函数 - 保留重要的查询参数，移除片段标识符和无关参数
export const normalizeUrl = (url: string): string => {
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
  } catch {
    throw new Error('Invalid URL format');
  }
};
