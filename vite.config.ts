import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'
import http from 'node:http'

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

function documentDownloadPlugin(): Plugin {
  return {
    name: 'document-download-server',
    configureServer(server) {
      server.middlewares.use('/api/download-document', (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
          res.statusCode = 204;
          return res.end();
        }

        const parsed = new URL(req.url || '', 'http://localhost');
        const rawUrl = (parsed.searchParams.get('url') || '').trim();
        const rawId = (parsed.searchParams.get('id') || '').trim();
        const rawFilename = (parsed.searchParams.get('filename') || '').trim();

        // Ekstraksi ID Drive
        let driveId = '';
        if (rawId && /^[a-zA-Z0-9_-]{15,}$/.test(rawId)) {
          driveId = rawId;
        } else {
          const matchFileD = (rawUrl || rawId).match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{15,})/);
          if (matchFileD && matchFileD[1]) driveId = matchFileD[1];
          else {
            const matchIdParam = (rawUrl || rawId).match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
            if (matchIdParam && matchIdParam[1]) driveId = matchIdParam[1];
            else {
              const matchLh3 = (rawUrl || rawId).match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{15,})/);
              if (matchLh3 && matchLh3[1]) driveId = matchLh3[1];
            }
          }
        }

        let targetUrl = '';
        if (driveId) {
          targetUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download`;
        } else if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
          targetUrl = rawUrl;
        } else {
          res.statusCode = 400;
          return res.end('Target berkas tidak valid');
        }

        const cleanFilename = (rawFilename || 'Dokumen_Korwilcam_Purwodadi.pdf').replace(/[/\\?%*:|"<>]/g, ' ').trim();
        const ext = cleanFilename.split('.').pop()?.toLowerCase() || 'pdf';
        const mimeTypes: Record<string, string> = {
          pdf: 'application/pdf',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          doc: 'application/msword',
          xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          xls: 'application/vnd.ms-excel',
          pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          zip: 'application/zip',
          txt: 'text/plain; charset=utf-8'
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        const encodedFilename = encodeURIComponent(cleanFilename).replace(/['()]/g, escape).replace(/\*/g, '%2A');
        const asciiFilename = cleanFilename.replace(/[^\x20-\x7E]/g, '_');

        const collectedCookies: string[] = [];

        function fetchStream(urlToFetch: string, redirects = 0) {
          if (redirects > 7) {
            res.statusCode = 502;
            return res.end('Terlalu banyak pengalihan');
          }

          let parsedFetch: URL;
          try {
            parsedFetch = new URL(urlToFetch);
          } catch {
            res.statusCode = 400;
            return res.end('URL tidak valid');
          }

          const client = parsedFetch.protocol === 'https:' ? https : http;
          const headers: Record<string, string> = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': '*/*'
          };
          if (collectedCookies.length > 0) {
            headers['Cookie'] = collectedCookies.join('; ');
          }

          const pReq = client.get(urlToFetch, { headers }, (gRes) => {
            if (gRes.headers['set-cookie']) {
              const setCookies = Array.isArray(gRes.headers['set-cookie']) ? gRes.headers['set-cookie'] : [gRes.headers['set-cookie']];
              for (const c of setCookies) {
                const part = c.split(';')[0];
                if (part && !collectedCookies.includes(part)) collectedCookies.push(part);
              }
            }

            if (gRes.statusCode && gRes.statusCode >= 300 && gRes.statusCode < 400 && gRes.headers.location) {
              gRes.resume();
              const nextUrl = new URL(gRes.headers.location, urlToFetch).toString();
              return fetchStream(nextUrl, redirects + 1);
            }

            const remoteType = (gRes.headers['content-type'] || '').toLowerCase();
            if (driveId && remoteType.includes('text/html') && redirects < 5) {
              let bodyHtml = '';
              gRes.on('data', (chunk) => { bodyHtml += chunk.toString(); });
              gRes.on('end', () => {
                const confirmMatch = bodyHtml.match(/confirm=([0-9a-zA-Z_-]+)/) || bodyHtml.match(/name="confirm"\s+value="([0-9a-zA-Z_-]+)"/);
                if (confirmMatch && confirmMatch[1]) {
                  return fetchStream(`https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=${confirmMatch[1]}`, redirects + 1);
                }
                deliver(gRes, remoteType, bodyHtml);
              });
              return;
            }

            deliver(gRes, contentType);
          });

          pReq.on('error', () => {
            if (!res.headersSent) {
              res.statusCode = 502;
              res.end('Gagal mengunduh berkas');
            }
          });
          res.on('close', () => pReq.destroy());
        }

        function deliver(remoteRes: http.IncomingMessage, ct: string, body?: string) {
          res.statusCode = 200;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', ct);
          res.setHeader('Content-Disposition', `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`);
          if (body !== undefined) return res.end(body);
          if (remoteRes.headers['content-length']) res.setHeader('Content-Length', remoteRes.headers['content-length']);
          remoteRes.pipe(res);
        }

        fetchStream(targetUrl);
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
    documentDownloadPlugin(),
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


