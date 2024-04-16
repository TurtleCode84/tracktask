import React, { useState } from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import CollectionShareForm from "components/CollectionShareForm";
import UserShareForm from "components/UserShareForm";
import User from "components/User";
import useUser from "lib/useUser";
import useData from "lib/useData";
import dynamicToggle from "lib/dynamicToggle";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";
import Link from "next/link";

export default function CollectionShare() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  const router = useRouter();
  const { collectionId } = router.query;
  const { data: collection, error } = useData(user, "collections", collectionId, false);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [userErrorMsg, setUserErrorMsg] = useState("");
  const sharedWithList = collection?.sharing.sharedWith.map((item) =>
    <details key={item.id} id={`share-${item.id}`} style={{ paddingBottom: "10px", marginLeft: "23px" }}><summary onClick={(e) => { dynamicToggle(e, `share-${item.id}`, ["center", "end"]) }}><User user={user} id={item.id}/> <span style={{ fontSize: "80%", fontStyle: "italic", color: "darkgray" }}>({item.role.split('-')[1] ? "pending " + item.role.split('-')[1] : item.role.split('-')[0]})</span></summary>
    <UserShareForm
      collectionId={collectionId}
      errorMessage={userErrorMsg}
      share={item}
      onSubmit={async function handleSubmit(event) {
        event.preventDefault();
        document.getElementById("modifyUserShareBtn").disabled = true;

        const body = {
          action: "modify",
          id: item.id,
          role: event.currentTarget.role.value,
        };

        try {
          await fetchJson(`/api/collections/${collection._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          window.location.replace(`/collections/${collection._id}/share?modified=true`);
        } catch (error) {
          if (error instanceof FetchError) {
            setUserErrorMsg({id: item.id, message: error.data.message});
          } else {
            console.error("An unexpected error happened:", error);
          }
          document.getElementById("modifyUserShareBtn").disabled = false;
        }
      }}
    />
    </details>
  );
  
  if (!user || !user.isLoggedIn || user.permissions.banned || !collection) { // We need to know the collection details before we show the page
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      {user.permissions.verified && user.id === collection.owner ? <>
      <h2>Share settings for {collection ? <>&quot;{collection.name}&quot;</> : 'a collection'}:</h2>
      <p>Back to <Link href={`/collections/${collection?._id}`}>collection</Link> or <Link href="/dashboard">dashboard</Link></p>
      {collection.sharing.shared ?
      <><h3>Currently shared with:</h3>
      {sharedWithList.length > 0 ? <div style={{ marginBottom: "10px" }}>{sharedWithList}</div> : <ul style={{ marginBottom: "20px" }}><li>Nobody!</li></ul>}
      <a href={`/api/collections/${collection._id}`}
        onClick={async (e) => {
          e.preventDefault();
          document.getElementById("disableSharingBtn").disabled = true;
          const body = {
            shared: false,
          };
          try {
            await fetchJson(`/api/collections/${collection._id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            router.reload();
          } catch (error) {
            if (error instanceof FetchError) {
              setErrorMsg(error.data.message);
            } else {
              console.error("An unexpected error happened:", error);
            }
            document.getElementById("disableSharingBtn").disabled = false;
          }
        }}
        ><button id="disableSharingBtn"><span style={{ color: "lightslategray" }} className="material-symbols-outlined icon-list">lock</span> Disable sharing</button></a><hr/></>
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
            });
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
        ><button id="enableSharingBtn"><span style={{ color: "lightslategray" }} className="material-symbols-outlined icon-list">group</span> Enable sharing</button></a><hr/></>
      }
      <details id="new"><summary onClick={(e) => { dynamicToggle(e, "new") }}>Add a new user</summary>
      <CollectionShareForm
        errorMessage={errorMsg}
        onSubmit={async function handleSubmit(event) {
          event.preventDefault();
          document.getElementById("shareCollectionBtn").disabled = true;

          const body = {
            action: "share",
            username: event.currentTarget.username.value,
            role: event.currentTarget.role.value,
          };

          try {
            await fetchJson(`/api/collections/${collection._id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            window.location.replace(`/collections/${collection._id}?shared=true`);
          } catch (error) {
            if (error instanceof FetchError) {
              setErrorMsg(error.data.message);
            } else {
              console.error("An unexpected error happened:", error);
            }
            document.getElementById("shareCollectionBtn").disabled = false;
          }
        }}
      /></details></>
      :
      <><h1 style={{marginBottom: "0px", marginTop: "60px"}}><span style={{color: "lightslategray", fontSize: "inherit"}} className="material-symbols-outlined">lock</span> 403: You don&apos;t have access to this page.</h1>
      <h3>We&apos;re not sure how you got here, but you don&apos;t have permission to view this page. Maybe you aren&apos;t logged in?</h3>
      <p>In the meantime, you probably want to go back to <Link href="/">a page you can access</Link>?</p></>
      }
    </Layout>
  );
}
