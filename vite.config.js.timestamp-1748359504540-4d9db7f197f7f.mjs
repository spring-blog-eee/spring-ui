// vite.config.js
import { defineConfig } from "file:///C:/File/CS/VScode/Web/new-blog/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/File/CS/VScode/Web/new-blog/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import AutoImport from "file:///C:/File/CS/VScode/Web/new-blog/node_modules/unplugin-auto-import/dist/vite.js";
import Icons from "file:///C:/File/CS/VScode/Web/new-blog/node_modules/unplugin-icons/dist/vite.js";
import IconsResolver from "file:///C:/File/CS/VScode/Web/new-blog/node_modules/unplugin-icons/dist/resolver.js";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [
        // Auto import icons
        IconsResolver({
          prefix: "Icon"
        })
      ]
    }),
    Icons({
      autoInstall: true,
      compiler: "vue3"
    })
  ],
  server: {
    port: 3e3,
    proxy: {
      "/api": {
        target: "http://localhost:58080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxGaWxlXFxcXENTXFxcXFZTY29kZVxcXFxXZWJcXFxcbmV3LWJsb2dcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXEZpbGVcXFxcQ1NcXFxcVlNjb2RlXFxcXFdlYlxcXFxuZXctYmxvZ1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovRmlsZS9DUy9WU2NvZGUvV2ViL25ldy1ibG9nL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IEF1dG9JbXBvcnQgZnJvbSAndW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZSdcbmltcG9ydCBJY29ucyBmcm9tICd1bnBsdWdpbi1pY29ucy92aXRlJ1xuaW1wb3J0IEljb25zUmVzb2x2ZXIgZnJvbSAndW5wbHVnaW4taWNvbnMvcmVzb2x2ZXInXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgQXV0b0ltcG9ydCh7XG4gICAgICByZXNvbHZlcnM6IFtcbiAgICAgICAgLy8gQXV0byBpbXBvcnQgaWNvbnNcbiAgICAgICAgSWNvbnNSZXNvbHZlcih7XG4gICAgICAgICAgcHJlZml4OiAnSWNvbicsXG4gICAgICAgIH0pLFxuICAgICAgXSxcbiAgICB9KSxcbiAgICBJY29ucyh7XG4gICAgICBhdXRvSW5zdGFsbDogdHJ1ZSxcbiAgICAgIGNvbXBpbGVyOiAndnVlMycsXG4gICAgfSksXG4gIF0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgcHJveHk6IHtcbiAgICAgICcvYXBpJzoge1xuICAgICAgICB0YXJnZXQ6IFwiaHR0cDovL2xvY2FsaG9zdDo1ODA4MFwiLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJylcbiAgICAgICAgfVxuICAgIH1cbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1IsU0FBUyxvQkFBb0I7QUFDclQsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sV0FBVztBQUNsQixPQUFPLG1CQUFtQjtBQUcxQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixXQUFXO0FBQUEsTUFDVCxXQUFXO0FBQUE7QUFBQSxRQUVULGNBQWM7QUFBQSxVQUNaLFFBQVE7QUFBQSxRQUNWLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxNQUFNO0FBQUEsTUFDSixhQUFhO0FBQUEsTUFDYixVQUFVO0FBQUEsSUFDWixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLE1BQzVDO0FBQUEsSUFDSjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
