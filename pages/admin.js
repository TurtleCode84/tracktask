import React from "react";
import Layout from "components/Layout";
import useUser from "lib/useUser";

export default function Admin() {
  const { user } = useUser({
    redirectTo: "/",
    adminOnly: true,
  });

  return (
    <Layout>
      <h1>TrackTask Admin Panel</h1>
      <h2>
        You shouldn&apos;t be here...
      </h2>
      {user && (
        <>
          <p style={{ fontStyle: "italic" }}>
            Your user info, pulled from the TrackTask API.
          </p>

          <pre>{JSON.stringify(user, null, 2)}</pre>
        </>
      )}
    </Layout>
  );
}
