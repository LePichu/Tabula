<script setup lang="ts">
import { usePageContext } from "vike-vue/usePageContext"
import { navigate } from "vike/client/router"

const ctx = usePageContext()
const is404 = ctx.abortStatusCode === 404
</script>

<template>
	<main
		class="min-h-dvh flex flex-col items-center justify-center px-4 bg-[#0d0d0f] text-center gap-4"
	>
		<p class="text-6xl font-bold text-white/10 select-none tabular-nums">
			{{ is404 ? "404" : "500" }}
		</p>
		<h1 class="text-lg font-semibold text-white">
			{{ is404 ? "User not found" : "Something went wrong" }}
		</h1>
		<p class="text-sm text-discord-faint max-w-xs leading-relaxed">
			{{
				is404
					? "That user ID doesn't exist or the account has been deleted."
					: "The API returned an unexpected error. Try again in a moment."
			}}
		</p>
		<button
			class="mt-2 text-sm text-[#8e9df7] hover:text-[#b9c0f9] transition-colors duration-150 cursor-pointer"
			@click='navigate("/")'
		>
			← Back to search
		</button>
	</main>
</template>
