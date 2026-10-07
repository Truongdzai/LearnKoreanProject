const VERSION = 'v2'
const SHELL = `vyling-shell-${VERSION}`
const ASSETS = `vyling-assets-${VERSION}`
const PAGES = `vyling-pages-${VERSION}`
const OFFLINE = '/offline.html'
const OFFLINE_JS = '/offline.js'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((c) => c.addAll([OFFLINE, OFFLINE_JS, '/icons/icon-192.png'])).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => ![SHELL, ASSETS, PAGES].includes(k)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

function isAsset(req, url) {
  if (req.destination === 'script' || req.destination === 'style' || req.destination === 'font') return true
  return req.destination === 'image' && url.origin === self.location.origin
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName)
  try {
    const res = await fetch(req)
    if (res && res.ok) cache.put(req, res.clone())
    return res
  } catch {
    // App đổi query (?tab=…) bằng pushState nên URL hiếm khi khớp nguyên văn bản đã lưu; mọi trang dùng chung
    // khung SPA nên lấy bản cùng đường dẫn, rồi tới khung '/', trước khi báo ngoại tuyến
    const hit = (await cache.match(req, { ignoreSearch: true })) || (await cache.match('/', { ignoreSearch: true, ignoreVary: true }))
    if (hit) return hit
    const shell = await caches.open(SHELL)
    return (await shell.match(OFFLINE)) || Response.error()
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName)
  const hit = (await cache.match(req)) || (await caches.match(req, { cacheName: SHELL }))
  const fresh = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone())
      return res
    })
    .catch(() => hit)
  return hit || fresh
}

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, PAGES))
    return
  }
  if (isAsset(req, url)) {
    event.respondWith(staleWhileRevalidate(req, ASSETS))
  }
})
