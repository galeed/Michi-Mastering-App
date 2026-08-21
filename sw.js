const CACHE_NAME = 'michi-mastering-app-v1';
// Lista de todos los archivos estáticos que necesita tu app para funcionar
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './icon.png',
  './manifest.json'
];

// Instala el SW y guarda los recursos en la caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Archivos guardados en caché correctamente');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Elimina cachés antiguas si cambias la versión (ej. 'michi-app-v2')
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepta peticiones: intenta red primero; si falla, sirve desde la caché
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Actualiza la caché dinámicamente con la versión más reciente
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Si no hay red, entrega el recurso desde la caché local
        return caches.match(event.request);
      })
  );
});
