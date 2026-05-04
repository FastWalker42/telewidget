import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	plugins: [tailwindcss(), preact()],
	build: {
		target: 'es2020',
	},
	server: {
		host: '127.0.0.1',
	},
})
