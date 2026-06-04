// public/sw.js — Service Worker YF Contabilidade
// Estratégia: Network First para API/Supabase, Cache First para assets estáticos

const CACHE_NAME  = "yfcont-v1";
const CACHE_PAGES = "yfcont-pages-v1";

// Assets que sempre ficam em cache
const PRECACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// ─── INSTALL ─────────────────────────────────────────────────────────────────
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  // Ativa imediatamente sem esperar a aba fechar
  self.skipWaiting();
});

// ─── ACTIVATE ────────────────────────────────────────────────────────────────
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== CACHE_PAGES)
          .map(k => caches.delete(k))  // remove caches antigos
      )
    )
  );
  self.clients.claim(); // toma controle de todas as abas abertas
});

// ─── FETCH ────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Requisições Supabase → sempre rede (sem cache)
  if (url.hostname.includes("supabase.co")) {
    event.respondWith(fetch(request));
    return;
  }

  // 2. Requisições de navegação (HTML) → Network First, fallback para cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_PAGES).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // 3. Assets estáticos (JS, CSS, fontes, imagens) → Cache First
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(res => {
        if (!res || res.status !== 200 || res.type === "opaque") return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return res;
      });
    })
  );
});

// ─── MENSAGENS (controle externo) ────────────────────────────────────────────
self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ─── PUSH NOTIFICATIONS ──────────────────────────────────────────────────────
self.addEventListener("push", event => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "YF Contabilidade", {
      body:  data.body  || "Você tem uma nova atualização.",
      icon:  "/icon-192.png",
      badge: "/icon-192.png",
      data:  { url: data.url || "/" },
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(list => {
      const target = event.notification.data?.url || "/";
      const existing = list.find(c => c.url === target && "focus" in c);
      if (existing) return existing.focus();
      return clients.openWindow(target);
    })
  );
});
