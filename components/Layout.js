import Head from "next/head";
import Header from "components/Header";

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
          .container {
            max-width: 100%;
            align-self: stretch;
          }
        }
        
        @media only screen and (min-width: 600px) {
          .container {
            max-width: 65rem;
          }
        }

        .list-hover {
          transition: background 0.5s;
        }
        .list-hover:hover {
          background: #d6d6d6;
          cursor: pointer;
        }
      `}</style>
      <nav style={{backgroundColor: "orange", textAlign: "center", height:40 + "px", fontWeight: 600, marginTop: -20 + "px", paddingBottom: 5 + "px"}}><p style={{paddingTop: 13 + "px"}}>You are viewing the TrackTask Development release, some features may not work properly or may break your account.</p></nav>
      <Header />

      <main>
        <div className="container">{children}</div>
      </main>
    </>
  );
}
