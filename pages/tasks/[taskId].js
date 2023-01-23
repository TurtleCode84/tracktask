import React, { useState } from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import TaskEditForm from "components/TaskEditForm";
import AddRemoveCollectionForm from "components/AddRemoveCollectionForm";
import User from "components/User";
import ReportButton from "components/ReportButton";
import useUser from "lib/useUser";
import useTasks from "lib/useTasks";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from 'next/router';
import moment from "moment";
import Link from "next/link";
import Image from "next/legacy/image";

export default function Task() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  const { tasks, error } = useTasks(user, false, "all");
  const { tasks: collections, error: collectionsError } = useTasks(user, true, false); //unused error
  
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { taskId } = router.query;
  var task = tasks?.filter(item => item._id === taskId)?.[0];
  var canEdit = true;
  var canComplete = true;
  if (!task) {
    canEdit = false;
    canComplete = false;
    const collection = collections?.filter(item => item.tasks?.some((element) => element._id === taskId))?.[0];
    console.log(JSON.stringify(collection));
    console.log(user?.id);
    canEdit = collection?.sharing.sharedWith.includes({id: user?.id, role: "editor"}); // WIP
    console.log(canEdit);
    canComplete = collection?.sharing.sharedWith.includes({id: user?.id, role: "collaborator"}); // WIP
    console.log(canComplete);
    if (!canComplete) {
      canComplete = canEdit
    }
    console.log(canComplete);
    task = collection?.tasks.filter(item => item._id === taskId)?.[0];
    console.log(JSON.stringify(task));
  }
  var clientError;
  if (tasks && !task) {
    clientError = "Task not found!";
  }
    
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  
  return (
    <Layout>
      <h2>{task ? <>{task.completion.completed > 0 ? <><span title="Completed" style={{ color: "darkgreen" }} className="material-symbols-outlined">task_alt</span>{' '}</> : null}{task.priority ? <><span title="Priority" style={{ color: "red" }} className="material-symbols-outlined">priority_high</span>{' '}</> : null}{task.name}:</> : 'Loading...'}</h2>
      <Link href="/dashboard">Back to dashboard</Link><br/>
      {task ?
        <><h3>General information</h3>
        {user.id !== task.owner && <p>Owner: <User user={user} id={task.owner}/></p>}
        <p>Description:</p>{' '}<textarea value={task.description} rows="4" cols="70" disabled /><br/>
        <p title={task.dueDate > 0 ? moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a") : 'Never'}>Due date: {task.dueDate > 0 ? <>{moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}{' '}({moment.unix(task.dueDate).fromNow()})</> : 'never'}</p>
        {task.completion.completed > 0 ? <>
        <p>Completed on: {moment.unix(task.completion.completed).format("dddd, MMMM Do YYYY, h:mm:ss a")}{' '}({moment.unix(task.completion.completed).fromNow()})</p>
        {user.permissions.verified && <p>Completed by: <User user={user} id={task.completion.completedBy}/></p>}
        </>
        :
        <>{canComplete && <><a href={`/api/tasks?id=${task._id}`}
        onClick={async (e) => {
          e.preventDefault();
          document.getElementById("markCompleteBtn").disabled = true;
          const body = {
            completion: {
              completed: Math.floor(Date.now()/1000),
              completedBy: user.id,
            },
            priority: false,
          };
          try {
            await fetchJson(`/api/tasks?id=${task._id}`, {
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
            document.getElementById("markCompleteBtn").disabled = false;
          }
        }}
        ><button id="markCompleteBtn">Mark completed <span style={{ color: "darkgreen" }} className="material-symbols-outlined icon-list">task_alt</span></button></a></>}</>}
        <hr/>
        {canEdit && <><details>
          <summary>Edit task</summary>
          <br/><TaskEditForm
            errorMessage={errorMsg}
            task={task}
            onSubmit={async function handleSubmit(event) {
              event.preventDefault();
              document.getElementById("editTaskBtn").disabled = true;
              
              const body = {};
              if (event.currentTarget.name.value !== event.currentTarget.name.defaultValue) {body.name = event.currentTarget.name.value};
              if (event.currentTarget.description.value !== event.currentTarget.description.defaultValue) {body.description = event.currentTarget.description.value};
              if (event.currentTarget.dueDate.value !== event.currentTarget.dueDate.defaultValue) {
                if (event.currentTarget.dueDate.value) {
                  const offset = new Date().getTimezoneOffset();
                  const utcDueDate = moment(event.currentTarget.dueDate.value, moment.HTML5_FMT.DATETIME_LOCAL).utcOffset(offset);
                  body.dueDate = utcDueDate;
                } else {
                  body.dueDate = "";
                }
              }
              if (event.currentTarget.priority.checked !== event.currentTarget.priority.defaultChecked) {body.priority = event.currentTarget.priority.checked}
              if (event.currentTarget.complete.checked !== event.currentTarget.complete.defaultChecked) {
                body.completion = {};
                if (event.currentTarget.complete.checked) {
                  body.completion.completed = Math.floor(Date.now()/1000);
                  body.completion.completedBy = user.id;
                } else {
                  body.completion.completed = 0;
                  body.completion.completedBy = "";
                }
              }

              try {
                await fetchJson(`/api/tasks?id=${task._id}`, {
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
                document.getElementById("editTaskBtn").disabled = false;
              }
            }}
        />
        </details><br/></>}
        {user.id === task.owner && <><details>
          <summary>Add/remove from collection</summary>
          <br/><AddRemoveCollectionForm
            errorMessage={errorMsg}
            taskId={task._id}
            collections={collections}
            onSubmit={async function handleSubmit(event) {
              event.preventDefault();
              document.getElementById("addRemoveCollectionBtn").disabled = true;
                            
              const addedCollections = event.currentTarget.addCollections.selectedOptions;
              const addedCollectionsValues = Array.from(addedCollections)?.map((item) => item.value);
              const removedCollections = event.currentTarget.removeCollections.selectedOptions;
              const removedCollectionsValues = Array.from(removedCollections)?.map((item) => item.value);
              
              const body = {};
              if (addedCollectionsValues.length > 0) {body.addCollections = addedCollectionsValues};
              if (removedCollectionsValues.length > 0) {body.removeCollections = removedCollectionsValues};
                            
              try {
                await fetchJson(`/api/tasks?collection=true&id=${task._id}`, {
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
                document.getElementById("addRemoveCollectionBtn").disabled = false;
              }
            }}
          />
        </details></>}
        {task.owner !== user.id && <><br/><ReportButton user={user} type="task" reported={task}/></>}</>
      :
        <>{error || clientError ? <p>{clientError ? clientError : error.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading task...</p>}</>
      }
    </Layout>
  );
}
