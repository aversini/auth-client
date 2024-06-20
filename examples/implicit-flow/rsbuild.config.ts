import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
	source: {
		entry: {
			index: "./src/index.tsx",
		},
	},
	output: {
		polyfill: "off",
		distPath: {
			root: "./dist",
		},
	},
	html: {
		template: "./index.html",
	},
	server: {
		host: "macmini.gizmette.local.com",
		port: 5173,
		https: {
			key: process.env.SSL_KEY,
			cert: process.env.SSL_CERT,
		},
	},
	plugins: [pluginReact()],
});
