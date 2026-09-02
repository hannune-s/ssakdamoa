// Dummy Service Worker to satisfy PWA installability requirements for Chrome
self.addEventListener('fetch', (event) => {
  // Just pass through all requests to avoid caching bugs, we only need this for the install prompt.
});
