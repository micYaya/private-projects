import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  base: '/private-projects/',
  plugins: [
    vue(),
    viteCompression({
      algorithm: 'brotliCompress',  // 开启Brotli压缩，减少文件体积
      threshold: 10240, // 超过 10kB 的文件进行压缩
    }),
    visualizer({
      // 插件配置项
      open: false, // 打包完成后自动打开浏览器查看报告（开发环境建议开启，生产环境可关闭）
      filename: 'dist/stats.html', // 报告文件保存路径（默认在 dist 目录下）
      title: 'Vite Bundle Analysis',
      gzipSize: true, // 显示 Gzip 压缩后的文件大小
      brotliSize: true, // 显示 Brotli 压缩后的文件大小
      template: 'treemap', // 可视化模板，可选 'treemap'（树状图）、'sunburst'（旭日图）、'network'（网络图）
      // sourcemap: true, // 是否包含源映射（体积大时可能卡顿，可选）
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // devServer: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:3000',
  //       changeOrigin: true
  //     }
  //   }
  // },
  build: {
    minify: 'esbuild',  // 代码压缩
    esbuild: {
      drop: ['console', 'debugger'] // 更直观的语法
    },
    rollupOptions: {  // 代码分割
      // external: ['vue', 'element-plus'],
      output: {
        // globals: {
        //   vue: 'Vue',
        //   'element-plus': 'ElementPlus',
        // },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 拆分 Vue 核心库（vue、vue-router、pinia）
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vue-core';
            }
            // 拆分 Element Plus
            if (id.includes('element-plus')) {
              return 'element-plus';
            }
            // 拆分 Axios 等工具库
            if (id.includes('axios') || id.includes('lodash')) {
              return 'utils-libs';
            }
            // 其他依赖统一放入 vendor
            return 'vendor';
          }
        },
        // 分类
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
