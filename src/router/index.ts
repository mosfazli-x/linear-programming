import { createRouter, createWebHistory } from 'vue-router'
import SimplexView from '../views/Simplex.vue'
import DoganView from '../views/Dogan.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/simplex',
      name: 'simplex',
      component: SimplexView,
    },
    {
      path: '/dogan',
      name: 'dogan',
      component: DoganView,
    },
  ],
})

export default router
