import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function aiInstructorApiPlugin() {
  return {
    name: 'ai-instructor-api-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/instructor', async (req: any, res: any) => {
        const { handleInstructorApiRequest } = await import('./src/server/instructorApiHandler');
        await handleInstructorApiRequest(req, res);
      });
    },
    configurePreviewServer(server: any) {
      server.middlewares.use('/api/instructor', async (req: any, res: any) => {
        const { handleInstructorApiRequest } = await import('./src/server/instructorApiHandler');
        await handleInstructorApiRequest(req, res);
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), aiInstructorApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-icons': ['lucide-react'],
          'vendor-utils': ['zod', 'zustand'],
        },
      },
    },
  },
});
