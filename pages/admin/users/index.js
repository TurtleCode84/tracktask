import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import useUser from "lib/useUser";

export default function Admin() {
  const { user, mutateUser } = useUser({
    redirectTo: "/dashboard",
    adminOnly: true,
  });

  if (!user || !user.isLoggedIn || !user.permissions.admin) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>TrackTask User Admin</h1>
      <h2>
        You shouldn&apos;t be here either...
      </h2>
      <p style={{ fontStyle: "italic" }}>
        Luckily, there&apos;s not much here yet.
      </p>
      <p>Eventually, this page will contain a search bar to lookup a specific user.</p>
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
