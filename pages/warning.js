import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import useUser from "lib/useUser";

export default function Warning() {
  const { user } = useUser({
    redirectTo: "/dashboard",
    warnedOnly: true,
  });
  
  if (!user || !user.isLoggedIn || !user.permissions.warned) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>&#9888; Account Warned:</h1>
      <h2>You&apos;ve recieved a warning from a TrackTask administrator.</h2>

      <p>To continue using TrackTask, please review and acknowledge the warning.<br/>The following warning was issued: <b>{user?.history.warnings ? user?.history.warnings[0] : 'loading...'}</b></p>
      
      <a href={`/api/user`}
        onClick={async (e) => {
          e.preventDefault();
          await fetchJson("/api/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ acknowledgedWarning: true }),
          })
        }}
      >Acknowledge warning</a>

      <p>Receiving multiple warnings over a short period of time may increase your chances of being banned.<br/>Please remember to follow TrackTask&apos;s Terms of Use (link coming soon).</p>
      
      <p><i>If you would like to contest this warning, please contact a TrackTask administrator.</i></p>
        
    </Layout>
  );
}
