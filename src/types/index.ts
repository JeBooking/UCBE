export interface Comment {
  id: string;
  url: string;
  content: string;
  device_id: string;
  display_name: string;
  parent_id?: string;
  created_at: string;
  likes_count: number;
  is_liked: boolean;
  replies?: Comment[];
}

export interface User {
  device_id: string;
  current_username: string;
  created_at: string;
}

export interface Like {
  id: string;
  comment_id: string;
  device_id: string;
  created_at: string;
}

export interface CommentFormData {
  content: string;
  display_name: string;
  parent_id?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
