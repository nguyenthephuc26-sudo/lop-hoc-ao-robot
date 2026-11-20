/* Service worker: lưu bản sao trang vào máy để mở lại được cả khi mất mạng.
   Có mạng thì lấy bản mới nhất, mất mạng thì dùng bản đã lưu. Đổi VERSION khi muốn xóa bản cũ. */
const VERSION = 'lop-hoc-ao-v6';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r;
  }).catch(() => caches.match(e.request, {ignoreSearch: true})));
});
