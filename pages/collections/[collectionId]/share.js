import React, { useState } from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import CollectionShareForm from "components/CollectionShareForm";
import User from "components/User";
import useUser from "lib/useUser";
import useTasks from "lib/useTasks";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";
import Link from "next/link";

export default function CollectionShare() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  const { tasks: collections, error } = useTasks(user, true, false);
  
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { collectionId } = router.query;
  const collection = collections?.filter(item => item._id === collectionId)?.[0];
  var clientError;
  if (collections && !collection) {
    clientError = "No collection found";
  }
  const sharedWithList = collection?.sharing.sharedWith.map((item) =>
    <li key={item.id}><User user={user} id={item.id}/></li>
  );
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  if (!user.permissions.verified) {
    return (
      <Layout>
        <h1>Whoops!</h1>
        <p>Currently, only verified users can share collections. This page will have a button to request verification soon, but at the moment you will have to wait.<br/>Sorry for the inconvenience!</p>
        <br/><Link href={`/collections/${collection?._id}`}>Back to collection</Link>
      </Layout>
    );
  }
  return (
    <Layout>
      <h1>Share {collection ? <>&quot;{collection.name}&quot;</> : 'a collection'}:</h1>
      <Link href={`/collections/${collection?._id}`}>Back to collection</Link><br/>
      <Link href="/dashboard">Back to dashboard</Link><br/>
      {collection ?
      <>
      <p>Coming soon!</p>
      <CollectionShareForm
        errorMessage={errorMsg}
        onSubmit={async function handleSubmit(event) {
          event.preventDefault();
          document.getElementById("shareCollectionBtn").disabled = true;

          const body = {
            username: event.currentTarget.username.value,
            role: event.currentTarget.role.value,
          };

          try {
            const getUrl = await fetchJson("/api/tasks", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            })
            router.push(`/collections/${collection._id}?shared=true`);
          } catch (error) {
            if (error instanceof FetchError) {
              setErrorMsg(error.data.message);
            } else {
              console.error("An unexpected error happened:", error);
            }
            document.getElementById("shareCollectionBtn").disabled = false;
          }
        }}
      />
      </>
      :
        <>{error || clientError ? <p>{clientError ? clientError : error.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading collection...</p>}</>
      }
    </Layout>
  );
}
