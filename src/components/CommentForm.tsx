import React, { useState, useEffect } from 'react';
import { CommentFormData } from '../types';
import { getCurrentUsername } from '../utils/deviceId';

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => Promise<void>;
  parentId?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  defaultUsername?: string;
  hideUsernameField?: boolean;
}

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  parentId,
  onCancel,
  isSubmitting = false,
  defaultUsername = '',
  hideUsernameField = false
}) => {
  const [content, setContent] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (defaultUsername) {
      setDisplayName(defaultUsername);
      setIsLoading(false);
    } else {
      loadUsername();
    }
  }, [defaultUsername]);

  const loadUsername = async () => {
    try {
      const username = await getCurrentUsername();
      setDisplayName(username);
    } catch (error) {
      console.error('Failed to load username:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('请输入评论内容');
      return;
    }

    if (!displayName.trim()) {
      alert('请输入用户名');
      return;
    }

    try {
      await onSubmit({
        content: content.trim(),
        display_name: displayName.trim(),
        parent_id: parentId
      });

      // 清空表单（除了用户名）
      setContent('');

      // 显示成功提示
      if (!parentId) {
        alert('评论发布成功！');
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('发布失败，请检查网络连接后重试');
    }
  };

  if (isLoading) {
    return <div className="uc-loading">加载中...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="uc-comment-form">
      {parentId && (
        <div style={{ marginBottom: '12px', fontSize: '12px', color: '#6c757d' }}>
          回复评论
        </div>
      )}
      
      {!hideUsernameField && (
        <div className="uc-form-group">
          <label className="uc-form-label">用户名:</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="uc-form-input"
            placeholder="输入你的用户名"
            required
          />
        </div>
      )}
      
      <div className="uc-form-group">
        <label className="uc-form-label">评论内容:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="uc-form-textarea"
          placeholder={parentId ? "写下你的回复..." : "写下你的评论..."}
          required
          rows={parentId ? 3 : 4}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="uc-action-btn"
            style={{ 
              padding: '8px 16px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: '#fff'
            }}
          >
            取消
          </button>
        )}
        
        <button
          type="submit"
          className="uc-submit-btn"
          disabled={isSubmitting || !content.trim() || !displayName.trim()}
        >
          {isSubmitting ? '发布中...' : (parentId ? '回复' : '发布评论')}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;
