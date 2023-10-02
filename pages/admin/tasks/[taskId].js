import React, { useState } from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
//import TaskEditForm from "components/TaskEditForm";
//import AddRemoveCollectionForm from "components/AddRemoveCollectionForm";
import User from "components/User";
import ReportButton from "components/ReportButton";
import useUser from "lib/useUser";
import useAdminData from "lib/useAdminData";
import fetchJson, { FetchError } from "lib/fetchJson";
import stringToColor from "lib/stringToColor";
import { useRouter } from 'next/router';
import moment from "moment";
import Link from "next/link";
import Image from "next/legacy/image";

export default function TaskAdmin() {
  const { user } = useUser({
    redirectTo: "/login",
    adminOnly: true,
  });
  const router = useRouter();
  const { taskId } = router.query;
  const { data: task, error: taskError } = useAdminData(user, "tasks", taskId, false);
  const { data: collections, error: collectionsError } = useAdminData(user, "collections", false, false);
  
  const [errorMsg, setErrorMsg] = useState("");
    
  if (!user || !user.isLoggedIn || user.permissions.banned || !user.permissions.admin) {
    return (
      <Loading/>
    );
  }
  
  return (
    <Layout>
      <h2>{task ? <>{task.completion.completed > 0 ? <span title="Completed" style={{ color: "darkgreen", marginRight: "8px" }} className="material-symbols-outlined">task_alt</span> : null}{task.priority ? <span title="Priority" style={{ color: "red", marginRight: "8px" }} className="material-symbols-outlined">priority_high</span> : null}{task.name}:</> : 'Loading...'}</h2>
      <Link href="/dashboard">Back to dashboard</Link><br/>
      {task ?
        <><h3>General information</h3>
        <p>Owner: <User user={user} id={task.owner}/></p>
        <p>Description:</p>{' '}<textarea value={task.description} rows="8" cols="70" style={{ maxWidth: "90vw" }} disabled /><br/>
        <p title={task.dueDate > 0 ? moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a") : 'Never'}>Due date: {task.dueDate > 0 ? <>{moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}{' '}({moment.unix(task.dueDate).fromNow()})</> : 'never'}</p>
        {task.completion.completed > 0 && <p>Completed {moment.unix(task.completion.completed).format("dddd, MMMM Do YYYY, h:mm:ss a")}{' '}({moment.unix(task.completion.completed).fromNow()}) by <User user={user} id={task.completion.completedBy}/></p>}
        <hr/>
        {/*perms >= 4 && <><details>
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
                await fetchJson(`/api/tasks/${task._id}`, {
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
                document.getElementById("editTaskBtn").disabled = false;
              }
            }}
        />
        </details></>*/}
        {/*perms >= 4 && <><br/><details>
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
              
              const body = {
                taskId: task._id,
              };
              if (addedCollectionsValues.length > 0) {body.addCollections = addedCollectionsValues};
              if (removedCollectionsValues.length > 0) {body.removeCollections = removedCollectionsValues};
                            
              try {
                await fetchJson(`/api/collections`, {
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
                document.getElementById("addRemoveCollectionBtn").disabled = false;
              }
            }}
          />
        </details></>*/}
        <br/><ReportButton user={user} type="task" reported={task} flag={true}/></>
      :
        <>{taskError ? <p>{taskError.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading task...</p>}</>
      }
    </Layout>
  );
}
