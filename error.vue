<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4 text-center"
  >
    <h1 class="text-3xl font-medium text-gray-900">
      {{ props.error?.message ?? 'Произошла ошибка' }}
    </h1>

    <NuxtLink
      to="/"
      class="text-blue-600 underline"
    >
      На главную
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
  import type { NuxtError } from '#app';

  interface IProps {
    error?: NuxtError;
  }

  const props = defineProps<IProps>();
</script>
