import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: 'src',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        "stage-select": resolve(__dirname, "src/pages/stage-select.html"),
        game: resolve(__dirname, "src/pages/game.html"),
      },
    },
  },
});
