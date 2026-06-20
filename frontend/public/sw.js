const CACHE = 'organizador-v1'

const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
]

const VIBRATE = {
  '24h': [80, 40, 80],
  '12h': [120, 60, 120],
  '3h': [200, 80, 200, 80, 200],
  'overdue': [300, 100, 300],
}

function getVibrate(milestone) {
  return VIBRATE[milestone] || []
}

function getActions(taskId) {
  if (taskId) {
    return [
      { action: 'complete', title: 'Concluir' },
      { action: 'snooze', title: 'Adiar' },
    ]
  }
  return [
    { action: 'view', title: 'Ver' },
  ]
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) return
  if (!event.request.url.startsWith(self.location.origin)) return
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(res => {
        if (res.ok && res.type === 'basic') {
          const clone = res.clone()
          caches.open(CACHE).then(cache => cache.put(event.request, clone))
        }
        return res
      }).catch(() => cached)
      return cached || fetchPromise
    })
  )
})

self.addEventListener('push', event => {
  if (!event.data) return
  try {
    const data = event.data.json()
    const milestone = data.data?.milestone || '24h'
    const taskId = data.data?.taskId || null

    const opts = {
      body: data.body || '',
      icon: '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
      tag: data.tag || 'task-reminder',
      renotify: false,
      vibrate: getVibrate(milestone),
      actions: getActions(taskId),
      data: {
        taskId,
        milestone,
        url: data.data?.url || '/',
      },
    }
    event.waitUntil(self.registration.showNotification(data.title || 'organizador', opts))
  } catch {
    const opts = {
      body: event.data.text(),
      icon: '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
    }
    event.waitUntil(self.registration.showNotification('organizador', opts))
  }
})

self.addEventListener('notificationclick', event => {
  const notification = event.notification
  notification.close()

  const action = event.action
  const taskId = notification.data?.taskId
  const url = notification.data?.url || '/'

  if (action === 'complete' && taskId) {
    event.waitUntil(
      fetch(`/api/tarefas/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ concluida: 1 }),
      }).then(res => {
        if (res.ok) {
          return self.registration.showNotification('Concluída', {
            body: 'Tarefa marcada como concluída',
            icon: '/icons/icon-192.svg',
            tag: 'task-complete-confirm',
          })
        }
      }).catch(() => {})
    )
    return
  }

  if (action === 'snooze' && taskId) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            client.navigate(`/?editTask=${taskId}`)
            return client.focus()
          }
        }
        return clients.openWindow(`/?editTask=${taskId}`)
      })
    )
    return
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
