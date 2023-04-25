import React, { useState } from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Task from "components/Task";
import User from "components/User";
import ReportButton from "components/ReportButton";
//import CollectionAdminForm from "components/CollectionEditForm";
import useUser from "lib/useUser";
import useAdminCollections from "lib/useAdminCollections";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from 'next/router';
import moment from "moment";
import Link from "next/link";

export default function Collection() {
  const { user } = useUser({
    adminOnly: true,
    redirectTo: "/login",
  });
  const router = useRouter();
  const { collectionId } = router.query;
  const { collections, error } = useAdminCollections(user, collectionId);
  
  const [errorMsg, setErrorMsg] = useState("");
  const collection = collections?.[0];
  const taskList = collection?.tasks.map((task) =>
    <Task task={task} key={task._id}/>
  );

  const sharedWithList = collection?.sharing.sharedWith.map((item) =>
    <li key={item.id} style={{ paddingBottom: "5px" }}><User user={user} id={item.id} link={true}/> <span style={{ fontSize: "80%", fontStyle: "italic", color: "darkgray" }}>({item.role.split('-')[0]})</span></li>
  );
  
  if (!user || !user.isLoggedIn || !user.permissions.admin) {
    return (
      <Loading/>
    );
  }
  
  return (
    <Layout>
      <h2>{collection?.hidden ? <span title="Hidden" style={{ color: "red" }} className="material-symbols-outlined">disabled_visible</span> : null}{collection?.sharing.shared ? <span title="Shared" style={{ color: "lightslategray" }} className="material-symbols-outlined">group</span> : <span title="Private" style={{ color: "lightslategray" }} className="material-symbols-outlined">lock</span>}{' '}{collection ? <>{collection.name}:</> : 'Loading...'}</h2>
      <Link href="/admin/collections">Back to collections</Link><br/>
      <Link href="/admin">Back to admin dashboard</Link><br/>
      {collection ?
        <><h3>General information</h3>
        <p>Description:</p>{' '}<textarea value={collection.description} rows="4" cols="70" disabled /><br/>
        <p title={collection.created > 0 ? moment.unix(collection.created).format("dddd, MMMM Do YYYY, h:mm:ss a") : 'Never'}>Created: {collection.created > 0 ? <>{moment.unix(collection.created).format("dddd, MMMM Do YYYY, h:mm:ss a")}{' '}({moment.unix(collection.created).fromNow()})</> : 'never'}</p>
        <p>Owner: <User user={user} id={collection.owner} link={true}/></p>
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
        <hr/>
        {/*<details>
          <summary>Edit collection</summary>
          <br/><CollectionAdminForm
            errorMessage={errorMsg}
            collection={collection}
            onSubmit={async function handleSubmit(event) {
              event.preventDefault();
              document.getElementById("adminCollectionBtn").disabled = true;
              
              const body = {};
              if (event.currentTarget.name.value !== event.currentTarget.name.defaultValue) {body.name = event.currentTarget.name.value};
              if (event.currentTarget.description.value !== event.currentTarget.description.defaultValue) {body.description = event.currentTarget.description.value};
              if (event.currentTarget.shared && event.currentTarget.shared.checked !== event.currentTarget.shared.defaultChecked) {body.shared = event.currentTarget.shared.checked}

              try {
                await fetchJson(`/api/admin/collections/${collection._id}`, {
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
                document.getElementById("adminCollectionBtn").disabled = false;
              }
            }}
        />
        </details>*/}</>
      :
        <>{error ? <p>{error.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading collection...</p>}</>
      }
      <br/><details>
        <summary>View raw JSON</summary>
        {error ? <pre>{JSON.stringify(error, null, 2)}</pre> : <pre>{JSON.stringify(collection, null, 2)}</pre>}
      </details>
      <br/><ReportButton user={user} type="collection" reported={collection} flag={true}/>
    </Layout>
  );
}
