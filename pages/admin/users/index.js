import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import UserSearchForm from "components/UserSearchForm";
import useUser from "lib/useUser";
import Link from "next/link";

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
      <UserSearchForm
          errorMessage={errorMsg}
          onSubmit={async function handleSubmit(event) {
            event.preventDefault();

            const body = {
              usernameuid: event.currentTarget.usernameuid.value,
              query: event.currentTarget.query.value,
            };

            try {
              mutateUser(
                await fetchJson("/api/admin/users/search", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                }),
                false,
              );
            } catch (error) {
              if (error instanceof FetchError) {
                setErrorMsg(error.data.message);
              } else {
                console.error("An unexpected error happened:", error);
              }
            }
          }}
      />
      <Link href="/admin/users">Back to search</Link>
    </Layout>
  );
}
