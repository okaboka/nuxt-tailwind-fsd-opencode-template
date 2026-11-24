<template>
  <button
    class="inline-flex cursor-pointer appearance-none items-center justify-center rounded-lg p-0 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none"
    :class="{
      'bg-gray-900 hover:bg-gray-800 active:bg-gray-700 focus-visible:ring-gray-400':
        props.variant === 'primary',
      'bg-white text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:ring-gray-300':
        props.variant === 'white',
      'p-2 text-base': props.size === 'M',
      'px-2 py-0.75 text-sm': props.size === 'S',
    }"
    :disabled="props.disabled"
    :type="props.type"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
  import type { ButtonHTMLAttributes } from 'vue';

  interface IProps {
    variant?: 'primary' | 'white';
    size?: 'S' | 'M';
    disabled?: boolean;
    type?: ButtonHTMLAttributes['type'];
  }

  const props = withDefaults(defineProps<IProps>(), {
    variant: 'primary',
    size: 'M',
    type: 'button',
  });
</script>
