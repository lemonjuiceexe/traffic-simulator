import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        {
            name: "reload-on-output-file-change",
            configureServer(server) {
                const { watcher, ws } = server;
                watcher.add("public/output.json");
                watcher.on("change", (file) => {
                    if (file.endsWith("output.json")) {
                        ws.send({
                            type: "full-reload",
                            path: "*"
                        });
                    }
                });
            }
        }
    ]
});
