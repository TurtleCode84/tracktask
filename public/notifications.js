self.addEventListener("install", (event) => {
  console.log("Installing Service Worker for push notifications...");
});
  
self.addEventListener("activate", (event) => {
  console.log("Push notifications are now ready to enable!");
  async function checkTasks() {
    const response = await fetch("/api/tasks");
    const tasks = await response.json();
    event.waitUntil(
      self.registration.showNotification('TrackTask', {
        body: `We did a thing, code ${tasks.length}`,
        icon: "/tracktaskmini.png",
      })
    );
    for (var i=0; i<tasks.length; i++) {
      if (tasks[i].dueDate > 0 && tasks[i].dueDate <= Math.floor(Date.now()/1000) && tasks[i].dueDate > Math.floor(Date.now()/1000)-60) {
        event.waitUntil(
          self.registration.showNotification('TrackTask', {
            body: "A task is due now, but we're too lazy to tell you which one. Go check TrackTask.",
            icon: "/tracktaskmini.png",
          })
        );
      }
    }
  }
  setInterval(checkTasks(), 60000);
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