import React from "react";
import Layout from "components/Layout";
import useUser from "lib/useUser";

export default function Banned() {
  const { user } = useUser({
    redirectTo: "/login",
  });

  return (
    <Layout>
      <h1>Account Banned:</h1>
      <h2>
        Your TrackTask account was banned by an administrator.
      </h2>

      {user.banReason !== undefined && (
        <p>
          The following ban reason was given: <b>{user.banReason}</b>
        </p>
      )}
      
      <p>
        <i>If you would like to appeal to this decision, please contact Turtle84375 on wasteof.money.</i>
      </p>
    </Layout>
  );
}
