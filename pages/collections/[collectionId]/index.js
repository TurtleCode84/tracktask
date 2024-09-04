import React, { useState } from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Task from "components/Task";
import User from "components/User";
import ReportButton from "components/ReportButton";
import CollectionEditForm from "components/CollectionEditForm";
import CollectionNewTaskForm from "components/CollectionNewTaskForm";
import useUser from "lib/useUser";
import useData from "lib/useData";
import dynamicToggle from "lib/dynamicToggle";
import stringToColor from "lib/stringToColor";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";
import moment from "moment";
import Link from "next/link";
import Linkify from "linkify-react";

export default function Collection() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  const router = useRouter();
  const { collectionId } = router.query;
  const { data: collection, error, mutate } = useData(user, "collections", collectionId, false);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [newTaskErrorMsg, setNewTaskErrorMsg] = useState("");
  const [newTaskSuccessMsg, setNewTaskSuccessMsg] = useState("");
  var sharedColor = "lightslategray";
  if (collection?.pending || collection?.owner !== user?.id) {
    sharedColor = "#006dbe";
  }
  const titleInfo = {
    hover: "Private",
    icon: "lock",
  };
  if (collection?.pending) {
    titleInfo.hover = "Share Request";
    titleInfo.icon = "share_reviews";
  } else if (collection?.sharing.shared) {
    titleInfo.hover = "Shared";
    titleInfo.icon = "group";
  }
  const relTaskList = collection?.tasks?.filter(task => task.completion.completed === 0).sort((a, b) => a.dueDate < b.dueDate || b.dueDate === 0 ? -1 : 1).sort((a, b) => a.priority ? -1 : 0).map((task) =>
    <Task task={task} key={task._id}/>
  );
  const comTaskList = collection?.tasks?.filter(task => task.completion.completed > 0).sort((a, b) => a.dueDate < b.dueDate || b.dueDate === 0 ? -1 : 1).sort((a, b) => a.priority ? -1 : 0).map((task) =>
    <Task task={task} key={task._id}/>
  );
  const sharedWithList = collection?.sharing?.sharedWith?.map((item) =>
    <li key={item.id} style={{ paddingBottom: "5px" }}><User user={user} id={item.id}/> <span style={{ fontSize: "80%", fontStyle: "italic", color: "darkgray" }}>({item.role.split('-')[1] ? "pending " + item.role.split('-')[1] : item.role.split('-')[0]})</span></li>
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
  
  return (
    <Layout>
      <h2>{collection ? <><span title={titleInfo.hover} style={{ color: sharedColor }} className="material-symbols-outlined">{titleInfo.icon}</span><span style={{ color: stringToColor(collection._id), filter: "grayscale(0.4) brightness(1.5)" }} className="material-symbols-outlined">fiber_manual_record</span>{' '}{collection.pending ? <>Share request for &quot;{collection.name}&quot;</> : collection.name}:</> : 'Loading...'}</h2>
      <Link href={`/dashboard${collection ? "#collection-" + collection._id : ""}`}>Back to dashboard</Link><br/>
      {collection ?
        <>{collection.pending ?
        <><h3>Preview information:</h3>
        <p>Shared by: <User user={user} id={collection.owner}/></p>
        <p>Your role: {collection.role}</p>
        <div className="textarea"><Linkify options={{target:'blank'}}>{collection.description}</Linkify></div>
        <p title={collection.created > 0 ? moment.unix(collection.created).format("dddd, MMMM Do YYYY, h:mm:ss a") : 'Never'}>Created: {collection.created > 0 ? <>{moment.unix(collection.created).fromNow()}</> : 'never'}</p>
        <a href={`/api/collections/${collection._id}`} style={{ marginRight: "8px" }}
        onClick={async (e) => {
          e.preventDefault();
          document.getElementById("acceptRequestBtn").disabled = true;
          const body = {
            action: "accept",
          };
          try {
            await fetchJson(`/api/collections/${collection._id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            await mutate();
          } catch (error) {
            if (error instanceof FetchError) {
              setErrorMsg(error.data?.message || error.message);
              setSuccessMsg("");
            } else {
              console.error("An unexpected error happened:", error);
            }
            document.getElementById("acceptRequestBtn").disabled = false;
          }
        }}
        ><button id="acceptRequestBtn" style={{ marginBottom: "8px" }}><span style={{ color: "darkgreen" }} className="material-symbols-outlined icon-list">check_circle</span> Accept request</button></a></>
        :
        <><div className="collection"><div>
        <br/><div className="textarea"><Linkify options={{target:'blank'}}>{collection.description}</Linkify></div>
        <p title={collection.created > 0 ? moment.unix(collection.created).format("dddd, MMMM Do YYYY, h:mm:ss a") : 'Never'}>Created: {collection.created > 0 ? <>{moment.unix(collection.created).fromNow()}</> : 'never'}</p>
        {user.id !== collection.owner && <p>Owner: <User user={user} id={collection.owner}/></p>}
        {collection.sharing.shared && <p>Shared with: <ul>{sharedWithList.length > 0 ? sharedWithList : <li style={{ fontStyle: "italic" }}>Nobody!</li>}</ul></p>}
        <p>Task count: {relTaskList.length} to do &raquo; {comTaskList.length} complete &raquo; {collection.tasks.length} total</p>
        
        {["contributor", "editor"].includes(currentUserRole) && <div style={{ border: "1px dashed", borderColor: "var(--textarea-border-color)", borderRadius: "4px", padding: "20px", paddingTop: "0" }}>
        <h3>Create new task in collection:</h3>
        <CollectionNewTaskForm
          errorMessage={newTaskErrorMsg}
          successMessage={newTaskSuccessMsg}
          onSubmit={async function handleSubmit(event) {
            event.preventDefault();
            document.getElementById("createTaskBtn").disabled = true;
            
            var utcDueDate;
            if (event.currentTarget.dueDate.value) {
              const offset = new Date().getTimezoneOffset();
              utcDueDate = moment(event.currentTarget.dueDate.value, moment.HTML5_FMT.DATETIME_LOCAL).utcOffset(offset);
            } else {
              utcDueDate = "";
            }

            const body = {
              name: event.currentTarget.name.value,
              description: event.currentTarget.description.value,
              dueDate: utcDueDate,
              markPriority: event.currentTarget.markPriority.checked,
              addCollections: [ collection._id ],
            };

            try {
              const getUrl = await fetchJson("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              });
              await mutate();
              setNewTaskSuccessMsg("Task created!");
              document.getElementById("collectionNewTaskForm").reset();
              document.getElementById(`task-${getUrl.insertedId}`).scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
              document.getElementById("createTaskBtn").disabled = false;
            } catch (error) {
              if (error instanceof FetchError) {
                setNewTaskErrorMsg(error.data?.message || error.message);
                setNewTaskSuccessMsg("");
              } else {
                console.error("An unexpected error happened:", error);
              }
              document.getElementById("createTaskBtn").disabled = false;
            }
          }}
        />
        </div>}
        
        </div>
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
        {user.id === collection.owner && <><hr/>{user.permissions.verified ? <Link href={`/collections/${collection._id}/share`}>Share this collection</Link> : <span style={{ fontStyle: "italic" }}><Link href="/dashboard/account/verify">Verify your email</Link> to share this collection.</span>}</>}
        <hr/>
        {currentUserRole === "editor" && <><details id="edit">
          <summary onClick={(e) => { dynamicToggle(e, "edit") }}>Edit collection</summary>
          <CollectionEditForm
            verified={user.permissions.verified}
            errorMessage={errorMsg}
            successMessage={successMsg}
            collection={collection}
            onSubmit={async function handleSubmit(event) {
              event.preventDefault();
              document.getElementById("editCollectionBtn").disabled = true;
              
              const body = {};
              if (event.currentTarget.name.value !== event.currentTarget.name.defaultValue) {body.name = event.currentTarget.name.value};
              if (event.currentTarget.description.value !== event.currentTarget.description.defaultValue) {body.description = event.currentTarget.description.value};

              try {
                await fetchJson(`/api/collections/${collection._id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                });
                await mutate();
                setSuccessMsg("Collection saved!");
                document.getElementById("editCollectionBtn").disabled = false;
              } catch (error) {
                if (error instanceof FetchError) {
                  setErrorMsg(error.data?.message || error.message);
                  setSuccessMsg("");
                } else {
                  console.error("An unexpected error happened:", error);
                }
                document.getElementById("editCollectionBtn").disabled = false;
              }
            }}
        />
        </details><br/></>}
        </>}
        {user.id !== collection.owner && <><a href={`/api/collections/${collection._id}`} style={{ marginRight: "8px" }}
        onClick={async (e) => {
          e.preventDefault();
          if (collection.pending || confirm("Are you sure? You will lose access to the tasks that are not yours in this collection!")) {
            document.getElementById("removeShareBtn").disabled = true;
            const body = {
              action: "remove",
            };
            try {
              await fetchJson(`/api/collections/${collection._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              });
              window.location.replace("/");
            } catch (error) {
              if (error instanceof FetchError) {
                setErrorMsg(error.data?.message || error.message);
                setSuccessMsg("");
              } else {
                console.error("An unexpected error happened:", error);
              }
              document.getElementById("removeShareBtn").disabled = false;
            }
          }
        }}
        ><button id="removeShareBtn" style={{ marginBottom: "8px" }}><span style={{ color: "lightslategray" }} className="material-symbols-outlined icon-list">logout</span> Leave collection</button></a>
        <ReportButton user={user} type={collection.pending ? "share" : "collection"} reported={collection}/></>}
        {collection.pending && <>{errorMsg && <p className="error">{errorMsg}</p>}</>}</>
      :
        <>{error ? <p>{error.data?.message || error.message}</p> : <p style={{ fontStyle: "italic" }}>Loading collection...</p>}</>
      }
    </Layout>
  );
}
