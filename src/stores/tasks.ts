import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAsyncState } from "@vueuse/core";
import { apiService } from "@/services";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskListParams,
} from "@/types";

export const useTasksStore = defineStore("tasks", () => {
  // State
  const tasks = ref<Task[]>([]);
  const currentTask = ref<Task | null>(null);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });
  const filters = ref<TaskListParams>({
    page: 1,
    limit: 10,
    sort_field: "created_at",
    sort_order: "desc",
  });

  // Async state for tasks fetching
  const {
    isLoading: isTasksLoading,
    error: tasksError,
    execute: executeFetchTasks,
  } = useAsyncState(
    async (params?: TaskListParams) => {
      // Use provided params or current filters
      const requestParams = params || filters.value;
      const response = await apiService.getTasks(requestParams);
      if (response.error) {
        throw new Error(response.message);
      }
      if (response.data) {
        tasks.value = response.data;
        if (response.meta?.pagination) {
          pagination.value = response.meta.pagination;
        }
      }
      return response.data;
    },
    [],
    { immediate: false }
  );

  // Getters
  const pendingTasks = computed(() =>
    tasks.value.filter((task) => task.status === "pending")
  );
  const inProgressTasks = computed(() =>
    tasks.value.filter((task) => task.status === "in_progress")
  );
  const completedTasks = computed(() =>
    tasks.value.filter((task) => task.status === "completed")
  );
  const cancelledTasks = computed(() =>
    tasks.value.filter((task) => task.status === "cancelled")
  );

  const tasksByStatus = computed(() => ({
    pending: pendingTasks.value,
    in_progress: inProgressTasks.value,
    completed: completedTasks.value,
    cancelled: cancelledTasks.value,
  }));

  // Actions
  const fetchTasks = async (params?: TaskListParams) => {
    // Use provided params or current filters
    const requestParams = params || filters.value;
    return executeFetchTasks(0, requestParams);
  };

  // Async state for single task fetching
  const {
    isLoading: isTaskLoading,
    error: taskError,
    execute: executeFetchTask,
  } = useAsyncState(
    async (id: string) => {
      const response = await apiService.getTask(id);
      if (response.error) {
        throw new Error(response.message);
      }
      if (response.data) {
        currentTask.value = response.data;
        return response.data;
      }
    },
    null,
    { immediate: false }
  );

  const fetchTask = async (id: string) => {
    return executeFetchTask(0, id);
  };

  // Async state for task creation
  const {
    isLoading: isCreatingTask,
    error: createTaskError,
    execute: executeCreateTask,
  } = useAsyncState(
    async (taskData: CreateTaskRequest) => {
      const response = await apiService.createTask(taskData);
      if (response.error) {
        throw new Error(response.message);
      }
      if (response.data) {
        tasks.value.unshift(response.data);
        return response.data;
      }
    },
    null,
    { immediate: false }
  );

  const createTask = async (taskData: CreateTaskRequest) => {
    return executeCreateTask(0, taskData);
  };

  // Async state for task update
  const {
    isLoading: isUpdatingTask,
    error: updateTaskError,
    execute: executeUpdateTask,
  } = useAsyncState(
    async ({ id, taskData }: { id: string; taskData: UpdateTaskRequest }) => {
      const response = await apiService.updateTask(id, taskData);
      if (response.error) {
        throw new Error(response.message);
      }
      if (response.data) {
        const index = tasks.value.findIndex((task) => task.id === id);
        if (index !== -1) {
          tasks.value[index] = response.data;
        }

        if (currentTask.value?.id === id) {
          currentTask.value = response.data;
        }

        return response.data;
      }
    },
    null,
    { immediate: false }
  );

  const updateTask = async (id: string, taskData: UpdateTaskRequest) => {
    return executeUpdateTask(0, { id, taskData });
  };

  // Async state for task deletion
  const {
    isLoading: isDeletingTask,
    error: deleteTaskError,
    execute: executeDeleteTask,
  } = useAsyncState(
    async (id: string) => {
      const response = await apiService.deleteTask(id);
      if (response.error) {
        throw new Error(response.message);
      }

      // Remove task from local state
      const index = tasks.value.findIndex((task) => task.id === id);
      if (index !== -1) {
        tasks.value.splice(index, 1);
      }

      if (currentTask.value?.id === id) {
        currentTask.value = null;
      }
    },
    null,
    { immediate: false }
  );

  const deleteTask = async (id: string) => {
    return executeDeleteTask(0, id);
  };

  const updateFilters = (newFilters: Partial<TaskListParams>) => {
    filters.value = { ...filters.value, ...newFilters };
  };

  const clearError = () => {
    // Clear all async state errors
    tasksError.value = null;
    taskError.value = null;
    createTaskError.value = null;
    updateTaskError.value = null;
    deleteTaskError.value = null;
  };

  const clearCurrentTask = () => {
    currentTask.value = null;
  };

  const clearFilters = () => {
    filters.value = {
      page: 1,
      limit: 10,
      sort_field: "created_at",
      sort_order: "desc",
    };
  };

  // Computed loading state (any operation loading)
  const isLoading = computed(
    () =>
      isTasksLoading.value ||
      isTaskLoading.value ||
      isCreatingTask.value ||
      isUpdatingTask.value ||
      isDeletingTask.value
  );

  // Computed error state (any operation error)
  const error = computed(
    () =>
      tasksError.value ||
      taskError.value ||
      createTaskError.value ||
      updateTaskError.value ||
      deleteTaskError.value
  );

  return {
    // State
    tasks,
    currentTask,
    isLoading,
    error,
    pagination,
    filters,

    // Getters
    pendingTasks,
    inProgressTasks,
    completedTasks,
    cancelledTasks,
    tasksByStatus,

    // Actions
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    updateFilters,
    clearFilters,
    clearError,
    clearCurrentTask,
  };
});
