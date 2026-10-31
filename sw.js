/* Service worker — cache-first, versioned. Never touches localStorage. */
const CACHE = 'olga-plan-v1';
const ASSETS = ["./index.html", "./styles.css", "./app.js", "./data.js", "./manifest.webmanifest", "./credits.json", "./images/crop_ananas.svg", "./images/crop_ananas.webp", "./images/crop_arachide.webp", "./images/crop_banane.webp", "./images/crop_baobab.webp", "./images/crop_bissap.svg", "./images/crop_bissap.webp", "./images/crop_cajou.svg", "./images/crop_cajou.webp", "./images/crop_citron.svg", "./images/crop_citron.webp", "./images/crop_fonio.webp", "./images/crop_gingembre.svg", "./images/crop_gingembre.webp", "./images/crop_gombo.webp", "./images/crop_goyave.webp", "./images/crop_hibiscus.svg", "./images/crop_hibiscus.webp", "./images/crop_mais.webp", "./images/crop_mangue.svg", "./images/crop_mangue.webp", "./images/crop_menthe.webp", "./images/crop_moringa.webp", "./images/crop_oignon.webp", "./images/crop_papaye.webp", "./images/crop_piment.webp", "./images/crop_tamarin.webp", "./images/crop_tomate.webp", "./images/draw_boissons.svg", "./images/draw_cereales.svg", "./images/draw_crop.svg", "./images/draw_epices.svg", "./images/draw_feuilles.svg", "./images/draw_fruits.svg", "./images/draw_legumes.svg", "./images/draw_legumineuses.svg", "./images/draw_pfnl.svg", "./images/draw_tubercules.svg", "./images/emballer_bande.webp", "./images/emballer_vide.webp", "./images/icon-192.png", "./images/icon-512.png", "./images/preparer_balance.webp", "./images/preparer_coupe.webp", "./images/secher_armoire.webp", "./images/secher_nesco.webp", "./images/secher_passif.webp", "./images/secher_solaire.webp", "./images/secher_solaire2.webp", "./images/secher_tranches.webp", "./images/transformer_broyeur.webp", "./images/transformer_moulin.webp", "./images/transformer_tamis.webp"];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Never intercept non-http(s) or cross-origin unrelated
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((resp) => {
        if (!resp || resp.status !== 200 || resp.type === 'opaque') return resp;
        const copy = resp.clone();
        caches.open(CACHE).then((c) => { try { c.put(e.request, copy); } catch (_) {} });
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
