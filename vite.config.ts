import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'

function videoStreamPlugin(): Plugin {
  return {
    name: 'video-stream-server',
    configureServer(server) {
      server.middlewares.use('/api/video-stream', (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
          res.statusCode = 204;
          return res.end();
        }

        const parsed = new URL(req.url || '', 'http://localhost');
        const fileId = (parsed.searchParams.get('id') || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');

        if (!fileId || fileId.length < 15) {
          res.statusCode = 400;
          return res.end('Invalid id');
        }

        const range = req.headers['range'] || '';
        const driveUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;

        function fetchFromGoogle(targetUrl: string, redirects = 0) {
          if (redirects > 5) {
            res.statusCode = 502;
            return res.end('Too many redirects');
          }

          const headers: Record<string, string> = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*'
          };
          if (range) headers['Range'] = range;

          const pReq = https.get(targetUrl, { headers }, (gRes) => {
            if (gRes.statusCode && gRes.statusCode >= 300 && gRes.statusCode < 400 && gRes.headers.location) {
              gRes.resume();
              return fetchFromGoogle(gRes.headers.location, redirects + 1);
            }

            res.statusCode = gRes.statusCode || 200;
            res.setHeader('Content-Type', gRes.headers['content-type'] || 'video/mp4');
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');

            if (gRes.headers['content-length']) res.setHeader('Content-Length', gRes.headers['content-length']);
            if (gRes.headers['content-range']) res.setHeader('Content-Range', gRes.headers['content-range']);

            if (req.method === 'HEAD') {
              gRes.resume();
              return res.end();
            }

            gRes.pipe(res);
            res.on('close', () => {
              gRes.destroy();
              pReq.destroy();
            });
          });

          pReq.on('error', () => {
            if (!res.headersSent) {
              res.statusCode = 502;
              res.end('Failed to stream video');
            }
          });
          res.on('close', () => pReq.destroy());
        }

        fetchFromGoogle(driveUrl);
      });
    }
  };
}

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
    videoStreamPlugin(),
  ],
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'no-referrer-when-downgrade',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    },
  },
  preview: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'no-referrer-when-downgrade',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/');
          if (normalized.includes('/src/data/initialData')) {
            return 'initial-data';
          }
          if (normalized.includes('node_modules')) {
            if (normalized.includes('/react/') || normalized.includes('/react-dom/') || normalized.includes('/scheduler/')) {
              return 'vendor-react';
            }
            if (normalized.includes('/@supabase/')) {
              return 'vendor-supabase';
            }
            if (normalized.includes('/lucide-react/')) {
              return 'vendor-icons';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})


