<script setup lang="ts">
import { usePageContext } from "vike-vue/usePageContext"
import type { UserInfoResponse } from "../../../src/types"

const ctx = usePageContext()
const user = ctx.data as UserInfoResponse

const title = user ? `${user.global_name ?? user.username} — Tabula` : "Tabula"
const description = user
	? `Discord user ${user.username} • ID ${user.id} • Account created ${
		new Date(user.account_created_at).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		})
	}`
	: "Look up any Discord user by ID."
const image = user?.banner_url ?? user?.avatar_url ?? "/og-default.png"
const url = `https://tabula.lepichu.deno.net/users/${user?.id ?? ""}`
</script>

<template>
	<title>{{ title }}</title>
	<meta name="description" :content="description" />

	<!-- OpenGraph -->
	<meta property="og:type" content="profile" />
	<meta property="og:title" :content="title" />
	<meta property="og:description" :content="description" />
	<meta property="og:image" :content="image" />
	<meta property="og:url" :content="url" />
	<meta property="og:site_name" content="Tabula" />

	<!-- Twitter/X card -->
	<meta
		name="twitter:card"
		:content='user?.banner_url ? "summary_large_image" : "summary"'
	/>
	<meta name="twitter:title" :content="title" />
	<meta name="twitter:description" :content="description" />
	<meta name="twitter:image" :content="image" />
</template>
