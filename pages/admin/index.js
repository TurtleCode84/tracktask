import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import useUser from "lib/useUser";
import Link from "next/link";

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
      <h1>TrackTask Admin Panel &#128737;</h1>
      <h2>
        Welcome back{user ? `, ${user.username}` : null}!
      </h2>
      <p>All admin pages:</p>
      <ul>
        <li><Link href="/users">User Admin</Link></li>
      </ul>
      <detail>
        <summary>View my raw session info</summary>
        {user && (
          <>
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </>
        )}
      </detail>
    </Layout>
  );
}
