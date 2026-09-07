import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

function supabaseConfigPlugin(): Plugin {
  return {
    name: 'supabase-config-server',
    configureServer(server) {
      server.middlewares.use('/api/save-supabase-config', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { url, anonKey } = JSON.parse(body);
              const cleanUrl = (url || '').trim();
              const cleanKey = (anonKey || '').trim();

              // 1. Write to .env
              const envContent = `# Konfigurasi Supabase Database Cloud untuk Portal Korwilcam Purwodadi\nVITE_SUPABASE_URL=${cleanUrl}\nVITE_SUPABASE_ANON_KEY=${cleanKey}\n`;
              fs.writeFileSync(path.resolve(process.cwd(), '.env'), envContent, 'utf-8');

              // 2. Write to src/config/supabaseConfig.ts
              const configContent = `// Konfigurasi Supabase Database Cloud otomatis tersimpan\nexport const SUPABASE_CONFIG = {\n  url: ${JSON.stringify(cleanUrl)},\n  anonKey: ${JSON.stringify(cleanKey)}\n};\n`;
              fs.writeFileSync(path.resolve(process.cwd(), 'src/config/supabaseConfig.ts'), configContent, 'utf-8');

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Konfigurasi berhasil disimpan ke .env dan supabaseConfig.ts!' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end();
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    supabaseConfigPlugin(),
  ],
})


