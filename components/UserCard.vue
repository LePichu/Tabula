<script setup lang="ts">
import { onMounted, ref } from "vue"
import { toPng } from "html-to-image"
import AvatarRing from "./AvatarRing.vue"
import ClanTag from "./ClanTag.vue"
import type { UserInfoResponse } from "../src/types"

const props = defineProps<{ user: UserInfoResponse }>()

const exportWrapperRef = ref<HTMLElement | null>(null)
const avatarDataUrl = ref<string | null>(null)
const bannerDataUrl = ref<string | null>(null)
const isExporting = ref(false)
const isCopying = ref<"idle" | "loading" | "done">("idle")

async function toDataUrl(url: string): Promise<string> {
	const res = await fetch(url)
	const blob = await res.blob()
	return new Promise((resolve) => {
		const reader = new FileReader()
		reader.onloadend = () => resolve(reader.result as string)
		reader.readAsDataURL(blob)
	})
}

onMounted(async () => {
	if (props.user.avatar_url) {
		avatarDataUrl.value = await toDataUrl(props.user.avatar_url)
	}
	if (props.user.banner_url) {
		bannerDataUrl.value = await toDataUrl(props.user.banner_url)
	}
})

const downloadFile = (url: string, filename: string) => {
	const a = document.createElement("a")
	a.href = url
	a.download = filename
	a.target = "_blank"
	a.rel = "noopener noreferrer"
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
}

const downloadAvatar = () => {
	if (props.user.avatar_url) {
		downloadFile(props.user.avatar_url, `${props.user.username}-avatar.png`)
	}
}

const downloadBanner = () => {
	if (props.user.banner_url) {
		downloadFile(props.user.banner_url, `${props.user.username}-banner.png`)
	}
}

const exportAsImage = async () => {
	if (!exportWrapperRef.value) return
	isExporting.value = true
	try {
		const dataUrl = await toPng(exportWrapperRef.value, {
			pixelRatio: 2,
			skipFonts: false,
			backgroundColor: "#111214",
		})
		downloadFile(dataUrl, `${props.user.username}-profile.png`)
	} finally {
		isExporting.value = false
	}
}

const copyAsImage = async () => {
	if (!exportWrapperRef.value) return
	isCopying.value = "loading"
	try {
		const dataUrl = await toPng(exportWrapperRef.value, {
			pixelRatio: 2,
			skipFonts: false,
			backgroundColor: "#111214",
		})
		const res = await fetch(dataUrl)
		const blob = await res.blob()
		await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
		isCopying.value = "done"
		setTimeout(() => {
			isCopying.value = "idle"
		}, 2000)
	} catch {
		isCopying.value = "idle"
	}
}

const accountCreated = new Date(props.user.account_created_at)
const formattedDate = accountCreated.toLocaleDateString("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
})
const formattedTime = accountCreated.toLocaleTimeString("en-US", {
	hour: "2-digit",
	minute: "2-digit",
	timeZoneName: "short",
})

const now = new Date()
const diffDays = Math.floor(
	(now.getTime() - accountCreated.getTime()) / 86400000,
)
const diffYears = Math.floor(diffDays / 365)
const diffMonths = Math.floor((diffDays % 365) / 30)
const accountAge = diffYears > 0
	? `${diffYears}y ${diffMonths}mo`
	: `${diffMonths}mo`

const snowflakeBin = BigInt(props.user.id).toString(2).padStart(64, "0")
const workerNode = parseInt(snowflakeBin.slice(17, 22), 2)
const processId = parseInt(snowflakeBin.slice(22, 27), 2)

const BADGE_ICONS: Record<string, string> = {
	"HypeSquad Events":
		"M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z",
	"HypeSquad Bravery":
		"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
	"HypeSquad Brilliance":
		"M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
	"HypeSquad Balance":
		"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
	"Bug Hunter Level 1":
		"M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C13 5.06 12.51 5 12 5s-1 .06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z",
	"Bug Hunter Level 2":
		"M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C13 5.06 12.51 5 12 5s-1 .06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8z",
	"Early Supporter":
		"M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
}
</script>

