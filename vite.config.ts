
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Only pass non-sensitive variables to the client side.
    // Hostinger passwords should NEVER be stringified here if they were meant for client use,
    // but we use them only in the Vercel /api route which doesn't use this bundle.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ""),
    'process.env.ADMIN_EMAIL': JSON.stringify(process.env.ADMIN_EMAIL || ""),
    'process.env.EMAIL_USER': JSON.stringify(process.env.EMAIL_USER || ""),
  },
  server: {
    host: true,
    port: 3000,
  },
});
