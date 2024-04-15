import Head from "next/head";
import Header from "components/Header";
import Link from "next/link";

export default function Layout({ children }) {
  var advisory = process.env.NEXT_PUBLIC_ADVISORY;
  var advisoryColor = "#006dbe";
  if (advisory?.split('^')[0] !== "default") {
    advisoryColor = advisory?.split('^')[0];
  }

  return (
    <>
      <Head>
        <title>TrackTask &raquo; Shareable Task Management</title>
        <meta name="title" content="TrackTask &raquo; Shareable Task Management" />
        <meta name="description" content="An open-source task management platform geared towards organized collaboration." />
        <meta name="image" content="https://tracktask.eu.org/tracktaskmini.png" />
        <meta name="author" content="TurtleCode84" />
        <meta property="og:site_name" content="TrackTask" />
        <meta property="og:title" content="TrackTask &raquo; Shareable Task Management" />
        <meta property="og:description" content="An open-source task management platform geared towards organized collaboration." />
        <meta property="og:image" content="https://tracktask.eu.org/tracktaskmini.png" />
        <meta name="twitter:title" content="TrackTask &raquo; Shareable Task Management" />
        <meta name="twitter:description" content="An open-source task management platform geared towards organized collaboration." />
        <meta name="twitter:image" content="https://tracktask.eu.org/tracktaskmini.png" />
        <meta name="theme-color" content="#121212" />
        <link rel="manifest" href="/manifest.json" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" />
      </Head>
      <style jsx global>{`
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        /* Dark mode (default) */
        :root {
          --primary-text-color: #fff;
          --secondary-text-color: gray;
          --border-color: #333;
          --background-color: #121212;
          --header-color: #1b2129;
          --element-background: #111;
          --button-active-background: #333;
          --link-color: dodgerblue;
          --nav-text-color: black;
          --icon-brightness: 1.3;
          --input-border-color: #ccc;
          --inset-border-color: var(--border-color);
          --textarea-border-color: #303030;
        }
        
        /* Light mode */
        [data-theme="light"] {
          --primary-text-color: #333;
          --secondary-text-color: #555;
          --border-color: darkgray;
          --background-color: #fff;
          --header-color: #333;
          --element-background: #f8f8f8;
          --button-active-background: #fff;
          --link-color: midnightblue;
          --nav-text-color: #333;
          --icon-brightness: 1;
          --input-border-color: #ccc;
          --inset-border-color: #777;
          --textarea-border-color: #d4d4d4;
        }

        body {
          margin: 0;
          color: var(--primary-text-color);
          background-color: var(--background-color);
          overflow-wrap: anywhere;
        }
        
        .container {
          margin: 1.5rem auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }

        .dashboard {
          display: grid;
          minHeight: 300px;
        }
        
        @media only screen and (max-width: 600px) {
          body {
            display: flex;
            overflow: auto;
          }
          .container {
            max-width: 100vw;
          }
          .dashboard {
            grid-template-columns: 1fr;
            gap: 30px;
            width: fit-content;
          }
          h1 {
            font-size: 28px;
          }
          .welcome-text {
            font-size: 20px;
            margin-bottom: 18px;
          }
          .dashboard .tasks ul {
            margin-left: -40px;
          }
          .grecaptcha-badge {
            visibility: hidden;
          }
        }
        
        @media only screen and (min-width: 600px) {
          .container {
            max-width: 65rem;
          }
          .dashboard {
            grid-template-columns: 3fr 2fr;
            gap: 40px;
          }
        }

        button {
          background: var(--element-background);
          color: var(--primary-text-color);
          font-weight: 550;
          padding: 5px;
          border-width: 1px;
          border-style: solid;
          border-color: var(--input-border-color);
          border-radius: 5px;
          width: auto;
          transition: filter 0.3s;
        }

        button[type="submit"] {
          padding-top: 8px;
          padding-bottom: 8px;
        }
        
        button:hover {
          filter: brightness(0.9);
          cursor: pointer;
        }
        
        button:active {
          background: var(--button-active-background);
        }
        
        button:disabled {
          filter: brightness(0.95) !important;
          cursor: not-allowed !important;
          color: #757575;
        }

        textarea {
          background-color: var(--element-background);
          color: var(--primary-text-color);
          border-radius: 4px;
          resize: none;
          font-family: inherit;
          font-size: 15px;
          letter-spacing: 0.1px;
        }

        /* Linkify textarea */
        .textarea {
          background-color: var(--element-background);
          color: var(--primary-text-color);
          border: 1px solid;
          border-color: var(--textarea-border-color);
          border-radius: 4px;
          width: 611px;
          height: 150px;
          padding: 2px;
          font-family: inherit;
          font-size: 15px;
          letter-spacing: 0.1px;
          white-space: pre-line;
          word-wrap: break-word;
          overflow-y: scroll;
        }

        input, select {
          background-color: var(--element-background);
          color: var(--primary-text-color);
          font-family: inherit;
          border-width: 1px;
          border-style: solid;
          border-color: var(--input-border-color);
          border-radius: 4px;
        }

        ul {
          list-style: none;
          margin-left: -20px;
        }

        summary {
          user-select: none;
          padding: 10px 0;
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
          color: var(--link-color);
        }
        
        a.footer {
          color: gray;
          text-decoration: underline gray;
        }

        a.footer:visited {
          color: gray;
          text-decoration: underline gray;
        }

        nav {
          color: var(--nav-text-color);
        }
        
        .material-symbols-outlined {
          display: inline-block;
          filter: brightness(var(--icon-brightness));
          vertical-align: -5px;
          font-size: inherit;
          max-width: 32px;
          overflow: hidden;
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
      `}</style>
      {process.env.NEXT_PUBLIC_VERCEL_ENV !== "production" && <nav style={{backgroundColor: "orange", textAlign: "center", fontWeight: 600, marginTop: -20 + "px", height: "fit-content", paddingBottom: 0, marginBottom: -16 + "px"}}><p style={{paddingTop: 13 + "px", paddingBottom: 8 + "px"}}>You are viewing a TrackTask development release, some features may not work properly or may break your account.</p></nav>}
      {advisory && <nav style={{backgroundColor: advisoryColor, textAlign: "center", fontWeight: 600, marginTop: -20 + "px", height: "fit-content", paddingBottom: 0, marginBottom: -16 + "px"}}><p style={{paddingTop: 13 + "px", paddingBottom: 8 + "px"}}>{advisory.split('^')[1]}</p></nav>}
      <Header />

      <main>
        <div className="container">{children}</div>
      </main>

      <span style={{ fontSize: "90%", textAlign: "center", color: "gray", display: "table", margin: "4rem" + " auto", padding: "0 0.5rem 20px 0.5rem" }}>Copyright &#169; 2022-2024 TrackTask STM, All Rights Reserved &bull; <Link href="/privacy"><a className="footer">Privacy</a></Link> &bull; <Link href="/terms"><a className="footer">Terms of Use</a></Link> &bull; <a className="footer" href="https://discord.gg/Hh3fw2xesP" target="_blank" rel="noopener noreferrer">Discord</a></span>
    </>
  );
}
