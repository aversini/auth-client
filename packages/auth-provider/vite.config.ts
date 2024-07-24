import { resolve } from "node:path";
import fs from "fs-extra";
import { defineConfig } from "vite";

import { externalDependencies } from "../../configuration/vite.common";

const packageJson = fs.readJSONSync("package.json");
const copyrightYear = new Date(Date.now()).getFullYear();
const buildTime = new Date()
	.toLocaleString("en-US", {
		timeZone: "America/New_York",
		timeZoneName: "short",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	})
	.replace(/,/g, "");
const banner = `/*!
  ${packageJson.name} v${packageJson.version}
  © ${copyrightYear} gizmette.com
*/
try {
  if (!window.__VERSINI_AUTH_CLIENT__) {
    window.__VERSINI_AUTH_CLIENT__ = {
      version: "${packageJson.version}",
			buildTime: "${buildTime}",
			homepage: "${packageJson.homepage}",
			license: "${packageJson.license}",
    };
  }
} catch (error) {
  // nothing to declare officer
}
`;

export default defineConfig(() => {
	return {
		build: {
			target: "esnext",
			copyPublicDir: false,
			lib: {
				entry: resolve(__dirname, "src/components/index.ts"),
				formats: ["es"],
				name: "AuthClient",
			},
			rollupOptions: {
				input: {
					index: resolve(__dirname, "src/components/index.ts"),
				},
				treeshake: "smallest",
				external: externalDependencies,
				output: {
					compact: true,
					minifyInternalExports: false,
					assetFileNames: "style[extname]",
					entryFileNames: "[name].js",
					chunkFileNames: "chunks/[name].[hash].js",
					banner: (module) => {
						if (module?.facadeModuleId?.endsWith("src/components/index.ts")) {
							return banner;
						}
					},
				},
			},
		},
		esbuild: {
			supported: {
				"top-level-await": true,
			},
		},
		plugins: [],
	};
});
