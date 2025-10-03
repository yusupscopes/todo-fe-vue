import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskListParams,
} from "@/types";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: "http://localhost:3000/api/v1",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear tokens and redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response: AxiosResponse<ApiResponse<LoginResponse>> =
      await this.api.post("/auth/login", credentials);
    return response.data;
  }

  // Task endpoints
  async getTasks(params?: TaskListParams): Promise<ApiResponse<Task[]>> {
    const response: AxiosResponse<ApiResponse<Task[]>> = await this.api.get(
      "/tasks",
      { params }
    );
    return response.data;
  }

  async getTask(id: string): Promise<ApiResponse<Task>> {
    const response: AxiosResponse<ApiResponse<Task>> = await this.api.get(
      `/tasks/${id}`
    );
    return response.data;
  }

  async createTask(task: CreateTaskRequest): Promise<ApiResponse<Task>> {
    const response: AxiosResponse<ApiResponse<Task>> = await this.api.post(
      "/tasks",
      task
    );
    return response.data;
  }

  async updateTask(
    id: string,
    task: UpdateTaskRequest
  ): Promise<ApiResponse<Task>> {
    const response: AxiosResponse<ApiResponse<Task>> = await this.api.put(
      `/tasks/${id}`,
      task
    );
    return response.data;
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(
      `/tasks/${id}`
    );
    return response.data;
  }
}

export const apiService = new ApiService();
