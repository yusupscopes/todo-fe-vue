<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <ToastNotification
      v-for="toast in toasts"
      :key="toast.id"
      :type="toast.type"
      :title="toast.title"
      :description="toast.description"
      :duration="toast.duration"
      @close="removeToast(toast.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { useToast } from "@/composables/useToast";
import ToastNotification from "./ToastNotification.vue";

const { toasts, removeToast } = useToast();
</script>
