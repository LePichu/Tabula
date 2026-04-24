import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"
import vike from "vike/plugin"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "")
	const apiBaseUrl = mode === "production"
		? env.API_BASE_URL
		: (env.API_BASE_URL_DEV ?? "http://localhost:8000")

	if (mode === "production" && !apiBaseUrl) {
		throw new Error("API_BASE_URL is not set — aborting production build")
	}

	return {
		plugins: [vike(), vue(), tailwindcss()],
		define: {
			__API_BASE_URL__: JSON.stringify(apiBaseUrl),
		},
	}
})
