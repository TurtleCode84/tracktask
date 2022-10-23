import React, { useState } from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Task from "components/Task";
import User from "components/User";
import CollectionEditForm from "components/CollectionEditForm";
import useUser from "lib/useUser";
import useTasks from "lib/useTasks";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from 'next/router';
import moment from "moment";
import Link from "next/link";

export default function Collection() {
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
  const taskList = collection?.tasks.map((task) =>
    <Task task={task} key={task._id}/>
  );
  const sharedWithList = collection?.sharing.sharedWith.map((item) =>
    <li key={item.id}><User user={user} id={item.id}/></li>
  );
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  
  return (
    <Layout>
      <h2>{collection?.sharing.shared ? <span title="Shared" style={{ color: "lightslategray" }} className="material-symbols-outlined">group</span> : <span title="Private" style={{ color: "lightslategray" }} className="material-symbols-outlined">lock</span>}{' '}{collection ? <>{collection.name}:</> : 'Loading...'}</h2>
      <Link href="/dashboard">Back to dashboard</Link><br/>
      {collection ?
        <><h3>General information</h3>
        <p>Description: {collection.description}</p>
        <p title={moment.unix(collection.created).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Created: {collection.created > 0 ? <>{moment.unix(collection.created).format("dddd, MMMM Do YYYY, h:mm:ss a")}{' '}({moment.unix(collection.created).fromNow()})</> : 'never'}</p>
        {user.id !== collection.owner && <p>Owner: <User user={user} id={collection.owner}/></p>}
        {collection.sharing.shared && <p>Shared with: <ul>{sharedWithList}</ul></p>}
        <p>Number of tasks: {collection.tasks.length}</p>
        <p>Tasks in collection:</p>
        {taskList === undefined || error ?
        <>
        {error ? <p style={{ fontStyle: "italic" }}>{error.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
        </>
        :
        <><ul style={{ display: "table" }}>
          {taskList}
        </ul></>
        } 
        <hr/>
        <details>
          <summary>Edit collection</summary>
          <br/><CollectionEditForm
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
                await fetchJson(`/api/tasks?collection=true&id=${collection._id}`, {
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
        </details></>
      :
        <>{error || clientError ? <p>{clientError ? clientError : error.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading collection...</p>}</>
      }
    </Layout>
  );
}
