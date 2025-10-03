<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <!-- Background overlay -->
    <div
      class="absolute inset-0 bg-gray-500 bg-opacity-75"
      @click="$emit('close')"
    ></div>

    <!-- Modal panel -->
    <div
      class="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      style="z-index: 60"
    >
      <form @submit.prevent="handleSubmit">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                {{ isEditing ? "Edit Task" : "Create New Task" }}
              </h3>

              <BaseInput
                id="task-title"
                v-model="form.title"
                label="Task Title"
                placeholder="Enter task title..."
                :error="errors.title"
                required
              />

              <BaseSelect
                v-if="isEditing"
                id="task-status"
                v-model="form.status"
                label="Status"
                :options="statusOptions"
                :error="errors.status"
              />
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <BaseButton
            type="submit"
            :loading="isLoading"
            class="w-full sm:w-auto sm:ml-3"
          >
            {{ isEditing ? "Update Task" : "Create Task" }}
          </BaseButton>
          <BaseButton
            type="button"
            variant="outline"
            class="mt-3 w-full sm:mt-0 sm:w-auto"
            @click="$emit('close')"
          >
            Cancel
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseInput from "./BaseInput.vue";
import BaseSelect from "./BaseSelect.vue";
import BaseButton from "./BaseButton.vue";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
} from "@/types";

interface Props {
  isOpen: boolean;
  task?: Task | null;
  isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  task: null,
  isLoading: false,
});

const emit = defineEmits<{
  close: [];
  submit: [data: CreateTaskRequest | UpdateTaskRequest];
}>();

const form = ref({
  title: "",
  status: "pending" as TaskStatus,
});

const errors = ref({
  title: "",
  status: "",
});

const isEditing = computed(() => !!props.task);

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const resetForm = () => {
  form.value = {
    title: "",
    status: "pending",
  };
  errors.value = {
    title: "",
    status: "",
  };
};

const validateForm = () => {
  errors.value = { title: "", status: "" };

  if (!form.value.title.trim()) {
    errors.value.title = "Title is required";
    return false;
  }

  if (form.value.title.length > 200) {
    errors.value.title = "Title must be less than 200 characters";
    return false;
  }

  return true;
};

const handleSubmit = () => {
  if (!validateForm()) return;

  if (isEditing.value) {
    emit("submit", {
      title: form.value.title,
      status: form.value.status,
    });
  } else {
    emit("submit", {
      title: form.value.title,
    });
  }
};

// Watch for task changes to populate form
watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      form.value = {
        title: newTask.title,
        status: newTask.status,
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// Reset form when modal closes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      resetForm();
    }
  }
);
</script>
