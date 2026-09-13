/// <reference types='vitest' />
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite';
// noinspection ES6PreferShortImport
import { appShellCss, appShellHtml, colorSchemeScript } from './src/styles/appShell';

const DISPLAY_FONT_FILE = /source-serif-4-latin-wght-normal.*\.woff2$/;

/** Paints the banner from index.html before the bundle runs and preloads the title font. */
const appShell = (): Plugin => ({
  name: 'spark:app-shell',
  transformIndexHtml: {
    order: 'post',
    handler: (html, ctx) => {
      const fontFile = Object.keys(ctx.bundle ?? {}).find((file) => DISPLAY_FONT_FILE.test(file));
      const tags: HtmlTagDescriptor[] = [
        { tag: 'script', children: colorSchemeScript, injectTo: 'head-prepend' },
        { tag: 'style', children: appShellCss, injectTo: 'head-prepend' },
      ];
      if (fontFile) {
        tags.push({
          tag: 'link',
          attrs: {
            rel: 'preload',
            href: `/${fontFile}`,
            as: 'font',
            type: 'font/woff2',
            crossorigin: true,
          },
          injectTo: 'head',
        });
      }
      return {
        html: html.replace('<div id="root"></div>', `<div id="root">${appShellHtml}</div>`),
        tags,
      };
    },
  },
});

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/spark',
  server: {
    port: 4301,
    host: 'localhost',
    // No local PHP: set SPARK_API_ORIGIN=https://spark.yukunxu.com to proxy /api to the deployed API.
    proxy: process.env.SPARK_API_ORIGIN
      ? { '/api': { target: process.env.SPARK_API_ORIGIN, changeOrigin: true } }
      : undefined,
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  plugins: [react(), appShell()],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    name: 'spark',
    watch: false,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/testSetup.ts'],
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: './test-output/vitest/coverage',
      provider: 'v8' as const,
    },
  },
}));