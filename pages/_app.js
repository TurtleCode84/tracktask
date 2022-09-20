import { SWRConfig } from "swr";
import fetchJson from "lib/fetchJson";

function MyApp({ Component, pageProps }) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey="6LdsxRUiAAAAAHKyiqb10cDdj_kWEWQkgpatCWPX"
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
