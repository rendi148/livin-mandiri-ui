const CACHE_NAME = 'livin-preview-v6';
const APP_FILES = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './favicon.svg',
  './app-icon.svg',
  './manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) return response;
          const copy = response.clone();
          return caches.open(CACHE_NAME)
            .then((cache) => cache.put('./index.html', copy))
            .then(() => response)
            .catch((error) => {
              console.error('Could not update the offline page cache:', error);
              return response;
            });
        })
        .catch(async (networkError) => {
          const offlinePage = await caches.match('./index.html');
          if (offlinePage) return offlinePage;
          throw networkError;
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, copy))
            .catch((error) => console.error('Could not cache an app asset:', error));
        }
        return response;
      });
    }),
  );
});
