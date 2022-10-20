import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Link from "next/link";
import useUser from "lib/useUser";
import fetchJson from "lib/fetchJson";
import { useRouter } from "next/router";

export default function Warning() {
  const { user } = useUser({
    redirectTo: "/dashboard",
    warnedOnly: true,
  });
  const router = useRouter();
  
  if (!user || !user.isLoggedIn || !user.permissions.warned) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1><span style={{ color: "orange" }} className="material-symbols-outlined">warning</span> Account Warned:</h1>
      <h2>You&apos;ve recieved a warning from a TrackTask administrator.</h2>

      <p>To continue using TrackTask, please review and acknowledge the warning.<br/>The following warning was issued: <b>{user ? user.history.warnings[0] : 'loading...'}</b></p>
      
      <a href={`/api/user`}
        onClick={async (e) => {
          e.preventDefault();
          await fetchJson("/api/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ acknowledgedWarning: true }),
          })
          router.reload();
        }}
      >Acknowledge warning</a>

      <p>Receiving multiple warnings over a short period of time may increase your chances of being banned.<br/>Please remember to follow TrackTask&apos;s <Link href="/terms">Terms of Use</Link>.</p>
      
      <p style={{ fontStyle: "italic" }}>If you would like to contest this warning, please contact us at <a href="mailto:appeals@tracktask.eu.org">appeals@tracktask.eu.org</a>.</p>
        
    </Layout>
  );
}
