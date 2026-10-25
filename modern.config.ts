import { appTools, defineConfig } from '@modern-js/app-tools';
import { bffPlugin } from '@modern-js/plugin-bff';

export default defineConfig({
  plugins: [appTools(), bffPlugin()],
  server: { port: 8080, ssr: false },
  html: {
    title: 'Midterm / 26 — The balance of power',
    meta: {
      viewport: 'width=device-width, initial-scale=1',
      description:
        'A small, open election desk. Follow 2026 US midterm polls and prediction markets.',
      'theme-color': '#f6f5f0',
    },
    favicon: './public/favicon.svg',
  },
});
