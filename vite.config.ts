import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"
import vike from "vike/plugin"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "")
	return {
		plugins: [vike(), vue(), tailwindcss()],
		define: {
			__API_BASE_URL__: JSON.stringify(
				mode === "production"
					? env.API_BASE_URL
					: (env.API_BASE_URL_DEV ?? "http://localhost:8000"),
			),
		},
	}
})
