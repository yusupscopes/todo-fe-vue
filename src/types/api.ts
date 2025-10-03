// API Response Types
export interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  data?: T;
  meta?: MetaInfo;
}

export interface MetaInfo {
  pagination?: PaginationInfo;
  sort?: string;
  filter?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Task Types
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
}

export interface UpdateTaskRequest {
  title?: string;
  status?: TaskStatus;
}

export interface TaskFilter {
  status?: TaskStatus;
  search?: string;
}

export interface TaskSort {
  field: "created_at" | "updated_at" | "title" | "status";
  order: "asc" | "desc";
}

export interface TaskListParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  search?: string;
  sort_field?: "created_at" | "updated_at" | "title" | "status";
  sort_order?: "asc" | "desc";
}
