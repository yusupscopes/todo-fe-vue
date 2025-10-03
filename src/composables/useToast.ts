import { ref } from "vue";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

const toasts = ref<Toast[]>([]);

export function useToast() {
  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    toasts.value.push(newToast);

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const clearAll = () => {
    toasts.value = [];
  };

  // Convenience methods
  const success = (title: string, description?: string, duration?: number) => {
    return addToast({ type: "success", title, description, duration });
  };

  const error = (title: string, description?: string, duration?: number) => {
    return addToast({ type: "error", title, description, duration });
  };

  const warning = (title: string, description?: string, duration?: number) => {
    return addToast({ type: "warning", title, description, duration });
  };

  const info = (title: string, description?: string, duration?: number) => {
    return addToast({ type: "info", title, description, duration });
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };
}
