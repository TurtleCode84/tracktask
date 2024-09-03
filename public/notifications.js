self.addEventListener("install", (event) => {
  console.log("Installing Service Worker for push notifications...");
});
  
self.addEventListener("activate", (event) => {
  console.log("Push notifications are now ready to enable!");
});

self.addEventListener("push", (event) => {
  var payload = event.data.json();
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
  console.log(`Received push notification: ${payload}`);
});

self.addEventListener("notificationclick", (event) => {
  const url = `https://tracktask.eu.org/tasks/${event.notification.data.taskId}`;
  event.notification.close();
  event.waitUntil(
    clients.openWindow(url)
  );
});