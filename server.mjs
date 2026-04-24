import { Hono } from "hono"
import { serveStatic } from "hono/deno"
import { renderPage } from "vike/server"

const app = new Hono()

app.use("/assets/*", serveStatic({ root: "./dist/client" }))

app.get("*", async (c) => {
	const pageContext = await renderPage({ urlOriginal: c.req.url })
	const { httpResponse } = pageContext
	if (!httpResponse) return c.notFound()
	const { body, statusCode, headers } = httpResponse
	headers.forEach(([name, value]) => c.header(name, value))
	return c.body(body, statusCode)
})

Deno.serve(app.fetch)
