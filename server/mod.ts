import { type Context, Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts"
import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts"
import { DiscordUser } from "../src/types.ts"

const env = await load()
const BOT_TOKEN = env["DISCORD_BOT_TOKEN"] ?? Deno.env.get("DISCORD_BOT_TOKEN")!

if (!BOT_TOKEN) {
	console.error("Missing DISCORD_BOT_TOKEN")
	Deno.exit(1)
}

const WINDOW_MS = 60_000
const MAX_REQUESTS = 30
const store = new Map<string, number[]>()

setInterval(() => {
	const now = Date.now()
	for (const [k, ts] of store) {
		const valid = ts.filter((t) => now - t < WINDOW_MS)
		valid.length ? store.set(k, valid) : store.delete(k)
	}
}, 5 * 60_000)

const deviceHash = async (ua: string, lang: string) => {
	const buf = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(`${ua}|${lang}`),
	)
	return [...new Uint8Array(buf)].slice(0, 8).map((b) =>
		b.toString(16).padStart(2, "0")
	).join("")
}

const clientKey = async (c: Context) => {
	const ip = c.req.header("x-forwarded-for")?.split(",")[0].trim() ??
		c.req.header("cf-connecting-ip") ??
		c.req.header("x-real-ip") ??
		"unknown"
	const hash = await deviceHash(
		c.req.header("user-agent") ?? "",
		c.req.header("accept-language") ?? "",
	)
	return `${ip}:${hash}`
}

const rateLimiter = () => async (c: Context, next: () => Promise<void>) => {
	const key = await clientKey(c)
	const now = Date.now()
	const ts = (store.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
	ts.push(now)
	store.set(key, ts)

	const remaining = Math.max(0, MAX_REQUESTS - ts.length)
	const reset = Math.ceil(now / WINDOW_MS) * WINDOW_MS

	c.header("X-RateLimit-Limit", String(MAX_REQUESTS))
	c.header("X-RateLimit-Remaining", String(remaining))
	c.header("X-RateLimit-Reset", String(Math.floor(reset / 1000)))

	if (ts.length > MAX_REQUESTS) {
		const retryAfter = Math.ceil((reset - now) / 1000)
		c.header("Retry-After", String(retryAfter))
		return c.json({ error: "Too many requests", retry_after: retryAfter }, 429)
	}

	await next()
}

class ApiError extends Error {
	constructor(public status: number, message: string) {
		super(message)
	}
}

const DISCORD_API = "https://discord.com/api/v10"

const fetchDiscordUser = async (userId: string): Promise<DiscordUser> => {
	const res = await fetch(`${DISCORD_API}/users/${userId}`, {
		headers: { Authorization: `Bot ${BOT_TOKEN}` },
	})
	if (!res.ok) {
		const body = await res.text()
		if (res.status === 404) throw new ApiError(404, `User ${userId} not found`)
		if (res.status === 401) throw new ApiError(401, "Invalid bot token")
		throw new ApiError(res.status, `Discord API error: ${body}`)
	}
	return res.json() as Promise<DiscordUser>
}

const FLAGS: [number, string][] = [
	[64, "HypeSquad Events"],
	[128, "Bug Hunter Level 1"],
	[256, "HypeSquad Bravery"],
	[512, "HypeSquad Brilliance"],
	[1024, "HypeSquad Balance"],
	[16384, "Early Supporter"],
	[131072, "Bug Hunter Level 2"],
]

const parseUserInfo = (u: DiscordUser) => {
	const createdTimestamp = Math.floor(
		(Number(BigInt(u.id) >> 22n) + 1420070400000) / 1000,
	)

	const embedColorInt = u.accent_color ??
		(u.banner_color ? parseInt(u.banner_color.replace("#", ""), 16) : 0x5865F2)

	const cdnUrl = (base: string, hash: string, size: number) =>
		`https://cdn.discordapp.com/${base}/${u.id}/${hash}.${
			hash.startsWith("a_") ? "gif" : "png"
		}?size=${size}`

	return {
		id: u.id,
		username: u.username,
		global_name: u.global_name ?? null,
		discriminator: u.discriminator === "0" ? null : u.discriminator,
		account_created_at: new Date(createdTimestamp * 1000).toISOString(),
		created_timestamp: createdTimestamp,
		avatar_url: u.avatar ? cdnUrl("avatars", u.avatar, 512) : null,
		banner_url: u.banner ? cdnUrl("banners", u.banner, 1024) : null,
		embed_color: `#${embedColorInt.toString(16).padStart(6, "0")}`,
		is_bot: u.bot ?? false,
		is_system: u.system ?? false,
		badges: FLAGS.filter(([f]) => (u.public_flags ?? 0) & f).map(([, name]) =>
			name
		),
		clan: u.clan
			? { tag: u.clan.tag, identity_guild_id: u.clan.identity_guild_id }
			: null,
	}
}

const app = new Hono()

app.onError((err, c) =>
	err instanceof ApiError
		? c.json({ error: err.message }, err.status as 400 | 401 | 403 | 404 | 500)
		: c.json({ error: "Internal server error" }, 500)
)

app.notFound((c) => c.json({ error: "Route not found" }, 404))
app.use("*", rateLimiter())

app.get("/users/:userId", async (c) => {
	const user = await fetchDiscordUser(c.req.param("userId"))
	return c.json(parseUserInfo(user))
})

const PORT = Number(env["PORT"] ?? Deno.env.get("PORT") ?? 8000)
console.log(`Listening on http://localhost:${PORT}`)
Deno.serve({ port: PORT }, app.fetch)
