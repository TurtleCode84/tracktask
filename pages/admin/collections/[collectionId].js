import React, { useState } from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Task from "components/Task";
import User from "components/User";
import ReportButton from "components/ReportButton";
//import CollectionAdminForm from "components/CollectionEditForm";
import useUser from "lib/useUser";
import useAdminData from "lib/useAdminData";
import dynamicToggle from "lib/dynamicToggle";
import stringToColor from "lib/stringToColor";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";
import moment from "moment";
import Link from "next/link";
import Linkify from "linkify-react";

export default function Collection() {
  const { user } = useUser({
    adminOnly: true,
    redirectTo: "/login",
  });
  const router = useRouter();
  const { collectionId } = router.query;
  const { data: collection, error, mutate } = useAdminData(user, "collections", collectionId, false);
  
  const [errorMsg, setErrorMsg] = useState("");
  const relTaskList = collection?.tasks?.filter(task => task.completion.completed === 0 && task.priority).sort((a, b) => a.dueDate < b.dueDate || b.dueDate === 0 ? -1 : 1).concat(collection?.tasks?.filter(task => task.completion.completed === 0 && !task.priority).sort((a, b) => a.dueDate < b.dueDate || b.dueDate === 0 ? -1 : 1)).map((task) =>
    <Task task={task} key={task._id} admin={true}/>
  );
  const comTaskList = collection?.tasks?.filter(task => task.completion.completed > 0  && task.priority).sort((a, b) => a.dueDate < b.dueDate || b.dueDate === 0 ? -1 : 1).concat(collection?.tasks?.filter(task => task.completion.completed > 0 && !task.priority).sort((a, b) => a.dueDate < b.dueDate || b.dueDate === 0 ? -1 : 1)).map((task) =>
    <Task task={task} key={task._id} admin={true}/>
  );

  const sharedWithList = collection?.sharing.sharedWith.map((item) =>
    <li key={item.id} style={{ paddingBottom: "5px" }}><User user={user} id={item.id} link={true}/> <span style={{ fontSize: "80%", fontStyle: "italic", color: "darkgray" }}>({item.role.split('-')[0]})</span></li>
  );
  
  if (!user || !user.isLoggedIn || user.permissions.banned || !user.permissions.admin) {
    return (
      <Loading/>
    );
  }
  
  return (
    <Layout>
      <h2><span title="Admin View" style={{ color: "lightslategray" }} className="material-symbols-outlined">verified_user</span>{collection ? <>{collection.hidden && <><span title="Hidden" style={{ color: "red" }} className="material-symbols-outlined">disabled_visible</span>{' '}</>}{collection.sharing.shared ? <span title="Shared" style={{ color: "lightslategray" }} className="material-symbols-outlined">group</span> : <span title="Private" style={{ color: "lightslategray" }} className="material-symbols-outlined">lock</span>}<span style={{ color: stringToColor(collection._id), filter: "grayscale(0.4) brightness(1.5)" }} className="material-symbols-outlined">fiber_manual_record</span>{' '}{collection.name}:</> : 'Loading...'}</h2>
      <Link href="/admin/collections">Back to collections</Link><br/>
      <Link href="/admin">Back to admin dashboard</Link><br/>
      {collection ?
        <><div className="collection"><div>
        <br/><div className="textarea"><Linkify options={{target:'blank'}}>{collection.description}</Linkify></div>
        <p title={collection.created > 0 ? moment.unix(collection.created).format("dddd, MMMM Do YYYY, h:mm:ss a") : 'Never'}>Created: {collection.created > 0 ? <>{moment.unix(collection.created).format("dddd, MMMM Do YYYY, h:mm:ss a")}{' '}({moment.unix(collection.created).fromNow()})</> : 'never'}</p>
        <p>Owner: <User user={user} id={collection.owner} link={true}/></p>
        {collection.sharing.shared && <p>Shared with: <ul>{sharedWithList.length > 0 ? sharedWithList : <li style={{ fontStyle: "italic" }}>Nobody!</li>}</ul></p>}
        <p>Task count: {relTaskList.length} to do &raquo; {comTaskList.length} complete &raquo; {collection.tasks.length} total</p></div>
        <div className="tasks">
        {relTaskList === undefined || comTaskList === undefined || error ?
        <>
        {error ? <p style={{ fontStyle: "italic" }}>{error.data?.message || error.message}</p> : <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
        </>
        :
        <ul style={{ display: "table" }}>
          {relTaskList.length > 0 || comTaskList.length > 0 ?
          <>{relTaskList.length > 0 ? relTaskList : <Task text="No incomplete tasks found!" />}
          {comTaskList.length > 0 && <details id="more"><summary style={{ fontSize: "90%", color: "gray", marginLeft: "15px" }} onClick={(e) => { dynamicToggle(e, "more") }}>View more</summary>{comTaskList}</details>}</>
          :
          <Task text="No tasks found!" />}
        </ul>
        }</div></div>
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
                });
                await mutate();
                document.getElementById("adminCollectionBtn").disabled = false;
              } catch (error) {
                if (error instanceof FetchError) {
                  setErrorMsg(error.data?.message || error.message);
                } else {
                  console.error("An unexpected error happened:", error);
                }
                document.getElementById("adminCollectionBtn").disabled = false;
              }
            }}
        />
        </details>*/}
        <details id="raw">
          <summary onClick={(e) => { dynamicToggle(e, "raw") }}>View raw JSON</summary>
          {error ? <pre>{JSON.stringify(error, null, 2)}</pre> : <pre>{JSON.stringify(collection, null, 2)}</pre>}
        </details><br/>
        <a href={`/api/admin/collections/${collection?._id}`} style={{ marginRight: "8px" }}
        onClick={async (e) => {
          e.preventDefault();
          document.getElementById("hideCollectionBtn").disabled = true;
          const body = {
            hidden: !collection?.hidden,
          };
          try {
            await fetchJson(`/api/admin/collections/${collection?._id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            await mutate();
            document.getElementById("hideCollectionBtn").disabled = false;
          } catch (error) {
            if (error instanceof FetchError) {
              setErrorMsg(error.data?.message || error.message);
            } else {
              console.error("An unexpected error happened:", error);
            }
            document.getElementById("hideCollectionBtn").disabled = false;
          }
        }}
        ><button id="hideCollectionBtn"><span style={{ color: "darkgray" }} className="material-symbols-outlined icon-list">visibility_off</span> {collection?.hidden ? 'Unhide' : 'Hide'} collection</button></a>
        <ReportButton user={user} type="collection" reported={collection} flag={true}/></>
      :
        <p style={{ fontStyle: "italic" }}>{error ? error.data?.message || error.message : 'Loading collection...'}</p>
      }
    </Layout>
  );
}
