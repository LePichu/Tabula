import { render } from "vike/abort"
import type { PageContextServer } from "vike/types"
import type { UserInfoResponse } from "../../../src/types"

export type Data = UserInfoResponse

declare const __API_BASE_URL__: string

export const data = async (pageContext: PageContextServer): Promise<Data> => {
	const { uuid } = pageContext.routeParams
	const res = await fetch(`${__API_BASE_URL__}/users/${uuid}`)
	if (res.status === 404) throw render(404, `No user found with ID ${uuid}`)
	if (!res.ok) throw render(500, `API error ${res.status}`)
	return res.json() as Promise<UserInfoResponse>
}
