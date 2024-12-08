<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
import '../src/assets/main.css';
</script>

<template>
  <div class="bg-black w-screen h-dvh overflow-auto">
    <div class="relative h-min p-4 flex lg:flex-row flex-col gap-5 justify-center align-middle items-center">
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
      <div class="absolute top-4 right-0 flex flex-col justify-center align-middle items-center">
        <img class=" w-16 md:w-24" src="./assets/elmos_logo.png">
        <button class="btn btn-ghost btn-sm text-gray-700" onclick="my_modal_2.showModal()">LP</button>
        <dialog id="my_modal_2" class="modal overflow-hidden w-screen h-screen fixed">
          <div class="modal-box">
            <h3 class="text-lg font-bold text-gray-300">Linear Programming App</h3>
            <p class="pt-4 text-gray-500">Coded by Mostafa Fazli</p>
            <p class="pb-4 text-gray-500">University project under the supervision of Dr. Javad Vahidi</p>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </div>
    <RouterView />
  </div>
</template>