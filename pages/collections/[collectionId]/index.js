import React, { useState } from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Task from "components/Task";
import User from "components/User";
import ReportButton from "components/ReportButton";
import CollectionEditForm from "components/CollectionEditForm";
import useUser from "lib/useUser";
import useData from "lib/useData";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from 'next/router';
import moment from "moment";
import Link from "next/link";

export default function Collection() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  const router = useRouter();
  const { collectionId } = router.query;
  const { data: collection, error } = useData(user, "collections", collectionId, false);
  
  const [errorMsg, setErrorMsg] = useState("");
  var sharedColor = "lightslategray";
  if (collection?.owner !== user?.id) {
    sharedColor = "#006dbe";
  }
  const taskList = collection?.tasks?.map((task) =>
    <Task task={task} key={task._id}/>
  );
  const sharedWithList = collection?.sharing?.sharedWith?.map((item) =>
    <li key={item.id} style={{ paddingBottom: "5px" }}><User user={user} id={item.id}/> <span style={{ fontSize: "80%", fontStyle: "italic", color: "darkgray" }}>({item.role.split('-')[0]})</span></li>
  );
  var currentUserRole = collection?.sharing?.sharedWith?.filter(item => item.id === user?.id)?.[0]?.role.split('-')[0];
  if (currentUserRole !== "editor" && user?.id === collection?.owner) {
    currentUserRole = "editor";
  }
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  if (collection?.pending) {
    router.push(`/collections/${collectionId}/pending`);
    return;
  }
  
  return (
    <Layout>
      <h2>{collection?.sharing.shared ? <span title="Shared" style={{ color: sharedColor }} className="material-symbols-outlined">group</span> : <span title="Private" style={{ color: "lightslategray" }} className="material-symbols-outlined">lock</span>}{' '}{collection ? <>{collection.name}:</> : 'Loading...'}</h2>
      <Link href="/dashboard">Back to dashboard</Link><br/>
      {collection ?
        <><h3>General information</h3>
        <p>Description:</p>{' '}<textarea value={collection.description} rows="8" cols="70" disabled /><br/>
        <p title={collection.created > 0 ? moment.unix(collection.created).format("dddd, MMMM Do YYYY, h:mm:ss a") : 'Never'}>Created: {collection.created > 0 ? <>{moment.unix(collection.created).fromNow()}</> : 'never'}</p>
        {user.id !== collection.owner && <p>Owner: <User user={user} id={collection.owner}/></p>}
        {collection.sharing.shared && <p>Shared with: <ul>{sharedWithList.length > 0 ? sharedWithList : <li>Nobody!</li>}</ul></p>}
        <p>Number of tasks: {collection.tasks.length}</p>
        <p>Tasks in collection:</p>
        {taskList === undefined || error ?
        <>
        {error ? <p style={{ fontStyle: "italic" }}>{error.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
        </>
        :
        <><ul style={{ display: "table" }}>
          {taskList.length > 0 ? taskList : <li>No tasks found!</li>}
        </ul></>
        } 
        {user.permissions.verified && user.id === collection.owner && <><hr/><Link href={`/collections/${collection._id}/share`}>Share this collection</Link></>}
        <hr/>
        {currentUserRole === "editor" && <><details>
          <summary>Edit collection</summary>
          <br/><CollectionEditForm
            verified={user.permissions.verified}
            errorMessage={errorMsg}
            collection={collection}
            onSubmit={async function handleSubmit(event) {
              event.preventDefault();
              document.getElementById("editCollectionBtn").disabled = true;
              
              const body = {};
              if (event.currentTarget.name.value !== event.currentTarget.name.defaultValue) {body.name = event.currentTarget.name.value};
              if (event.currentTarget.description.value !== event.currentTarget.description.defaultValue) {body.description = event.currentTarget.description.value};
              if (event.currentTarget.shared && event.currentTarget.shared.checked !== event.currentTarget.shared.defaultChecked) {body.shared = event.currentTarget.shared.checked}

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
                document.getElementById("editCollectionBtn").disabled = false;
              }
            }}
        />
        </details></>}
        {collection.owner !== user.id && <><br/><ReportButton user={user} type="collection" reported={collection}/></>}</>
      :
        <>{error ? <p>{error.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading collection...</p>}</>
      }
    </Layout>
  );
}
