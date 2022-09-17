import React from "react";
import Layout from "components/Layout";
import useUser from "lib/useUser";
import { useRouter } from 'next/router'

export default function Admin() {
  const { user, mutateUser } = useUser({
    redirectTo: "/",
    adminOnly: true,
  });
  const router = useRouter()
  const { userId } = router.query

  if (!user || !user.isLoggedIn || !user.permissions.admin) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
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
