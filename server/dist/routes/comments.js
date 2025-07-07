"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commentService_1 = require("../services/commentService");
const validation_1 = require("../utils/validation");
const router = (0, express_1.Router)();
const commentService = new commentService_1.CommentService();
// 获取页面评论
router.get('/', (0, validation_1.validateUrl)(), validation_1.handleValidationErrors, async (req, res) => {
    try {
        const { url } = req.query;
        const deviceId = req.headers['x-device-id'] || 'anonymous';
        console.log(`[GET /comments] URL: ${url}, Device ID: ${deviceId}`);
        const comments = await commentService.getCommentsByUrl(url, deviceId);
        console.log(`[GET /comments] Found ${comments.length} comments`);
        res.json({
            success: true,
            data: comments
        });
    }
    catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
});
// 创建评论
router.post('/', (0, validation_1.validateCreateComment)(), validation_1.handleValidationErrors, async (req, res) => {
    try {
        const commentData = req.body;
        console.log('[POST /comments] Creating comment:', {
            url: commentData.url,
            content: commentData.content,
            display_name: commentData.display_name,
            device_id: commentData.device_id
        });
        const comment = await commentService.createComment(commentData);
        console.log('[POST /comments] Comment created successfully:', comment.id);
        res.status(201).json({
            success: true,
            data: comment
        });
    }
    catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
});
// 切换点赞状态
router.post('/:commentId/like', (0, validation_1.validateToggleLike)(), validation_1.handleValidationErrors, async (req, res) => {
    try {
        const { commentId } = req.params;
        const { device_id } = req.body;
        const result = await commentService.toggleLike(commentId, device_id);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
});
// 删除评论
router.delete('/:commentId', (0, validation_1.validateDeleteComment)(), validation_1.handleValidationErrors, async (req, res) => {
    try {
        const { commentId } = req.params;
        const { device_id } = req.body;
        await commentService.deleteComment(commentId, device_id);
        res.json({
            success: true,
            data: null
        });
    }
    catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=comments.js.map