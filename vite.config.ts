import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"
import vike from "vike/plugin"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "")
	return {
		plugins: [vike(), vue(), tailwindcss()],
		server: {
			proxy: {
				"/api/users": {
					target: env.VITE_API_BASE_URL ?? "https://tabula.lepichu.deno.net",
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ""),
				},
			},
		},
	}
})
