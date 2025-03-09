import { SWRConfig } from "swr";
import fetchJson from "lib/fetchJson";
import urlBase64ToUint8Array from "lib/urlBase64ToUint8Array";
import { useEffect } from "react";
import ErrorBoundary from "components/ErrorBoundary";
import { Roboto_Flex } from "next/font/google"; // Exo_2

const font = Roboto_Flex({
  subsets: ['latin'],
  display: 'swap',
});

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme) {
      document.documentElement.setAttribute("data-theme", currentTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
  }, []);

  useEffect(() => {
    const vapidKey = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_NOTIFICATIONS_PUBLIC_KEY);
    const pushNotifications = localStorage.getItem("notifications");
    if (pushNotifications === "enable") {
      if ("serviceWorker" in navigator && "Notification" in window) {
        
        if (Notification.permission !== "denied") {
          // We need to ask the user for permission
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              navigator.serviceWorker.register("/notifications.js");

              navigator.serviceWorker.ready.then(
                (registration) => {
                registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: vapidKey,
                }).then((pushSubscription) => {
                  //console.log("Received PushSubscription: ", JSON.stringify(pushSubscription));
                  fetch("/api/notifications", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      subscription: pushSubscription,
                    }),
                  });
                }).then((res) => {
                  registration.showNotification('TrackTask', {
                    body: "You have enabled push notifications!",
                    icon: "/tracktaskmini.png",
                  });
                  localStorage.setItem("notifications", "enabled");
                });
              });
            } else {
              localStorage.setItem("notifications", "disabled");
              alert("Please allow notifications from this site to enable push notifcations.");
            }
          });
        } else {
          localStorage.setItem("notifications", "disabled");
          alert("Please allow notifications from this site to enable push notifcations.");
        }
      } else {
        localStorage.setItem("notifications", "disabled");
        alert("Push notifications are not supported by your browser, so they could not be enabled.");
      }
    } else if (pushNotifications === "disable") {
      fetch("/api/notifications", {
        method: "DELETE",
      });
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister();
        }
      });
      localStorage.setItem("notifications", "disabled");
      setTimeout(() => {window.location.reload();}, 500);
    } else if (!pushNotifications) {
      localStorage.setItem("notifications", "disabled");
    }
  }, []);

  return (
    <SWRConfig
      value={{
        fetcher: fetchJson,
        onError: (err) => {
          console.error(err);
        },
      }}
    >
      <style jsx global>{`
        html {
          font-family: ${font.style.fontFamily}, sans-serif;
        }
      `}</style>
      <ErrorBoundary>
      <Component {...pageProps} />
      </ErrorBoundary>
    </SWRConfig>
  );
}

export default MyApp;
