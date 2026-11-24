<template>
  <article class="rounded-xl bg-white p-4 shadow-sm">
    <h2 class="text-lg font-medium text-gray-900">{{ props.item.title }}</h2>
    <p class="mt-1 text-sm text-gray-500">ID: {{ props.item.id }}</p>
  </article>
</template>

<script setup lang="ts">
  import type { IDemoDTO } from '../types/IDemoDTO';

  interface IProps {
    item: IDemoDTO;
  }

  const props = defineProps<IProps>();
</script>
