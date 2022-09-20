import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import useUser from "lib/useUser";
import { useRouter } from 'next/router'
import useSWR from "swr";

export default function Admin() {
  const { user, mutateUser } = useUser({
    redirectTo: "/dashboard",
    adminOnly: true,
  });
  const router = useRouter()
  const { userId } = router.query
  const { getUser } = useSWR(`/api/admin/users?uid={userId}`);

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
      <p>You&apos;re at the admin page for user {userId}.</p>
      <pre>{JSON.stringify(getUser, null, 2)}</pre>
    </Layout>
  );
}
