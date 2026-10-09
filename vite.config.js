import { defineConfig } from 'vite';
import { resolve } from 'path';
import glob from 'fast-glob';

// Grab all HTML files inside src (including subfolders like admin)
const htmlFiles = glob.sync('./src/**/*.html');

const htmlRoutes = new Map();

htmlFiles.forEach(file => {
  const relativePath = file.replace(/^\.\/src\//, '').replace(/\\/g, '/');
  
  if (relativePath === 'index.html') {
    htmlRoutes.set('/', '/index.html');
    htmlRoutes.set('/index', '/index.html');
  } else if (relativePath === 'admin/index.html') {
    htmlRoutes.set('/admin', '/admin/index.html');
    htmlRoutes.set('/admin/', '/admin/index.html');
    htmlRoutes.set('/admin/index', '/admin/index.html');
  } else {
    const routeWithoutExt = '/' + relativePath.replace(/\.html$/, '');
    htmlRoutes.set(routeWithoutExt, '/' + relativePath);
  }
});

function cleanHtmlRoutes() {
  const rewriteCleanRoute = (req, res, next) => {
    if (!req.url) {
      next();
      return;
    }

    const requestUrl = new URL(req.url, 'http://localhost');
    let pathname = requestUrl.pathname;

    if (pathname.length > 1 && pathname.endsWith('/') && pathname !== '/admin/') {
      pathname = pathname.slice(0, -1);
    }

    if (pathname.endsWith('.html')) {
      let route;
      if (pathname === '/index.html') route = '/';
      else if (pathname === '/admin/index.html') route = '/admin/';
      else route = pathname.slice(0, -5);

      if (htmlRoutes.has(route)) {
        res.writeHead(308, { Location: `${route}${requestUrl.search}` });
        res.end();
        return;
      }
    }

    const htmlPath = htmlRoutes.get(pathname);
    if (htmlPath) {
      req.url = `${htmlPath}${requestUrl.search}`;
    }

    next();
  };

  return {
    name: 'clean-html-routes',
    configureServer(server) {
      server.middlewares.use(rewriteCleanRoute);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewriteCleanRoute);
    },
  };
}

export default defineConfig({
  base: '/',
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'public'),
  plugins: [cleanHtmlRoutes()],
  server: {
    host: true,
    port: 3000,
    open: true,
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        htmlFiles.map(file => [
          file.replace(/^\.\/src\//, '').replace(/\\/g, '/').replace(/\.html$/, ''),
          resolve(__dirname, file),
        ])
      ),
      output: {
        chunkFileNames: 'assets/js/[name].js',
        entryFileNames: 'assets/js/[name].js',
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
            return 'assets/images/[name][extname]';
          }
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name][extname]';
          }
          return 'assets/[name][extname]';
        },
      },
    },
  },
});

