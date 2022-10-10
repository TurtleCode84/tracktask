import Head from "next/head";
import Header from "components/Header";
import Link from "next/link";

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <title>TrackTask - Shareable Task Management</title>
      </Head>
      <style jsx global>{`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          color: #333;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", Arial, Noto Sans, sans-serif, "Apple Color Emoji",
            "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        }
        
        .container {
          margin: 1.5rem auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        
        @media only screen and (max-width: 600px) {
          body {
            display: flex;
            overflow: auto;
          }
          .container {
            max-width: 100%;
          }
        }
        
        @media only screen and (min-width: 600px) {
          .container {
            max-width: 65rem;
          }
        }

        .list-hover {
          transition: filter 0.3s;
        }
        .list-hover:hover {
          filter: brightness(0.9);
          cursor: pointer;
        }
      `}</style>
      {process.env.VERCEL_ENV !== "production" && <nav style={{backgroundColor: "orange", textAlign: "center", height:40 + "px", fontWeight: 600, marginTop: -20 + "px", paddingBottom: 5 + "px", minHeight: "min-content"}}><p style={{paddingTop: 13 + "px"}}>You are viewing a TrackTask Development release, some features may not work properly or may break your account.</p></nav>}
      <Header />

      <main>
        <div className="container">{children}</div>
      </main>

      <br/><span style={{ color: "gray", display: "table", margin: 0 + " auto" }}>Copyright &#169; 2022 TrackTask STM, All Rights Reserved - <Link href="/privacy" style={{ color: "gray" }}>Privacy</Link> - <Link href="/terms" style={{ color: "gray" }}>Terms of Use</Link></span>
    </>
  );
}
