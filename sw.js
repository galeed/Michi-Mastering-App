/* ==========================================================================
   SERVICE WORKER - MICHI MASTERING APP
   ========================================================================== */

/* MODIFICAR AQUÍ: Identificador de la caché y versión de la app */
const CACHE_NAME = 'michi-mastering-app-v1';

/* MODIFICAR AQUÍ: Lista exacta de todos los archivos que requiere esta app para sonar/funcionar offline */
const ARCHIVOS_A_GUARDAR = [
  './',                  // Raíz de la app
  './index.html',        // Interfaz de usuario
  './style.css',         // Estilos de la app
  './app.js',            // Lógica de procesamiento de audio / JS
  './manifest.json',     // Configuración PWA
  './icon.png'           // Icono principal
];

/* --------------------------------------------------------------------------
   LÓGICA AUTOMÁTICA CACHE-FIRST (NO REQUIERE CAMBIOS)
   -------------------------------------------------------------------------- */

// 1. Guardar recursos al instalar
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARCHIVOS_A_GUARDAR);
    })
  );
  self.skipWaiting();
});

// 2. Limpiar cachés viejas al cambiar versión (ej. de 'v1' a 'v2')
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

// 3. Servir desde la caché primero (Cache-First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
