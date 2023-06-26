import Head from "next/head";
import Header from "components/Header";
import Link from "next/link";

export default function Layout({ children }) {
  var advisory = process.env.NEXT_PUBLIC_ADVISORY;
  var advisoryColor = "#006dbe";
  if (advisory?.split(',')[0] !== "default") {
    advisoryColor = advisory?.split(',')[0];
  }
  return (
    <>
      <Head>
        <title>TrackTask - Shareable Task Management</title>
        <meta name="title" content="TrackTask - Shareable Task Management" />
        <meta name="description" content="Create, share, and keep track of tasks in a collaboratively organized way." />
        <meta name="image" content="https://tracktask.eu.org/tracktaskmini.png" />
        <meta name="author" content="TurtleCode84" />
        <meta property="og:title" content="TrackTask - Shareable Task Management" />
        <meta property="og:description" content="Create, share, and keep track of tasks in a collaboratively organized way." />
        <meta property="og:image" content="https://tracktask.eu.org/tracktaskmini.png" />
        <meta name="twitter:title" content="TrackTask - Shareable Task Management" />
        <meta name="twitter:description" content="Create, share, and keep track of tasks in a collaboratively organized way." />
        <meta name="twitter:image" content="https://tracktask.eu.org/tracktaskmini.png" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
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

        button {
          background: #f8f8f8;
          color: #333;
          font-weight: 550;
          padding: 5px;
          border-width: 1px;
          border-style: solid;
          border-color: darkgray;
          border-radius: 5px;
          width: auto;
          transition: filter 0.3s;
        }
        
        button:hover {
          filter: brightness(0.9);
          cursor: pointer;
        }
        
        button:active {
          background: #ffffff;
        }
        
        button:disabled {
          filter: brightness(0.95) !important;
          cursor: wait !important;
          color: #757575;
        }

        textarea {
          resize: none;
          font-family: inherit;
          font-size: 15px;
          letter-spacing: 0.1px;
        }

        input, select {
          font-family: inherit;
        }

        summary {
          user-select: none;
        }

        summary:hover {
          cursor: pointer;
        }

        form > hr {
          visibility: hidden;
        }

        .list-hover {
          transition: filter 0.3s;
        }

        .list-hover:hover {
          filter: brightness(0.9);
          cursor: pointer;
        }

        a, a:visited {
          color: midnightblue;
        }
        
        a.footer {
          color: gray;
        }

        a.footer:visited {
          color: gray;
        }
        
        .material-symbols-outlined {
          display: inline-block;
          vertical-align: -5px;
          font-size: inherit;
          font-variation-settings:
            'FILL' 1,
            'wght' 550,
            'GRAD' 0,
            'opsz' 48
        }

        .icon-list {
          font-size: 18px;
          vertical-align: -3px !important;
        }

        .success {
          color: darkgreen;
          margin: 1rem 0 0;
        }

        .error {
          color: brown;
          margin: 1rem 0 0;
        }

        @media (prefers-color-scheme: dark) {
          body {
            color: #fff;
            background-color: #121212;
          }
          header {
            background-color: #1b2129 !important;
          }
          .list-hover, .report-li {
            background-color: #111 !important;
            border-color: #333 !important;
          }
          .list-inset {
            border-color: #333 !important;
            filter: grayscale(0.4) brightness(1.5);
          }
          input, button, textarea, select {
            background-color: #111 !important;
            color: #fff !important;
          }
          nav {
            color: black !important;
          }
          a, a:visited {
            color: dodgerblue;
          }
          .material-symbols-outlined {
            filter: brightness(1.3);
          }
        }
      `}</style>
      {process.env.NEXT_PUBLIC_VERCEL_ENV !== "production" && <nav style={{backgroundColor: "orange", textAlign: "center", fontWeight: 600, marginTop: -20 + "px", height: "fit-content", paddingBottom: 0, marginBottom: -16 + "px"}}><p style={{paddingTop: 13 + "px", paddingBottom: 8 + "px"}}>You are viewing a TrackTask Development release, some features may not work properly or may break your account.</p></nav>}
      {advisory && <nav style={{backgroundColor: advisoryColor, textAlign: "center", fontWeight: 600, marginTop: -20 + "px", height: "fit-content", paddingBottom: 0, marginBottom: -16 + "px"}}><p style={{paddingTop: 13 + "px", paddingBottom: 8 + "px"}}>{advisory.split(',')[1]}</p></nav>}
      <Header />

      <main>
        <div className="container">{children}</div>
      </main>

      <span style={{ fontSize: "90%", textAlign: "center", color: "gray", display: "table", margin: "4rem" + " auto", padding: "0 0.5rem 20px 0.5rem" }}>Copyright &#169; 2022-2023 TrackTask STM, All Rights Reserved - <Link href="/privacy"><a className="footer">Privacy</a></Link> - <Link href="/terms"><a className="footer">Terms of Use</a></Link></span>
    </>
  );
}
