self.addEventListener("install", (event) => {
  console.log("Installing Service Worker for push notifications...");
});
  
self.addEventListener("activate", (event) => {
  console.log("Push notifications are now ready to enable!");
});

self.addEventListener("push", (event) => {
  var payload = JSON.parse(event.data);
  if (!payload) { return; }

  // Keep the service worker alive until the notification is created.
  event.waitUntil(
    self.registration.showNotification('Reminder: ' + payload.name, {
      body: `This task is due now! ${payload.description}`,
      data: {
        taskId: payload._id,
      },
      icon: "/tracktaskmini.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  const url = `https://tracktask.eu.org/tasks/${event.notification.data.taskId}`;
  event.notification.close();
  clients.matchAll({includeUncontrolled: true, type: 'window'}).then( windowClients => {
    // Check if there is already a window/tab open with the target URL
    for (var i = 0; i < windowClients.length; i++) {
      var client = windowClients[i];
      // If so, just focus it.
      if (client.url === url && 'focus' in client) {
        return client.focus();
      }
    }
    // If not, then open the target URL in a new window/tab.
    if (clients.openWindow) {
      return clients.openWindow(url);
    }
  })
});