import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"
import vike from "vike/plugin"
import { pages as vikeCloudflare } from "vike-cloudflare"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "")
	return {
		plugins: [vikeCloudflare(), vike(), vue(), tailwindcss()],
		server: {
			proxy: {
				"/api/users": {
					target: env.VITE_API_BASE_URL ?? "http://localhost:8000",
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ""),
				},
			},
		},
	}
})
