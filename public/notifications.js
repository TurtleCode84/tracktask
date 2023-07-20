self.addEventListener("install", (event) => {
  console.log("Hello world from the Service Worker!");
});
  
self.addEventListener("activate", (event) => {
  console.log("I am now activated");
});

self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.text() : 'no payload';

  // Keep the service worker alive until the notification is created.
  event.waitUntil(
    self.registration.showNotification('TrackTask', {
      body: payload,
    })
  );
});