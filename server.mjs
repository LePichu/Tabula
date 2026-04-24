import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { renderPage } from 'vike/server'

const app = new Hono()

app.use('/assets/*', serveStatic({ root: './dist/client' }))

app.get('*', async (c) => {
  const pageContext = await renderPage({ urlOriginal: c.req.url })
  const { httpResponse } = pageContext
  if (!httpResponse) return c.notFound()
  const { body, statusCode, headers } = httpResponse
  headers.forEach(([name, value]) => c.header(name, value))
  return c.body(body, statusCode)
})

serve({ fetch: app.fetch, port: Number(process.env.PORT) || 3000 })