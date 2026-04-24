export interface DiscordUser {
	id: string
	username: string
	discriminator: string
	global_name: string | null
	avatar: string | null
	banner: string | null
	accent_color: number | null
	banner_color: string | null
	bot?: boolean
	system?: boolean
	public_flags: number
	clan?: { tag: string; identity_guild_id: string } | null
}

export interface UserInfoResponse {
	id: string
	username: string
	global_name: string | null
	discriminator: string | null
	account_created_at: string
	created_timestamp: number
	avatar_url: string | null
	banner_url: string | null
	embed_color: string
	is_bot: boolean
	is_system: boolean
	badges: string[]
	clan: { tag: string; identity_guild_id: string } | null
}
