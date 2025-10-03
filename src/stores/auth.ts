import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { apiService } from "@/services";
import { extractUserInfo, isTokenExpired } from "@/utils/jwt";
import type { LoginRequest, User } from "@/types";

export const useAuthStore = defineStore("auth", () => {
  // State with reactive localStorage
  const user = ref<User | null>(null);
  const accessToken = useLocalStorage("access_token", null as string | null);
  const refreshToken = useLocalStorage("refresh_token", null as string | null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value);
  const userEmail = computed(() => user.value?.email || "");

  // Actions
  const login = async (credentials: LoginRequest) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiService.login(credentials);

      if (response.error) {
        throw new Error(response.message);
      }

      if (response.data) {
        // useLocalStorage automatically syncs with localStorage
        accessToken.value = response.data.access_token;
        refreshToken.value = response.data.refresh_token;

        // Extract user info from JWT token
        const userInfo = extractUserInfo(response.data.access_token);
        if (userInfo) {
          user.value = {
            id: userInfo.userId,
            email: userInfo.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        } else {
          // Fallback to credentials if JWT extraction fails
          user.value = {
            id: "user-id",
            email: credentials.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }

        return response.data;
      }
    } catch (err: any) {
      error.value = err.message || "Login failed";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    error.value = null;
    // useLocalStorage automatically clears from localStorage when set to null
  };

  const clearError = () => {
    error.value = null;
  };

  const refreshUserInfo = () => {
    if (accessToken.value) {
      const userInfo = extractUserInfo(accessToken.value);
      if (userInfo) {
        user.value = {
          id: userInfo.userId,
          email: userInfo.email,
          created_at: user.value?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    }
  };

  const initializeAuth = () => {
    // Check if user is already logged in
    if (accessToken.value) {
      // Check if token is expired
      if (isTokenExpired(accessToken.value)) {
        // Clear expired tokens
        logout();
        return;
      }

      // Extract user info from JWT token
      const userInfo = extractUserInfo(accessToken.value);
      if (userInfo) {
        user.value = {
          id: userInfo.userId,
          email: userInfo.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else {
        // If JWT extraction fails, clear tokens
        logout();
      }
    }
  };

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userEmail,

    // Actions
    login,
    logout,
    clearError,
    refreshUserInfo,
    initializeAuth,
  };
});
