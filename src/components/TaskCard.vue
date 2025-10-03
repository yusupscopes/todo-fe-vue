<template>
  <div
    class="task-card bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow h-full flex flex-col"
  >
    <!-- Unified Layout - Consistent across all screen sizes -->
    <div class="task-card-content flex flex-col h-full">
      <!-- Header: Title and Status -->
      <div class="flex items-start justify-between mb-3">
        <h3
          class="text-sm font-medium text-gray-900 dark:text-white leading-tight flex-1 mr-3"
        >
          {{ task.title }}
        </h3>
        <span
          :class="statusClasses"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
        >
          {{ statusLabel }}
        </span>
      </div>

      <!-- Content: Date Information -->
      <div class="text-xs text-gray-500 dark:text-gray-400 mb-4 flex-1">
        <p>Created {{ formatDate(task.created_at) }}</p>
        <p
          v-if="task.updated_at !== task.created_at"
          class="text-xs text-gray-500 dark:text-gray-400"
        >
          Updated {{ formatDate(task.updated_at) }}
        </p>
      </div>

      <!-- Actions: Buttons -->
      <div class="flex justify-end space-x-1 mt-auto">
        <BaseButton
          v-if="task.status !== 'completed'"
          variant="outline"
          size="sm"
          @click="handleComplete"
        >
          ✓
        </BaseButton>
        <BaseButton variant="outline" size="sm" @click="$emit('edit', task)">
          ✏️
        </BaseButton>
        <BaseButton
          variant="danger"
          size="sm"
          @click="$emit('delete', task.id)"
        >
          🗑️
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseButton from "./BaseButton.vue";
import type { Task, TaskStatus } from "@/types";

interface Props {
  task: Task;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  update: [data: { status: TaskStatus }];
  edit: [task: Task];
  delete: [id: string];
}>();

const handleComplete = () => {
  emit("update", { status: "completed" });
};

const statusClasses = computed(() => {
  const classes = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return classes[props.task.status];
});

const statusLabel = computed(() => {
  const labels = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[props.task.status];
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>
