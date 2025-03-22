self.addEventListener("install", () => {
  self.skipWaiting(); // Forces the service worker to take control immediately
});

self.addEventListener("activate", () => {
  clients.claim(); // Forces open clients (tabs) to use the new service worker
});
