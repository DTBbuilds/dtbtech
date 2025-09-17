/**
 * Modern Service Worker for DTB Technologies
 * Implements aggressive caching strategies for optimal performance
 */

// const CACHE_NAME = 'dtb-tech-v1.0.0';
const STATIC_CACHE = 'dtb-static-v1.0.0';
const DYNAMIC_CACHE = 'dtb-dynamic-v1.0.0';
const IMAGE_CACHE = 'dtb-images-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/services.html',
  '/contact.html',
  '/tech-lab.html',
  '/dist/output.css',
  '/src/js/performance/lazy-loading.js',
  '/src/js/performance/animation-optimizer.js',
  '/src/js/performance/web-vitals.js',
  '/src/css/mobile-optimized.css',
  '/assets/dtb-logo.png',
  '/assets/images/default-logo.svg',
];

// Network-first resources (always try network first)
const NETWORK_FIRST = ['/api/', '/dashboard/', '/auth/'];

// Cache-first resources (serve from cache if available)
const CACHE_FIRST = [
  '/assets/',
  '/dist/',
  '.css',
  '.js',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.webp',
  '.avif',
];

self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),

      // Skip waiting to activate immediately
      self.skipWaiting(),
    ])
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== IMAGE_CACHE
            ) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),

      // Take control of all pages
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Network-first strategy for dynamic content
    if (NETWORK_FIRST.some(pattern => pathname.includes(pattern))) {
      return await networkFirst(request);
    }

    // Cache-first strategy for static assets
    if (
      CACHE_FIRST.some(
        pattern => pathname.includes(pattern) || pathname.endsWith(pattern)
      )
    ) {
      return await cacheFirst(request);
    }

    // Stale-while-revalidate for HTML pages
    if (
      pathname.endsWith('.html') ||
      pathname === '/' ||
      !pathname.includes('.')
    ) {
      return await staleWhileRevalidate(request);
    }

    // Default to network-first
    return await networkFirst(request);
  } catch (error) {
    console.error('Service Worker: Request failed:', error);
    return await handleOffline(request);
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Update cache in background for images and assets
    if (isImageRequest(request) || isAssetRequest(request)) {
      updateCacheInBackground(request);
    }
    return cachedResponse;
  }

  // Not in cache, fetch from network
  const networkResponse = await fetch(request);

  if (networkResponse.ok) {
    const cacheName = isImageRequest(request) ? IMAGE_CACHE : STATIC_CACHE;
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);

  // Always try to update from network in background
  const networkPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        const cache = caches.open(DYNAMIC_CACHE);
        cache.then(c => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => null);

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // Wait for network if no cache
  return (await networkPromise) || handleOffline(request);
}

async function updateCacheInBackground(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cacheName = isImageRequest(request) ? IMAGE_CACHE : STATIC_CACHE;
      const cache = await caches.open(cacheName);
      cache.put(request, response);
    }
  } catch (error) {
    // Silent fail for background updates
    console.log('Background cache update failed:', error);
  }
}

async function handleOffline(request) {
  // const url = new URL(request.url);

  // Return offline page for HTML requests
  if (request.headers.get('accept')?.includes('text/html')) {
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }

    // Fallback offline response
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>DTB Technologies - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              text-align: center; 
              padding: 2rem;
              background: #0f172a;
              color: #e2e8f0;
            }
            .container { max-width: 400px; margin: 0 auto; }
            .logo { font-size: 2rem; font-weight: bold; margin-bottom: 1rem; }
            .message { margin-bottom: 2rem; }
            .retry-btn { 
              background: #3b82f6; 
              color: white; 
              border: none; 
              padding: 0.75rem 1.5rem; 
              border-radius: 0.5rem; 
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">DTB Technologies</div>
            <div class="message">
              <h1>You're offline</h1>
              <p>Please check your internet connection and try again.</p>
            </div>
            <button class="retry-btn" onclick="location.reload()">Retry</button>
          </div>
        </body>
      </html>
    `,
      {
        headers: { 'Content-Type': 'text/html' },
        status: 200,
      }
    );
  }

  // Return placeholder for images
  if (isImageRequest(request)) {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#e2e8f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#64748b">Image unavailable</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }

  return new Response('Network error', { status: 408 });
}

function isImageRequest(request) {
  return (
    request.headers.get('accept')?.includes('image/') ||
    /\.(png|jpg|jpeg|gif|webp|avif|svg)$/i.test(new URL(request.url).pathname)
  );
}

function isAssetRequest(request) {
  return /\.(css|js|woff|woff2|ttf|eot)$/i.test(new URL(request.url).pathname);
}

// Background sync for analytics and form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }

  if (event.tag === 'form-sync') {
    event.waitUntil(syncFormSubmissions());
  }
});

async function syncAnalytics() {
  // Sync queued analytics data when back online
  try {
    const cache = await caches.open('analytics-queue');
    const requests = await cache.keys();

    for (const request of requests) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.log('Analytics sync failed:', error);
      }
    }
  } catch (error) {
    console.log('Analytics sync error:', error);
  }
}

async function syncFormSubmissions() {
  // Sync queued form submissions when back online
  try {
    const cache = await caches.open('form-queue');
    const requests = await cache.keys();

    for (const request of requests) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.log('Form sync failed:', error);
      }
    }
  } catch (error) {
    console.log('Form sync error:', error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();

    event.waitUntil(
      self.registration.showNotification(data.title || 'DTB Technologies', {
        body: data.body || 'New update available',
        icon: '/assets/dtb-logo.png',
        badge: '/assets/images/default-logo.svg',
        tag: data.tag || 'default',
        requireInteraction: data.requireInteraction || false,
        actions: data.actions || [],
      })
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data?.url || '/'));
});

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => {
      event.ports[0].postMessage({ cacheSize: size });
    });
  }
});

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return Math.round((totalSize / 1024 / 1024) * 100) / 100; // MB
}
