import { defineNuxtRouteMiddleware } from '#imports';

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  console.info('[test-middleware] Переход на', to.fullPath);
});
