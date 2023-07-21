self.addEventListener("install", (event) => {
  console.log("Hello world from the Service Worker!");
  event.waitUntil(
    self.registration.showNotification('TrackTask', {
        body: "You have enabled push notifications!",
        icon: "/tracktaskmini.png",
    })
  );
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
      icon: "/tracktaskmini.png",
    })
  );
});

self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("Something is different here...");
  /*const subscription = swRegistration.pushManager
    .subscribe(event.oldSubscription.options)
    .then((subscription) =>
      fetch("register", {
        method: "post",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      }),
    );
  event.waitUntil(subscription);*/
});