const CACHE_NAME = 'cafe-menu-v1'
const STATIC_ASSETS = [
  '/',
  '/menu/premium-cafe',
  '/manifest.json',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip API requests and admin routes
  const url = new URL(event.request.url)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin/')) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if available
      if (cachedResponse) {
        // Fetch and update cache in background
        fetchAndCache(event.request)
        return cachedResponse
      }

      // Otherwise fetch from network
      return fetchAndCache(event.request)
    })
  )
})

// Helper to fetch and cache
async function fetchAndCache(request) {
  try {
    const response = await fetch(request)
    
    // Only cache successful responses
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // If network fails and no cache, return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/')
    }
    throw error
  }
}

// Handle push notifications (future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
    })
  }
})