<template>
	<div class="flex flex-col items-center gap-3 w-full">
		<!-- Action buttons — match card width -->
		<div class="grid grid-cols-2 gap-3 w-full max-w-4xl px-6">
			<button
				class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm text-white/70 hover:text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
				:disabled='isExporting || isCopying !== "idle"'
				@click="exportAsImage"
			>
				<svg
					v-if="!isExporting"
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="7 10 12 15 17 10" />
					<line x1="12" y1="15" x2="12" y2="3" />
				</svg>
				<svg
					v-else
					class="animate-spin"
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<path d="M21 12a9 9 0 1 1-6.219-8.56" />
				</svg>
				{{ isExporting ? "Saving…" : "Save as Image" }}
			</button>

			<button
				class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-sm text-white/70 hover:text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
				:disabled='isExporting || isCopying !== "idle"'
				@click="copyAsImage"
			>
				<svg
					v-if='isCopying === "done"'
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
				<svg
					v-else-if='isCopying === "idle"'
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<rect x="9" y="9" width="13" height="13" rx="2" />
					<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
				</svg>
				<svg
					v-else
					class="animate-spin"
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"
				>
					<path d="M21 12a9 9 0 1 1-6.219-8.56" />
				</svg>
				{{
					isCopying === "done"
						? "Copied!"
						: isCopying === "loading"
						? "Copying…"
						: "Copy as Image"
				}}
			</button>
		</div>

		<!-- Export wrapper — padding lets shadow breathe in exported image -->
		<div ref="exportWrapperRef" class="p-6 w-full max-w-4xl">
			<article
				class="w-full rounded-2xl overflow-hidden shadow-[0_8px_48px_rgba(0,0,0,0.5)] border border-white/10 bg-discord-bg/80"
			>
				<!-- Banner — taller for 4:3 feel -->
				<div class="relative w-full h-56 overflow-hidden group">
					<img
						v-if="bannerDataUrl ?? user.banner_url"
						:src="bannerDataUrl ?? user.banner_url!"
						alt=""
						class="absolute inset-0 w-full h-full object-cover"
						loading="eager"
						decoding="async"
						width="896"
						height="224"
					/>
					<div
						v-else
						class="absolute inset-0 w-full h-full"
						:style="
							{
								background:
									`linear-gradient(135deg, ${user.embed_color}cc 0%, #1e1f22 80%)`,
							}
						"
						aria-hidden="true"
					/>
					<button
						v-if="user.banner_url"
						class="absolute inset-0 w-full h-full flex items-center justify-center gap-2 bg-black/0 hover:bg-black/50 text-white/0 hover:text-white/90 transition-all duration-200 cursor-pointer text-sm font-medium"
						aria-label="Download banner"
						@click="downloadBanner"
					>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							aria-hidden="true"
						>
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
						Download Banner
					</button>
					<div
						class="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs text-white/70 pointer-events-none"
					>
						<span
							class="w-2.5 h-2.5 rounded-full shrink-0 border border-white/20"
							:style="{ background: user.embed_color }"
						/>
						{{ user.embed_color }}
					</div>
				</div>

				<!-- Body -->
				<div class="px-7 pb-7">
					<!-- Avatar row -->
					<div class="flex items-end justify-between -mt-14 mb-5">
						<div
							class="relative group cursor-pointer"
							role="button"
							aria-label="Download avatar"
							tabindex="0"
							@click="downloadAvatar"
							@keydown.enter="downloadAvatar"
						>
							<AvatarRing
								:src="avatarDataUrl ?? user.avatar_url"
								:username="user.username"
								:size="100"
								:color="user.embed_color"
							/>
							<div
								class="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 group-hover:bg-black/55 transition-all duration-200"
							>
								<svg
									class="text-white/0 group-hover:text-white/90 transition-all duration-200"
									width="22"
									height="22"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									aria-hidden="true"
								>
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<polyline points="7 10 12 15 17 10" />
									<line x1="12" y1="15" x2="12" y2="3" />
								</svg>
							</div>
						</div>
						<div class="flex items-center gap-2 pb-2 flex-wrap justify-end">
							<span
								v-if="user.is_bot"
								class="text-xs font-semibold px-2 py-1 rounded-md bg-blurple/20 text-[#8e9df7] border border-blurple/30"
							>BOT</span>
							<span
								v-if="user.is_system"
								class="text-xs font-semibold px-2 py-1 rounded-md bg-white/10 text-white/60 border border-white/15"
							>SYSTEM</span>
						</div>
					</div>

					<!-- Name block -->
					<div class="flex flex-col gap-1 mb-6">
						<div class="flex items-center gap-3 flex-wrap">
							<h1 class="text-3xl font-bold text-white leading-tight">
								{{ user.global_name ?? user.username }}
							</h1>
							<ClanTag v-if="user.clan" :tag="user.clan.tag" />
						</div>
						<p class="text-sm text-discord-muted font-medium">
							{{ user.username }}<span
								v-if="user.discriminator"
								class="text-discord-faint"
							>#{{ user.discriminator }}</span>
						</p>
					</div>

					<div class="h-px bg-white/10 mb-6" role="separator" />

					<!-- Info grid — 3 columns on wide card -->
					<dl class="grid grid-cols-3 gap-x-6 gap-y-5 mb-6">
						<div class="flex flex-col gap-1">
							<dt
								class="text-[10px] font-semibold uppercase tracking-widest text-discord-faint"
							>
								User ID
							</dt>
							<dd
								class="text-sm text-discord-muted font-mono select-all break-all"
							>
								{{ user.id }}
							</dd>
						</div>
						<div class="flex flex-col gap-1">
							<dt
								class="text-[10px] font-semibold uppercase tracking-widest text-discord-faint"
							>
								Account Age
							</dt>
							<dd class="text-sm text-discord-muted">{{ accountAge }}</dd>
						</div>
						<div class="flex flex-col gap-1">
							<dt
								class="text-[10px] font-semibold uppercase tracking-widest text-discord-faint"
							>
								Unix Timestamp
							</dt>
							<dd class="text-sm text-discord-muted font-mono select-all">
								{{ user.created_timestamp }}
							</dd>
						</div>
						<div class="flex flex-col gap-1">
							<dt
								class="text-[10px] font-semibold uppercase tracking-widest text-discord-faint"
							>
								Created
							</dt>
							<dd class="text-sm text-discord-muted">{{ formattedDate }}</dd>
							<dd class="text-xs text-discord-faint">{{ formattedTime }}</dd>
						</div>
						<div v-if="user.clan" class="flex flex-col gap-1">
							<dt
								class="text-[10px] font-semibold uppercase tracking-widest text-discord-faint"
							>
								Clan Guild ID
							</dt>
							<dd
								class="text-xs text-discord-muted font-mono select-all break-all"
							>
								{{ user.clan.identity_guild_id }}
							</dd>
						</div>
					</dl>

					<!-- Badges -->
					<template v-if="user.badges.length">
						<div class="h-px bg-white/10 mb-6" role="separator" />
						<div class="flex flex-col gap-3">
							<p
								class="text-[10px] font-semibold uppercase tracking-widest text-discord-faint"
							>
								Badges
							</p>
							<div class="flex flex-wrap gap-2">
								<div
									v-for="badge in user.badges"
									:key="badge"
									class="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-discord-muted hover:bg-white/10 transition-colors duration-150 whitespace-nowrap"
								>
									<svg
										class="shrink-0"
										width="13"
										height="13"
										viewBox="0 0 24 24"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											:d='
												BADGE_ICONS[badge] ??
													"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
											'
										/>
									</svg>
									{{ badge }}
								</div>
							</div>
						</div>
					</template>

					<!-- Snowflake -->
					<div class="h-px bg-white/10 mt-6 mb-5" role="separator" />
					<div class="flex flex-col gap-3">
						<p
							class="text-[10px] font-semibold uppercase tracking-widest text-discord-faint"
						>
							Snowflake
						</p>
						<div class="grid grid-cols-3 gap-4">
							<div class="flex flex-col gap-1">
								<span
									class="text-[10px] text-discord-faint uppercase tracking-widest"
								>Worker ID</span>
								<span
									class="text-sm font-mono text-discord-muted"
									style="font-variant-emoji: text"
								>{{ workerNode }}</span>
							</div>
							<div class="flex flex-col gap-1">
								<span
									class="text-[10px] text-discord-faint uppercase tracking-widest"
								>Process ID</span>
								<span
									class="text-sm font-mono text-discord-muted"
									style="font-variant-emoji: text"
								>{{ processId }}</span>
							</div>
							<div class="flex flex-col gap-1">
								<span
									class="text-[10px] text-discord-faint uppercase tracking-widest"
								>Discord Epoch</span>
								<span class="text-sm font-mono text-discord-muted"
								>+1420070400000ms</span>
							</div>
						</div>
					</div>
				</div>
			</article>
		</div>
	</div>
</template>
