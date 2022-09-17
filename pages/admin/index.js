import React from "react";
import Layout from "components/Layout";
import useUser from "lib/useUser";

export default function Admin() {
  const { user, mutateUser } = useUser({
    redirectTo: "/",
    adminOnly: true,
  });

  if (!user || !user.isLoggedIn || !user.permissions.admin) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }
  return (
    <Layout>
      <h1>TrackTask Admin Panel</h1>
      <h2>
        You shouldn&apos;t be here...
      </h2>
      <p style={{ fontStyle: "italic" }}>
        Luckily, there&apos;s not anything here yet.
      </p>
    {/*{user && (
        <>
          <p style={{ fontStyle: "italic" }}>
            Your user info, pulled from the TrackTask API.
          </p>

          <pre>{JSON.stringify(user, null, 2)}</pre>
        </>
      )}*/}
    </Layout>
  );
}
