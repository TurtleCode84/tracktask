import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import useUser from "lib/useUser";

export default function UsersAdmin() {
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
      <h1>TrackTask User Admin &#128737;</h1>
      <h2>
        Search for user:
      </h2>
      <p style={{ fontStyle: "italic" }}>
        Eventually, this page will contain a search bar to lookup a specific user.
      </p>
    </Layout>
  );
}
