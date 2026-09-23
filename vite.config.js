import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        try {
          const parsedUrl = new URL(req.url, 'http://localhost');
          const routeName = parsedUrl.pathname.replace(/^\/api\//, '').split('/')[0];
          const modulePath = `./api/${routeName}.js`;

          // Buffer request body if present
          let body = '';
          for await (const chunk of req) {
            body += chunk;
          }
          req.body = body;
          req.query = Object.fromEntries(parsedUrl.searchParams.entries());

          // Attach response helpers like in serverless environment
          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };

          const mod = await server.ssrLoadModule(modulePath);
          const handler = mod.default;
          if (typeof handler === 'function') {
            await handler(req, res);
          } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Not found: ${req.url}` }));
          }
        } catch (err) {
          console.error('Local API dev server error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env so that Prisma client in ./api/_lib/prisma.js sees DATABASE_URL
  Object.assign(process.env, env);

  return {
    plugins: [react(), apiDevPlugin()],
    server: {
      port: 5173,
      host: true,
    },
  };
});
