import React, { useState } from 'react';
import { Comment } from '../types';
import { toggleLike, deleteComment } from '../utils/api';

interface CommentItemProps {
  comment: Comment;
  deviceId: string;
  onReply: (parentId: string) => void;
  onUpdate: () => void;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  deviceId, 
  onReply, 
  onUpdate, 
  level = 0 
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const result = await toggleLike(comment.id, deviceId);
      if (result.success) {
        onUpdate(); // 刷新评论列表
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting || !confirm('确定要删除这条评论吗？')) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteComment(comment.id, deviceId);
      if (result.success) {
        onUpdate(); // 刷新评论列表
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  const isOwnComment = comment.device_id === deviceId;

  return (
    <div className="uc-comment-item" style={{ marginLeft: level > 0 ? '20px' : '0' }}>
      <div className="uc-comment-header">
        <span className="uc-comment-author">{comment.display_name}</span>
        <span className="uc-comment-time">{formatTime(comment.created_at)}</span>
      </div>
      
      <div className="uc-comment-content">{comment.content}</div>
      
      <div className="uc-comment-actions">
        <button
          className={`uc-action-btn ${comment.is_liked ? 'uc-liked' : ''}`}
          onClick={handleLike}
          disabled={isLiking}
        >
          ❤️ {comment.likes_count}
        </button>
        
        {level < 2 && (
          <button
            className="uc-action-btn"
            onClick={() => onReply(comment.id)}
          >
            💬 回复
          </button>
        )}
        
        {isOwnComment && (
          <button
            className="uc-action-btn"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            🗑️ 删除
          </button>
        )}
      </div>
      
      {comment.replies && comment.replies.length > 0 && (
        <div className="uc-replies">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              deviceId={deviceId}
              onReply={onReply}
              onUpdate={onUpdate}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
