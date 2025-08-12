import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

// https://vite.dev/config/
export default defineConfig({
	base: "",
	plugins: [solid(), tailwindcss()],
	build: {
		target: "esnext",
		outDir: "../memword-server/html",
		emptyOutDir: true,
		assetsDir: "assets",
		rollupOptions: {
			input: ["/index.html", "/admin.html"],
		},
	},
});
