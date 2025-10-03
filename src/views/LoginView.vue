<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Use the mock credentials to login
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <BaseInput
            id="email"
            v-model="form.email"
            type="email"
            label="Email address"
            placeholder="Enter your email"
            :error="errors.email"
            required
          />

          <BaseInput
            id="password"
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            :error="errors.password"
            required
          />
        </div>

        <div
          v-if="authStore.error"
          class="bg-red-50 border border-red-200 rounded-md p-4"
        >
          <p class="text-sm text-red-600">{{ authStore.error }}</p>
        </div>

        <div>
          <BaseButton
            type="submit"
            :loading="authStore.isLoading"
            class="w-full"
            size="lg"
          >
            Sign in
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores";
import { useToast } from "@/composables/useToast";
import { BaseInput, BaseButton } from "@/components";
import type { LoginRequest } from "@/types";

const router = useRouter();
const authStore = useAuthStore();
const { success, error } = useToast();

const form = ref<LoginRequest>({
  email: "",
  password: "",
});

const errors = ref({
  email: "",
  password: "",
});

const validateForm = () => {
  errors.value = { email: "", password: "" };

  if (!form.value.email.trim()) {
    errors.value.email = "Email is required";
    return false;
  }

  if (!form.value.email.includes("@")) {
    errors.value.email = "Please enter a valid email";
    return false;
  }

  if (!form.value.password.trim()) {
    errors.value.password = "Password is required";
    return false;
  }

  if (form.value.password.length < 8) {
    errors.value.password = "Password must be at least 8 characters";
    return false;
  }

  return true;
};

const handleLogin = async () => {
  if (!validateForm()) return;

  try {
    await authStore.login(form.value);
    success(
      "Login successful",
      "Welcome back! You have been logged in successfully."
    );
    router.push("/dashboard");
  } catch (err) {
    console.error("Failed to login:", err);
    error(
      "Login failed",
      "Invalid credentials. Please check your email and password."
    );
  }
};

onMounted(() => {
  authStore.clearError();
});
</script>
