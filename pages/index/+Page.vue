<script setup lang="ts">
import { ref } from "vue"
import { navigate } from "vike/client/router"

const uuid = ref("")
const error = ref("")
const UUID_RE = /^\d{17,20}$/

const submit = async () => {
  const val = uuid.value.trim()
  if (!val) return
  if (!UUID_RE.test(val)) {
    error.value = "That doesn't look like a valid Discord snowflake ID."
    return
  }
  error.value = ""
  await navigate(`/users/${val}`)
}
</script>

<template>
  <main class="min-h-dvh flex flex-col items-center justify-center px-4 bg-[#0d0d0f]">
    <div class="w-full max-w-sm flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-xl font-bold text-white tracking-tight">User Lookup</h1>
        <p class="text-sm text-discord-faint">Enter a Discord snowflake ID to view a profile.</p>
      </div>
      <div class="flex flex-col gap-2">
        <div
          class="flex items-center gap-2 rounded-lg px-3 py-2.5 border transition-all duration-150"
          :class="error
            ? 'bg-discord-bg border-[#f23f42]/60 focus-within:border-[#f23f42]'
            : 'bg-discord-bg border-white/10 focus-within:border-blurple'"
        >
          <svg class="shrink-0 text-discord-faint" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="uuid"
            type="text"
            inputmode="numeric"
            placeholder="711169405681270805"
            class="flex-1 bg-transparent text-white placeholder-[#4e5058] text-sm outline-none"
            aria-label="Discord user ID"
            @keydown.enter="submit"
          />
        </div>
        <p v-if="error" class="text-[#f23f42] text-xs px-1">{{ error }}</p>
      </div>
      <button
        class="w-full rounded-lg py-2.5 text-sm font-semibold text-white bg-blurple hover:bg-blurple-hover active:bg-[#3c45a5] transition-colors duration-150 cursor-pointer"
        @click="submit"
      >
        Look up
      </button>
    </div>
  </main>
</template>