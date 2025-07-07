import React, { useState, useEffect, useRef } from 'react';
import { Comment, CommentFormData } from '../types';
import { getComments, addComment } from '../utils/api';
import { getDeviceId, saveCurrentUsername } from '../utils/deviceId';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface CommentsContainerProps {
  url: string;
  onClose: () => void;
}

const CommentsContainer: React.FC<CommentsContainerProps> = ({ url, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeComponent();
  }, [url]);

  const initializeComponent = async () => {
    try {
      console.log('Initializing component...');
      const id = await getDeviceId();
      console.log('Device ID obtained:', id);
      setDeviceId(id);

      // 直接传递 deviceId 给 loadComments，不依赖状态更新
      await loadComments(id);
    } catch (error) {
      setError('初始化失败');
      console.error('Failed to initialize:', error);
    }
  };

  const loadComments = async (currentDeviceId?: string) => {
    const useDeviceId = currentDeviceId || deviceId;
    console.log('Loading comments for URL:', url, 'Device ID:', useDeviceId);
    setIsLoading(true);
    setError(null);

    if (!useDeviceId) {
      console.error('No device ID available for loading comments');
      setError('设备ID未初始化');
      setIsLoading(false);
      return;
    }

    try {
      const result = await getComments(url, useDeviceId);
      console.log('Comments API result:', result);

      console.log('Processing API result:', result);

      if (result.success && result.data) {
        // 处理双重包装的数据结构
        let commentsData: any[] = [];

        if (Array.isArray(result.data)) {
          // 直接是数组
          commentsData = result.data;
        } else if (result.data && typeof result.data === 'object' && 'data' in result.data) {
          // 双重包装，取内层的 data
          const innerData = (result.data as any).data;
          commentsData = Array.isArray(innerData) ? innerData : [];
        }

        console.log('Comments loaded successfully:', commentsData.length, 'comments');
        console.log('Comments data:', commentsData);
        setComments(commentsData);
      } else {
        const errorMsg = result.error || '加载评论失败';
        console.error('Failed to load comments:', errorMsg);
        setError(errorMsg);
        setComments([]);
      }
    } catch (error) {
      const errorMsg = '网络连接失败，请检查后端服务是否运行';
      console.error('Network error loading comments:', error);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (formData: CommentFormData) => {
    if (!deviceId) {
      console.error('No device ID available');
      alert('设备ID未初始化，请刷新页面重试');
      return;
    }

    console.log('Submitting comment:', formData);
    setIsSubmitting(true);

    try {
      // 保存用户名到本地存储
      await saveCurrentUsername(formData.display_name);

      console.log('Calling addComment API...');
      const result = await addComment(url, formData, deviceId);
      console.log('Add comment result:', result);

      if (result.success) {
        console.log('Comment submitted successfully, reloading comments...');
        await loadComments(); // 重新加载评论列表
        setReplyingTo(null); // 清除回复状态

        if (!formData.parent_id) {
          alert('评论发布成功！');
        }
      } else {
        console.error('Failed to submit comment:', result.error);
        alert(result.error || '发布评论失败');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('发布评论失败，请检查网络连接');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(replyingTo === parentId ? null : parentId);
  };

  // 拖拽功能
  const handleMouseDown = (e: React.MouseEvent) => {
    // 只有点击标题栏才能拖拽
    if ((e.target as Element).closest('.uc-comments-header')) {
      setIsDragging(true);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // 确保容器不会拖拽到屏幕外
      const maxX = window.innerWidth - containerRef.current.offsetWidth;
      const maxY = window.innerHeight - containerRef.current.offsetHeight;
      
      const clampedX = Math.max(0, Math.min(newX, maxX));
      const clampedY = Math.max(0, Math.min(newY, maxY));
      
      containerRef.current.style.left = `${clampedX}px`;
      containerRef.current.style.top = `${clampedY}px`;
      containerRef.current.style.right = 'auto';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const renderComments = () => {
    console.log('Rendering comments, state:', { isLoading, error, comments, commentsType: typeof comments, isArray: Array.isArray(comments) });

    if (isLoading) {
      return <div className="uc-loading">加载评论中...</div>;
    }

    if (error) {
      return (
        <div className="uc-error">
          {error}
          <button
            onClick={() => loadComments()}
            style={{ marginLeft: '8px', padding: '4px 8px', fontSize: '12px' }}
          >
            重试
          </button>
        </div>
      );
    }

    // 确保 comments 是数组
    if (!Array.isArray(comments)) {
      console.error('Comments is not an array:', comments);
      setComments([]);
      return <div className="uc-error">数据格式错误，请重试</div>;
    }

    if (comments.length === 0) {
      return <div className="uc-empty">还没有评论，来发表第一条评论吧！</div>;
    }

    try {
      return comments.map(comment => (
        <div key={comment.id}>
          <CommentItem
            comment={comment}
            deviceId={deviceId}
            onReply={handleReply}
            onUpdate={() => loadComments()}
          />
          {replyingTo === comment.id && (
            <div style={{ marginLeft: '20px', marginTop: '8px' }}>
              <CommentForm
                onSubmit={handleSubmitComment}
                parentId={comment.id}
                onCancel={() => setReplyingTo(null)}
                isSubmitting={isSubmitting}
              />
            </div>
          )}
        </div>
      ));
    } catch (error) {
      console.error('Error rendering comments:', error);
      return <div className="uc-error">渲染评论时出错: {error instanceof Error ? error.message : '未知错误'}</div>;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`uc-comments-container uc-visible ${isDragging ? 'uc-dragging' : ''}`}
    >
      <div className="uc-comments-header" onMouseDown={handleMouseDown}>
        <h3 className="uc-comments-title">💬 页面评论</h3>
        <button className="uc-close-btn" onClick={onClose}>✕</button>
      </div>
      
      <div className="uc-comments-content">
        {renderComments()}
      </div>
      
      {!replyingTo && (
        <CommentForm
          onSubmit={handleSubmitComment}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default CommentsContainer;
