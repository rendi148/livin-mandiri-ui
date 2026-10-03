# Livin' Dashboard Preview

Responsive static UI prototype with search, category filtering, device-saved shortcut preferences, expandable transaction history, and installable/offline support on compatible browsers. No build tools, package installation, database, or server-side runtime are required.

## Test locally

Open `index.html` in a modern browser. No package installation is needed.

## Upload to static hosting

Upload these files together into the hosting document root (often named `public_html`, `www`, or `site`):

- `index.html`
- `styles.css`
- `script.js`
- `favicon.svg`
- `app-icon.svg`
- `manifest.webmanifest`
- `service-worker.js`

The page uses relative asset paths and can also be deployed under a subdirectory. Enable HTTPS on the hosting provider.

For GitHub Pages, publish the `main` branch from the repository root. The same static files can also be copied to another HTTPS static host.

## Install and offline mode

On supported browsers, use the install button when it appears, or choose “Add to Home Screen” from the browser menu. The service worker caches the app shell so it can reopen offline after the first successful online visit. Changes to the shell update the service worker cache version in `service-worker.js`.

## Prototype limitations

All account details, balance, promotions, and transaction records are sample content. Buttons provide local preview interactions only; this page does not connect to Bank Mandiri, authenticate users, or process transactions. Do not enter real banking information.
