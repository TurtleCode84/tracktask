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
          max-width: 65rem;
          margin: 1.5rem auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }

        .list {
          margin: "0.5em";
          padding: "5px 5px 5px 5px";
          border: "5px ridge rgb(0, 0, 0)";
          border-radius: "10px";
          width: "auto";
          transition: background 1s;
        }
        .list:hover {
          background: #9c9c9c;
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
