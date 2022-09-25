import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import useUser from "lib/useUser";
import useAdminUsers from "lib/useAdminUsers";
import Link from "next/link";

export default function Admin() {
  const { user, mutateUser } = useUser({
    redirectTo: "/dashboard",
    adminOnly: true,
  });
  const { users } = useAdminUsers(user);

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
      <h3>Recently created users:</h3>
      <ul>
        <li>Coming soon</li>
      </ul>
      <p>All admin pages:</p>
      <ul>
        <li><Link href="/admin/users">User Admin</Link></li>
      </ul>
      <details>
        <summary>View my raw session info</summary>
        {user && (
          <>
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </>
        )}
      </details>
    </Layout>
  );
}
