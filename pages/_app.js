import { SWRConfig } from "swr";
import fetchJson from "lib/fetchJson";
import urlBase64ToUint8Array from "lib/urlBase64ToUint8Array";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { useEffect } from "react";

function MyApp({ Component, pageProps }) {
  const vapidKey = urlBase64ToUint8Array("BCzvkm2UtPKfiL0AdAY2pCKBAIRmcnYHn9omjbufYuNf2-RxxkJD-L0fTO9w9yCwaw6kGjajItmqQaX_GillRKA");

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
    if("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/notifications.js");

      navigator.serviceWorker.ready.then(
        (registration) => {
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey,
        })
        console.log(registration);
      });
    } else {
      console.log("Service Workers are not supported");
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
