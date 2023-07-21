import { SWRConfig } from "swr";
import fetchJson from "lib/fetchJson";
import urlBase64ToUint8Array from "lib/urlBase64ToUint8Array";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  const vapidKey = urlBase64ToUint8Array("BA8NKRSdID4uU7rW-ALT2emBCdhnopbkOig-HI9wUjKcHTIWnmCcpVfpPdhV-P576TaV3rLZ_35IJF2iV29E9mM");

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme) {
      document.documentElement.setAttribute("data-theme", currentTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
  }, [])

  useEffect(() => {
    const pushNotifications = localStorage.getItem("notifications");
    if (pushNotifications && pushNotifications === "enabled") {
      if("serviceWorker" in navigator) {
        // In the future, request notification permission as well!
        navigator.serviceWorker.register("/notifications.js");

        navigator.serviceWorker.ready.then(
          (registration) => {
          registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidKey,
          }).then((pushSubscription) => {
            console.log(
              'Received PushSubscription: ',
              JSON.stringify(pushSubscription),
            )
          });
        });
      } else {
        console.log("Service Workers are not supported");
      }
    } else if (!pushNotifications) {
      localStorage.setItem("pushNotifications", "disabled");
    }
  }, [])

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey="6LdBzhUiAAAAAGnjMtWaqrFmFAG6gE_yM_LQq_tZ"
      scriptProps={{
        async: false,
        defer: false,
        appendTo: "head",
        nonce: undefined,
      }}
    >
    <SWRConfig
      value={{
        fetcher: fetchJson,
        onError: (err) => {
          console.error(err);
        },
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
    </GoogleReCaptchaProvider>
  );
}

export default MyApp;
