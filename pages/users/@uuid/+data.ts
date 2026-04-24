import { render } from "vike/abort"
import type { PageContextServer } from "vike/types"

export interface Clan {
	tag: string
	identity_guild_id: string
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
	clan: Clan | null
	server_id?: string
}

export type Data = UserInfoResponse

export const data = async (pageContext: PageContextServer): Promise<Data> => {
	const { uuid } = pageContext.routeParams
	const base = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"

	console.log(`[+data] Fetching ${base}/users/${uuid}`)

	const res = await fetch(`${base}/users/${uuid}`)

	if (res.status === 404) throw render(404, `No user found with ID ${uuid}`)
	if (!res.ok) throw render(500, `API error ${res.status}`)

	return res.json() as Promise<UserInfoResponse>
}
