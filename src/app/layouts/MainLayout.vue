<script setup lang="ts">
  import AppTopbar from 'widgets/appTopbar/ui/AppTopbar.vue';
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <AppTopbar />

    <main class="mx-auto w-full max-w-5xl grow px-4 py-8">
      <slot />
    </main>
  </div>
</template>
