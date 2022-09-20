import { SWRConfig } from "swr";
import fetchJson from "lib/fetchJson";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

function MyApp({ Component, pageProps }) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey="6LdBzhUiAAAAABYm5986fFShQLFHVg7vQglOoPH5"
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
