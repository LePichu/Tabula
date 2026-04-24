<script setup lang="ts">
defineProps<{
	src: string | null
	username: string
	size?: number
	color?: string
}>()
</script>

<template>
	<div
		class="relative rounded-full ring-4 ring-discord-bg shrink-0 overflow-hidden"
		:style='
			{
				width: `${size ?? 80}px`,
				height: `${size ?? 80}px`,
				background: color ?? "#5865f2",
			}
		'
	>
		<img
			v-if="src"
			:src="src"
			:alt="`${username}'s avatar`"
			:width="size ?? 80"
			:height="size ?? 80"
			class="absolute inset-0 rounded-full object-cover w-full h-full"
			loading="eager"
			decoding="async"
		/>
		<div
			v-else
			class="absolute inset-0 flex items-center justify-center text-white font-bold select-none"
			:style="{ fontSize: `${(size ?? 80) * 0.38}px` }"
			role="img"
			:aria-label="`${username}'s default avatar`"
		>
			{{ username.charAt(0).toUpperCase() }}
		</div>
	</div>
</template>
