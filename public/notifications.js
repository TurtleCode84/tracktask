self.addEventListener("install", (event) => {
  console.log("Installing Service Worker for push notifications...");
});
  
self.addEventListener("activate", (event) => {
  console.log("Push notifications are now ready to enable!");
});

self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.text() : 'no payload';

  // Keep the service worker alive until the notification is created.
  event.waitUntil(
    self.registration.showNotification('TrackTask', {
      body: payload,
      icon: "/tracktaskmini.png",
    })
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("Something is different here...");
  /*const subscription = swRegistration.pushManager
    .subscribe(event.oldSubscription.options)
    .then((subscription) =>
      fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          subscription: subscription,
        }),
      }),
    );
  event.waitUntil(subscription);*/
});