// Simple Service Worker for PWA offline support
const CACHE_NAME = 'dtbtech-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/cart.html',
  '/product.html',
  '/services.html',
  '/styles.css',
  '/assets/sample1.webp',
  '/assets/sample2.webp',
  '/assets/sample3.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});
