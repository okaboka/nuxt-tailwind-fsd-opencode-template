<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold text-gray-900">Главная страница</h1>
      <p class="text-gray-600">
        Стартовый шаблон на Nuxt 4, Tailwind CSS 4 и FSD.
      </p>
    </div>

    <DemoCard :item="demo" />

    <div class="flex flex-wrap items-center gap-3">
      <UiButton @click="onDemoClick">Демо-кнопка</UiButton>

      <NuxtLink
        to="/about"
        class="text-sm font-medium text-blue-600 underline"
      >
        Перейти на страницу «О шаблоне»
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { IDemoDTO } from 'entities/demo/types/IDemoDTO';
  import DemoCard from 'entities/demo/ui/DemoCard.vue';
  import UiButton from 'shared/ui/uiButton/ui/UiButton.vue';

  const demo: IDemoDTO = {
    id: 1,
    title: 'Демонстрационная карточка',
  };

  const onDemoClick = (): void => {
    console.info('[demo] Кнопка нажата');
  };
</script>
