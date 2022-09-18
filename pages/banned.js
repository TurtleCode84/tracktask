import React from "react";
import Layout from "components/Layout";
import useUser from "lib/useUser";

export default function Banned() {
  const { user } = useUser({
    redirectTo: "/",
    bannedOnly: true,
  });
  
  if (!user || !user.isLoggedIn || !user.permissions.banned) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }
  return (
    <Layout>
      <h1>Account Banned:</h1>
      <h2>
        Your TrackTask account was banned by an administrator.
      </h2>

      {user !== undefined && user.history.banReason !== "" && (
        <p>
          The following ban reason was given: <b>{user.history.banReason}</b>
        </p>
      )}
      
      <p>
        <i>If you would like to appeal to this decision, please read about our appeals process on our FAQ page.</i>
      </p>
    </Layout>
  );
}
