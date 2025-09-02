const CACHE_NAME = "rpg-curso-cache-v1";
const urlsToCache = [
  "index.html",
  "manifest.json",
  "icon-192.png",
  "icon-512.png"
];

// Instala o Service Worker e adiciona arquivos no cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }).then(() => self.skipWaiting()) // ativa o SW imediatamente
  );
});

// Ativa e limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // assume controle imediato
  );
});

// Busca arquivos: offline first, atualiza cache com respostas da rede
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return; // só GET

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retorna do cache imediatamente
        // Atualiza cache em background
        fetch(event.request).then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        });
        return cachedResponse;
      }
      // Se não tem no cache, busca na rede e cacheia
      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Opcional: fallback offline, ex:
          // return caches.match('offline.html');
        });
    })
  );
});