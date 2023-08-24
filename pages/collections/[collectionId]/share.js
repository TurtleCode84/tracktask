import React, { useState } from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import CollectionShareForm from "components/CollectionShareForm";
import User from "components/User";
import useUser from "lib/useUser";
import useData from "lib/useData";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";
import Link from "next/link";
import ErrorPage from "next/error";

export default function CollectionShare() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  const router = useRouter();
  const { collectionId } = router.query;
  const { data: collection, error } = useData(user, "collections", collectionId, false);
  
  const [errorMsg, setErrorMsg] = useState("");
  const sharedWithList = collection?.sharing.sharedWith.map((item) =>
    <li key={item.id} style={{ paddingBottom: "5px" }}><User user={user} id={item.id}/> <span style={{ fontSize: "80%", fontStyle: "italic", color: "darkgray" }}>({item.role.split('-')[0]})</span></li>
  );
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  } else if (!user.permissions.verified || user.id !== collection?.owner) {
    return <ErrorPage statusCode={404} />
  }
  return (
    <Layout>
      <h1>Share settings for {collection ? <>&quot;{collection.name}&quot;</> : 'a collection'}:</h1>
      <p>Back to <Link href={`/collections/${collection?._id}`}>collection</Link> or <Link href="/dashboard">dashboard</Link></p>
      {collection ?
      <>
      {collection.sharing.shared ?
      <><h3>Currently shared with:</h3>
      <p><ul>{sharedWithList.length > 0 ? sharedWithList : <li>Nobody!</li>}</ul></p></>
      :
      <><p style={{ fontStyle: "italic" }}>Sharing is currently disabled for this collection.</p>
      <a href={`/api/collections/${collection._id}`}
        onClick={async (e) => {
          e.preventDefault();
          document.getElementById("enableSharingBtn").disabled = true;
          const body = {
            shared: true,
          };
          try {
            await fetchJson(`/api/collections/${collection._id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            })
            router.reload();
          } catch (error) {
            if (error instanceof FetchError) {
              setErrorMsg(error.data.message);
            } else {
              console.error("An unexpected error happened:", error);
            }
            document.getElementById("enableSharingBtn").disabled = false;
          }
        }}
        ><button id="enableSharingBtn">Enable sharing <span style={{ color: "lightslategray" }} className="material-symbols-outlined icon-list">group</span></button></a><br/></>
      }
      <details><summary>Add a new user</summary><br/>
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
            const getUrl = await fetchJson(`/api/collections/${collection._id}`, {
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
      /></details>
      </>
      :
        <>{error ? <p>{error.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading collection...</p>}</>
      }
    </Layout>
  );
}
