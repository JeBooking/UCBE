import { Comment, CommentFormData, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

// 标准化URL - 移除查询参数和片段标识符
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch {
    return url;
  }
}

// API请求封装
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    console.log('API Request:', endpoint, 'Options:', options);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    console.log('API Response status:', response.status);
    const data = await response.json();
    console.log('API Response data:', data);

    if (!response.ok) {
      return { success: false, error: data.error || 'Request failed' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('API Request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

// 获取页面评论
export async function getComments(url: string, deviceId: string): Promise<ApiResponse<Comment[]>> {
  const normalizedUrl = normalizeUrl(url);
  return apiRequest<Comment[]>(`/comments?url=${encodeURIComponent(normalizedUrl)}`, {
    headers: {
      'X-Device-Id': deviceId
    }
  });
}

// 添加评论
export async function addComment(
  url: string, 
  commentData: CommentFormData, 
  deviceId: string
): Promise<ApiResponse<Comment>> {
  const normalizedUrl = normalizeUrl(url);
  return apiRequest<Comment>('/comments', {
    method: 'POST',
    body: JSON.stringify({
      url: normalizedUrl,
      content: commentData.content,
      display_name: commentData.display_name,
      parent_id: commentData.parent_id,
      device_id: deviceId,
    }),
  });
}

// 点赞/取消点赞评论
export async function toggleLike(commentId: string, deviceId: string): Promise<ApiResponse<{ liked: boolean }>> {
  return apiRequest<{ liked: boolean }>(`/comments/${commentId}/like`, {
    method: 'POST',
    body: JSON.stringify({ device_id: deviceId }),
  });
}

// 删除评论（仅限自己的评论）
export async function deleteComment(commentId: string, deviceId: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/comments/${commentId}`, {
    method: 'DELETE',
    body: JSON.stringify({ device_id: deviceId }),
  });
}
