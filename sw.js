const CACHE = 'mija-v2';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest'];
self.addEventListener('install', event => { self.skipWaiting(); event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))); });
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => event.respondWith(fetch(event.request).catch(() => caches.match(event.request))));
