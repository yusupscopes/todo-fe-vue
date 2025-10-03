<template>
  <div class="flex flex-col sm:flex-row gap-2">
    <!-- Sort Field Selector -->
    <div class="w-full sm:w-40">
      <BaseSelect
        :model-value="sortField"
        :options="sortFieldOptions"
        placeholder="Sort by..."
        @update:model-value="handleSortFieldChange"
      />
    </div>

    <!-- Sort Order Toggle -->
    <div class="w-full sm:w-auto">
      <BaseButton
        variant="outline"
        @click="toggleSortOrder"
        class="w-full sm:w-auto flex items-center justify-center gap-2"
      >
        <span class="text-sm">{{ sortOrderLabel }}</span>
        <span class="text-sm">{{ sortOrderIcon }}</span>
      </BaseButton>
    </div>

    <!-- Clear Sort Button (only show when sorting is active) -->
    <div v-if="isSortingActive" class="w-full sm:w-auto">
      <BaseButton variant="outline" @click="clearSort" class="w-full sm:w-auto">
        Clear
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { BaseButton, BaseSelect } from "@/components";
import type { TaskListParams } from "@/types";

interface Props {
  modelValue?: TaskListParams;
}

interface Emits {
  (e: "update:modelValue", value: TaskListParams): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local state
const sortField = ref<string>("created_at");
const sortOrder = ref<"asc" | "desc">("desc");

// Sort field options
const sortFieldOptions = [
  { value: "created_at", label: "Created Date" },
  { value: "updated_at", label: "Updated Date" },
  { value: "title", label: "Title" },
  { value: "status", label: "Status" },
];

// Computed properties
const sortOrderLabel = computed(() => {
  return sortOrder.value === "asc" ? "Ascending" : "Descending";
});

const sortOrderIcon = computed(() => {
  return sortOrder.value === "asc" ? "↑" : "↓";
});

const isSortingActive = computed(() => {
  return sortField.value !== "created_at" || sortOrder.value !== "desc";
});

// Methods
const handleSortFieldChange = (value: string) => {
  sortField.value = value;
  emitSortUpdate();
};

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  emitSortUpdate();
};

const clearSort = () => {
  sortField.value = "created_at";
  sortOrder.value = "desc";
  emitSortUpdate();
};

const emitSortUpdate = () => {
  const updatedValue = {
    ...props.modelValue,
    sort_field: sortField.value as TaskListParams["sort_field"],
    sort_order: sortOrder.value,
  };
  emit("update:modelValue", updatedValue);
};

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue?.sort_field) {
      sortField.value = newValue.sort_field;
    }
    if (newValue?.sort_order) {
      sortOrder.value = newValue.sort_order;
    }
  },
  { immediate: true }
);
</script>
