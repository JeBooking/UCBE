import { Comment, CommentFormData, ApiResponse } from '../types';

const API_BASE_URL = 'https://ucbe.vercel.app/api';

// 标准化URL - 移除查询参数和片段标识符
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch {
    return url;
  }
}

// 简单的内存缓存
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30秒缓存

// API请求封装
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    // 对于GET请求，检查缓存
    if (!options.method || options.method === 'GET') {
      const cacheKey = `${endpoint}${JSON.stringify(options.headers || {})}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return { success: true, data: cached.data };
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Request failed' };
    }

    // 缓存GET请求的结果
    if (!options.method || options.method === 'GET') {
      const cacheKey = `${endpoint}${JSON.stringify(options.headers || {})}`;
      cache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return { success: true, data };
  } catch (error) {
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

// 清除相关缓存
function clearCommentsCache(url: string) {
  const normalizedUrl = normalizeUrl(url);
  const keysToDelete: string[] = [];

  for (const [key] of cache) {
    if (key.includes(`/comments?url=${encodeURIComponent(normalizedUrl)}`)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => cache.delete(key));
}

// 添加评论
export async function addComment(
  url: string,
  commentData: CommentFormData,
  deviceId: string
): Promise<ApiResponse<Comment>> {
  const normalizedUrl = normalizeUrl(url);
  const result = await apiRequest<Comment>('/comments', {
    method: 'POST',
    body: JSON.stringify({
      url: normalizedUrl,
      content: commentData.content,
      display_name: commentData.display_name,
      parent_id: commentData.parent_id,
      device_id: deviceId,
    }),
  });

  // 清除相关缓存，确保下次获取最新数据
  if (result.success) {
    clearCommentsCache(url);
  }

  return result;
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
