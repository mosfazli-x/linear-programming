<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
import '../src/assets/main.css';
</script>

<template>
  <div class="bg-black w-dvw h-dvh overflow-auto">
    <div class="h-min p-4 flex lg:flex-row flex-col gap-5 justify-center align-middle items-center">
      <RouterLink to="/simplex">
        <button class="btn" :class="route.path === '/simplex' ? 'btn-primary' : 'btn-outline'">
          Simplex Solver
        </button>
      </RouterLink>
      <RouterLink to="/dogan">
        <button class="btn" :class="route.path === '/dogan' ? 'btn-primary' : 'btn-outline'">
          Dogan's Solution
        </button>
      </RouterLink>
    </div>
    <img class="fixed w-16 md:w-24 top-4 right-4" src="./assets/elmos_logo.png">
    <RouterView />
  </div>
</template>