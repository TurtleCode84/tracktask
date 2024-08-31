import React, { useState } from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import CollectionCreateForm from "components/CollectionCreateForm";
import useUser from "lib/useUser";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";
import Link from "next/link";

export default function CollectionsCreate() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>Create a new collection:</h1>
      <CollectionCreateForm
        verified={user.permissions.verified}
        errorMessage={errorMsg}
        onSubmit={async function handleSubmit(event) {
          event.preventDefault();
          document.getElementById("createCollectionBtn").disabled = true;

          const body = {
            name: event.currentTarget.name.value,
            description: event.currentTarget.description.value,
          };

          try {
            const getUrl = await fetchJson("/api/collections", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            router.push(`/collections/${getUrl.insertedId}`);
          } catch (error) {
            if (error instanceof FetchError) {
              setErrorMsg(error.data?.message || "An error occurred.");
            } else {
              console.error("An unexpected error happened:", error);
            }
            document.getElementById("createCollectionBtn").disabled = false;
          }
        }}
      />
      <br/><Link href="/dashboard">Back to dashboard</Link>
    </Layout>
  );
}
