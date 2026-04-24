<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/8 text-discord-muted border border-white/10">
    {{ label }}
  </span>
</template>