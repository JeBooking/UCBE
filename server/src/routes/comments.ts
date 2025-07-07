import { Router, Request, Response } from 'express';
import { CommentService } from '../services/commentService';
import {
  validateUrl,
  validateCreateComment,
  validateToggleLike,
  validateDeleteComment,
  handleValidationErrors
} from '../utils/validation';
import { CreateCommentRequest, ToggleLikeRequest, DeleteCommentRequest } from '../types';

const router = Router();
const commentService = new CommentService();

// 获取页面评论
router.get('/',
  validateUrl(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { url } = req.query as { url: string };
      const deviceId = req.headers['x-device-id'] as string || 'anonymous';

      console.log(`[GET /comments] URL: ${url}, Device ID: ${deviceId}`);

      const comments = await commentService.getCommentsByUrl(url, deviceId);

      console.log(`[GET /comments] Found ${comments.length} comments`);

      res.json({
        success: true,
        data: comments
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
);

// 创建评论
router.post('/',
  validateCreateComment(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const commentData: CreateCommentRequest = req.body;

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
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
);

// 切换点赞状态
router.post('/:commentId/like',
  validateToggleLike(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { commentId } = req.params;
      const { device_id }: ToggleLikeRequest = req.body;
      
      const result = await commentService.toggleLike(commentId, device_id);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
);

// 删除评论
router.delete('/:commentId',
  validateDeleteComment(),
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { commentId } = req.params;
      const { device_id }: DeleteCommentRequest = req.body;
      
      await commentService.deleteComment(commentId, device_id);
      
      res.json({
        success: true,
        data: null
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
);

export default router;
