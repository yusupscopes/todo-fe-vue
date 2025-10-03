<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900"
    :class="{ dark: isDarkMode }"
  >
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4"
        >
          <div class="flex-1 min-w-0">
            <h1
              class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate"
            >
              Todo Dashboard
            </h1>
            <p
              class="text-sm sm:text-base text-gray-600 dark:text-gray-300 truncate"
            >
              Welcome back, {{ authStore.userEmail }}
            </p>
          </div>
          <div class="w-full sm:w-auto">
            <BaseButton
              variant="outline"
              @click="handleLogout"
              class="w-full sm:w-auto"
            >
              Logout
            </BaseButton>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Controls -->
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-6">
          <!-- Search, Filter, Sort, and Create Button Row -->
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <!-- Search Input -->
            <div class="flex-1 min-w-0">
              <BaseInput
                v-model="searchQuery"
                placeholder="Search tasks..."
                @input="handleSearch"
              />
            </div>

            <!-- Status Filter -->
            <div class="w-full sm:w-48">
              <BaseSelect
                v-model="statusFilter"
                :options="statusOptions"
                placeholder="All statuses"
                @change="handleFilter"
              />
            </div>

            <!-- Create Task Button -->
            <div class="w-full sm:w-auto">
              <BaseButton @click="openCreateModal" class="w-full sm:w-auto">
                Create Task
              </BaseButton>
            </div>
          </div>

          <!-- Sort Controls Row -->
          <div class="mt-4">
            <TaskSort
              v-model="currentFilters"
              @update:modelValue="handleSortChange"
            />
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="tasksStore.error"
          class="mb-4 bg-red-50 border border-red-200 rounded-md p-4"
        >
          <p class="text-sm text-red-600">{{ tasksStore.error }}</p>
          <BaseButton
            variant="outline"
            size="sm"
            class="mt-2"
            @click="tasksStore.clearError"
          >
            Dismiss
          </BaseButton>
        </div>

        <!-- Loading State -->
        <div v-if="tasksStore.isLoading" class="flex justify-center py-8">
          <LoadingSpinner />
        </div>

        <!-- Tasks Grid -->
        <div
          v-else-if="filteredTasks.length > 0"
          class="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        >
          <TaskCard
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            @update="(data) => handleUpdateTask(data, task.id)"
            @edit="handleEditTask"
            @delete="handleDeleteTask"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <div class="text-gray-400 text-6xl mb-4">📝</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p class="text-gray-500 mb-4">
            {{
              searchQuery || statusFilter
                ? "Try adjusting your filters"
                : "Get started by creating your first task"
            }}
          </p>
          <BaseButton
            v-if="!searchQuery && !statusFilter"
            @click="openCreateModal"
          >
            Create Task
          </BaseButton>
        </div>

        <!-- Pagination -->
        <div
          v-if="tasksStore.pagination.total_pages > 1"
          class="mt-8 flex justify-center"
        >
          <nav
            class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2"
          >
            <BaseButton
              variant="outline"
              size="sm"
              :disabled="tasksStore.pagination.page === 1"
              @click="handlePageChange(tasksStore.pagination.page - 1)"
              class="w-full sm:w-auto"
            >
              Previous
            </BaseButton>
            <span
              class="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap"
            >
              Page {{ tasksStore.pagination.page }} of
              {{ tasksStore.pagination.total_pages }}
            </span>
            <BaseButton
              variant="outline"
              size="sm"
              :disabled="
                tasksStore.pagination.page === tasksStore.pagination.total_pages
              "
              @click="handlePageChange(tasksStore.pagination.page + 1)"
              class="w-full sm:w-auto"
            >
              Next
            </BaseButton>
          </nav>
        </div>
      </div>
    </main>

    <!-- Task Modal -->
    <TaskModal
      :is-open="isModalOpen"
      :task="editingTask"
      :is-loading="tasksStore.isLoading"
      @close="closeModal"
      @submit="handleSubmitTask"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useDebounceFn, useLocalStorage, usePreferredDark } from "@vueuse/core";
import { useAuthStore, useTasksStore } from "@/stores";
import { useToast } from "@/composables/useToast";
import {
  BaseButton,
  BaseInput,
  BaseSelect,
  TaskCard,
  TaskModal,
  TaskSort,
  LoadingSpinner,
} from "@/components";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
} from "@/types";

