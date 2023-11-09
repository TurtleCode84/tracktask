import React, {useState} from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import UserSearchForm from "components/UserSearchForm";
import useUser from "lib/useUser";
import Link from "next/link";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from 'next/router'

export default function UserSearch() {
  const { user, mutateUser } = useUser({
    redirectTo: "/dashboard",
    adminOnly: true,
  });
  
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState("");
  const router = useRouter();

  if (!user || !user.isLoggedIn || user.permissions.banned || !user.permissions.admin) {
    return (
      <Loading/>
    );
  }
  
  return (
    <Layout>
      <h1>TrackTask User Admin <span style={{ color: "slategray" }} className="material-symbols-outlined">admin_panel_settings</span></h1>
      <h2>
        Search for user:
      </h2>
      <UserSearchForm
          user={user}
          errorMessage={errorMsg}
          searchResults={results}
          onSubmit={async function handleSubmit(event) {
            event.preventDefault();
            document.getElementById("findUserBtn").disabled = true;

            const body = {
              keyword: event.currentTarget.keyword.value,
              query: event.currentTarget.query.value,
            };

            try {
              const getUrl = await fetchJson("/api/admin/users/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              });
              if(getUrl.length > 1) {
                setResults(getUrl);
                console.log(JSON.stringify(getUrl));
                document.getElementById("findUserBtn").disabled = false;
              } else {
                router.push(`/admin/users/${getUrl[0]._id}`);
              }
            } catch (error) {
              if (error instanceof FetchError) {
                setErrorMsg(error.data.message);
              } else {
                console.error("An unexpected error happened:", error);
              }
              document.getElementById("findUserBtn").disabled = false;
            }
          }}
      />
      <br/><Link href="/admin">Back to admin dashboard</Link>
    </Layout>
  );
}
