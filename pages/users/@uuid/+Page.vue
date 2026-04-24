<script setup lang="ts">
import { useData } from "vike-vue/useData"
import { navigate } from "vike/client/router"
import type { Data } from "./+data"
import UserCard from "../../../components/UserCard.vue"

const user = useData<Data>()
</script>

<template>
  <main class="relative min-h-dvh flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <img
        v-if="user.banner_url"
        :src="user.banner_url"
        alt=""
        class="w-full h-full object-cover scale-125"
        loading="eager"
        decoding="async"
        width="1280"
        height="720"
      />
      <div
        v-else
        class="w-full h-full"
        :style="{ background: `radial-gradient(ellipse at 30% 40%, ${user.embed_color}55 0%, #0d0d0f 65%)` }"
      />
      <div class="absolute inset-0 bg-[#0d0d0f]/75 backdrop-blur-3xl" />
    </div>
    <UserCard :user="user" />
    <button
      class="mt-6 text-sm text-discord-faint hover:text-discord-muted transition-colors duration-150 cursor-pointer"
      @click="navigate('/')"
    >
      ← Look up another user
    </button>
  </main>
</template>