const router = useRouter();
const authStore = useAuthStore();
const tasksStore = useTasksStore();
const { success, error } = useToast();

// State with persistent storage
const searchQuery = useLocalStorage("dashboard-search", "");
const statusFilter = useLocalStorage("dashboard-status-filter", "");
const isModalOpen = ref(false);
const editingTask = ref<Task | null>(null);

// Dark mode preference
const isDarkMode = usePreferredDark();

// Computed - tasks are now filtered by the backend
const filteredTasks = computed(() => tasksStore.tasks);

// Computed - current filters for the sort component
const currentFilters = computed(() => tasksStore.filters);

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

// Methods
const loadTasks = async () => {
  try {
    await tasksStore.fetchTasks();
  } catch (error) {
    console.error("Failed to load tasks:", error);
    error(
      "Failed to load tasks",
      "There was an error retrieving your tasks. Please try again."
    );
  }
};

const loadTasksWithFilters = async () => {
  try {
    // Update filters in store with current search and status values
    tasksStore.updateFilters({
      search: searchQuery.value || undefined,
      status: (statusFilter.value as TaskStatus) || undefined,
      page: 1, // Reset to first page when filtering
    });

    await tasksStore.fetchTasks();
  } catch (error) {
    console.error("Failed to load tasks:", error);
    error(
      "Failed to load tasks",
      "There was an error retrieving your tasks. Please try again."
    );
  }
};

// Debounced search function
const debouncedSearch = useDebounceFn(() => {
  loadTasksWithFilters();
}, 300);

const handleSearch = () => {
  debouncedSearch();
};

const handleFilter = () => {
  loadTasksWithFilters();
};

const handleSortChange = (newFilters: any) => {
  // Update filters in store with new sort parameters
  tasksStore.updateFilters({
    ...newFilters,
    page: 1, // Reset to first page when sorting changes
  });
  loadTasks();
};

const handlePageChange = (page: number) => {
  tasksStore.updateFilters({ page });
  loadTasks();
};

const openCreateModal = () => {
  editingTask.value = null;
  isModalOpen.value = true;
};

const handleEditTask = (task: Task) => {
  editingTask.value = task;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  editingTask.value = null;
};

const handleSubmitTask = async (
  data: CreateTaskRequest | UpdateTaskRequest
) => {
  try {
    if (editingTask.value) {
      await tasksStore.updateTask(
        editingTask.value.id,
        data as UpdateTaskRequest
      );
      success("Task updated", "Your task has been updated successfully.");
    } else {
      await tasksStore.createTask(data as CreateTaskRequest);
      success("Task created", "Your new task has been created successfully.");
    }
    closeModal();
  } catch (error) {
    console.error("Failed to save task:", error);
    const action = editingTask.value ? "update" : "create";
    error(
      `Failed to ${action} task`,
      `There was an error ${
        action === "update" ? "updating" : "creating"
      } your task. Please try again.`
    );
  }
};

const handleUpdateTask = async (
  data: { status: TaskStatus },
  taskId: string
) => {
  try {
    await tasksStore.updateTask(taskId, data);
    const statusLabels = {
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    success(
      "Task updated",
      `Task status changed to ${statusLabels[data.status]}.`
    );
  } catch (error) {
    console.error("Failed to update task:", error);
    error(
      "Failed to update task",
      "There was an error updating the task status. Please try again."
    );
  }
};

const handleDeleteTask = async (taskId: string) => {
  if (confirm("Are you sure you want to delete this task?")) {
    try {
      await tasksStore.deleteTask(taskId);
      success("Task deleted", "The task has been deleted successfully.");
    } catch (error) {
      console.error("Failed to delete task:", error);
      error(
        "Failed to delete task",
        "There was an error deleting the task. Please try again."
      );
    }
  }
};

const handleLogout = () => {
  authStore.logout();
  success("Logged out", "You have been logged out successfully.");
  router.push("/login");
};

// Lifecycle
onMounted(() => {
  // Initialize filters from localStorage and load tasks
  tasksStore.updateFilters({
    search: searchQuery.value || undefined,
    status: (statusFilter.value as TaskStatus) || undefined,
    page: 1,
  });
  loadTasksWithFilters();
});

// Watch for auth changes
watch(
  () => authStore.isAuthenticated,
  (isAuth) => {
    if (!isAuth) {
      router.push("/login");
    }
  }
);
</script>
