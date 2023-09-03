import React from "react";
import Layout from "components/Layout";
import Link from "next/link";

export default function Terms() {
  return (
    <Layout>
      <h1>Terms of Use:</h1>
      <h3>By using TrackTask, you agree to these terms:</h3>
      <ul style={{ listStyle: "revert", margin: "revert" }}>
        <li>All users must review and consent to the <Link href="/privacy">Privacy Policy</Link>.</li>
        <li>&quot;The site&quot; is defined as TrackTask in all of its domains & services.</li>
        <li>You must be at least 13 years of age to use a TrackTask account, if you are under 13 years of age you may use TrackTask with confirmed parent consent. Please contact <a href="mailto:tracktask@tracktask.eu.org">tracktask@tracktask.eu.org</a> for more information.</li>
        <li>The following activities are prohibited:</li>
        <ul style={{ listStyle: "revert", margin: "revert" }}>
          <li>Spamming or attempting to spam on any part of the site.</li>
          <li>&quot;Hacking&quot;, attempting to gain unauthorized access, or performing unauthorized actions on any part of the site. This includes unauthorized use of another user&apos;s account.</li>
          <li>Bypassing any security measure or account protection put in place by the site&apos;s developers to provide a secure user experience.</li>
          <li>Exploiting security vulnerabilities. Please report these immediately to <a href="mailto:security@tracktask.eu.org">security@tracktask.eu.org</a></li>
          <li>Shared accounts (accounts used by multiple individuals). <i>Note: Alt accounts, while not specifically prohibited, are discouraged and may be banned without warning.</i></li>
          <li>Causing undue strain or stress on the site or its counterparts. IP addresses of suspected spammers will be blocked without warning.</li>
          <li>Using the site to upload, transmit, or otherwise distribute illegal, pornographic, hateful, or questionable content. This is decided at the discretion of the site administrators.</li>
          <li>Bullying, harassing, or threatening any user in any way.</li>
          <li>Any other activity or circumstance deemed harmful to the site or its users by a site administrator.</li>
        </ul>
        <li>Failure to follow the above terms will lead to administrative action, including but not limited to an account warning, ban, or IP block, in no particular order.</li>
      </ul>
      <p>If you have any questions about the terms listed above, please contact us at <a href="mailto:tracktask@tracktask.eu.org">tracktask@tracktask.eu.org</a>.</p>
      <p style={{ fontStyle: "italic" }}>This page was last updated 7/5/23.</p>

      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </Layout>
  );
}
