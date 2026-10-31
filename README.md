# Mon plan : produits séchés / Dried-products plan

**FR** — Application web hors-ligne pour planifier des produits séchés (guide, emballage, vente).
Ouvre `index.html` via GitHub Pages. Après la première visite, ça marche sans réseau.
Sur Android (Chrome) : menu ⋮ → « Ajouter à l’écran d’accueil ».

Les données restent sur le téléphone (localStorage). Aucune donnée personnelle n’est incluse dans ce dépôt public : tu remplis ton nom et ton quartier toi-même.

**EN** — Offline web app to plan dried-food products (guide, packaging, sales).
Open via GitHub Pages. Works offline after the first visit.
On Android Chrome: menu ⋮ → “Add to Home screen”.

Data stays on the phone (localStorage). This public repo ships with empty personal fields — fill your own name and neighbourhood on your device.

## Files
- `index.html` — shell
- `app.js` / `data.js` / `styles.css` — app
- `manifest.webmanifest` + `images/icon-*.png` + `sw.js` — installable / offline
- `images/` — freely licensed photos and drawings
- `credits.json` — photo credits

## Privacy
- `<meta name="robots" content="noindex, nofollow">`
- No personal identity baked into defaults
- Autosave key: `bf-seches-app-v2` (device-only)

Do not put private contact details into this public repository.
