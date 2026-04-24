// Auto-updating service worker
// Bei jedem Start der App wird geprüft, ob eine neue Version vorhanden ist.

const CACHE_NAME = 'vplusfast-cache';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
      ),
      self.clients.claim()
    ])
  );
});

// NETWORK FIRST: immer erst online versuchen, Cache nur offline
self.addEventListener('fetch', e => {
  if (e.request.url.includes('graph.microsoft.com') ||
      e.request.url.includes('login.microsoftonline.com') ||
      e.request.url.includes('msauth.net')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(resp => {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, respClone));
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
