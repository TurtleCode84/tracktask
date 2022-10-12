import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Link from "next/link";
import useUser from "lib/useUser";

export default function Banned() {
  const { user } = useUser({
    redirectTo: "/dashboard",
    bannedOnly: true,
  });
  
  if (!user || !user.isLoggedIn || !user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1><span style={{ color: "red" }} className="material-symbols-outlined">block</span> Account Banned:</h1>
      <h2>
        Your TrackTask account was banned by an administrator.
      </h2>

      {user !== undefined && user.history.banReason !== "" && (
        <p>
          The following ban reason was given: <b>{user.history.banReason}</b>
        </p>
      )}

      <p style={{ fontStyle: "italic" }}>If you would like to appeal to this decision, please review TrackTask&apos;s <Link href="/terms">Terms of Use</Link> and then contact us at <a href="mailto:appeals@tracktask.eu.org">appeals@tracktask.eu.org</a>.</p>
    </Layout>
  );
}
