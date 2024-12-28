import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import dotenv from "dotenv";


dotenv.config({ path: "../../.env" });

const args = process.argv.slice(2);
const portal = args.find(arg => arg.startsWith("portal="))?.split("=")[1];
const sourcePath = args.find(arg => arg.startsWith("source="))?.split("=")[1];


export default defineConfig({
    mode: process.env.NODE_ENV || "development",
    root: resolve(__dirname, `${sourcePath}/client`),
    plugins: [
        vue(),
        {
            name: "post-build",
            closeBundle() {
                const outputDir = resolve(__dirname, "static", portal);
                const indexPath = resolve(outputDir, "index.html");
                const ejsPath = resolve(outputDir, "index.ejs");

                let indexContent = readFileSync(indexPath, "utf-8");
                const scriptTag = "<script>window.__config__ = <%- JSON.stringify(config) %>;</script></body>";
                indexContent = indexContent.replace("</body>", scriptTag);

                writeFileSync(ejsPath, indexContent);
            },
        },
    ],
    build: {
        outDir: `../../static/${portal}`,
        emptyOutDir: true,
        rollupOptions: {
            output: {
                chunkFileNames: "js/[name].[hash].js",
                entryFileNames: "js/[name].[hash].js",
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name.endsWith(".css")) {
                        return "css/[name].[hash][extname]";
                    } else if (assetInfo.name.endsWith(".js")) {
                        return "js/[name].[hash][extname]";
                    } else {
                        return "assets/[name].[hash][extname]";
                    }
                },
            },
        },
    },
});
