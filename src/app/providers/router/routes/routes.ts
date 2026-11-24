import type { RouterConfig } from 'nuxt/schema';

export const routes: RouterConfig['routes'] = () => [
  {
    name: 'home',
    path: '/',
    component: () =>
      import('@/src/pages/home/ui/HomePage.vue').then((r) => r.default || r),
    meta: {
      layout: 'main-layout',
    },
  },
  {
    name: 'about',
    path: '/about',
    component: () =>
      import('@/src/pages/about/ui/AboutPage.vue').then((r) => r.default || r),
    meta: {
      layout: 'main-layout',
    },
  },
];
