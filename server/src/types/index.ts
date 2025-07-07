export interface User {
  device_id: string;
  current_username: string;
  created_at: string;
}

export interface Comment {
  id: string;
  url: string;
  content: string;
  device_id: string;
  display_name: string;
  parent_id?: string;
  created_at: string;
  likes_count?: number;
  is_liked?: boolean;
  replies?: Comment[];
}

export interface Like {
  id: string;
  comment_id: string;
  device_id: string;
  created_at: string;
}

export interface CreateCommentRequest {
  url: string;
  content: string;
  display_name: string;
  device_id: string;
  parent_id?: string;
}

export interface ToggleLikeRequest {
  device_id: string;
}

export interface DeleteCommentRequest {
  device_id: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
