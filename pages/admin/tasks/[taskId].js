import React, { useState } from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
//import TaskEditForm from "components/TaskEditForm";
import User from "components/User";
import ReportButton from "components/ReportButton";
import useUser from "lib/useUser";
import useAdminData from "lib/useAdminData";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from 'next/router';
import moment from "moment";
import Link from "next/link";
import Linkify from "linkify-react";

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
      <h2>{task ? <>{task.completion.completed > 0 ? <span title="Completed" style={{ color: "darkgreen", marginRight: "8px" }} className="material-symbols-outlined">task_alt</span> : null}{task.priority ? <span title="Priority" style={{ color: "red", marginRight: "8px" }} className="material-symbols-outlined">label_important</span> : null}{task.name}:</> : 'Loading...'}</h2>
      <Link href="/admin/tasks">Back to tasks</Link><br/>
      <Link href="/admin">Back to admin dashboard</Link><br/>
      {task ?
        <><h3>General information</h3>
        <p>Owner: <User user={user} id={task.owner}/></p>
        <p>Description:</p>{' '}<div className="textarea" style={{ maxWidth: "90vw" }}><Linkify options={{target:'blank'}}>{task.description}</Linkify></div>
        <p title={task.dueDate > 0 ? moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a") : 'Never'}>Due date: {task.dueDate > 0 ? <>{moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}{' '}({moment.unix(task.dueDate).fromNow()})</> : 'never'}</p>
        {task.completion.completed > 0 && <p title={moment.unix(task.completion.completed).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Completed {moment.unix(task.completion.completed).fromNow()} by <User user={user} id={task.completion.completedBy}/></p>}
        <hr/>
        {/*perms >= 4 && <><details>
          <summary>Edit task</summary>
          <br/><TaskEditForm
            errorMessage={errorMsg}
            task={task}
            isTaskOwner={true}
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
        <a href={`/api/admin/tasks/${task._id}`} style={{ marginRight: "8px" }}
        onClick={async (e) => {
          e.preventDefault();
          document.getElementById("hideTaskBtn").disabled = true;
          const body = {
            hidden: true,
          };
          try {
            await fetchJson(`/api/admin/tasks/${task._id}`, {
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
            document.getElementById("hideTaskBtn").disabled = false;
          }
        }}
        ><button id="hideTaskBtn"><span style={{ color: "darkgray" }} className="material-symbols-outlined icon-list">visibility_off</span> Hide task</button></a>
        <ReportButton user={user} type="task" reported={task} flag={true}/></>
      :
        <>{taskError ? <p>{taskError.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading task...</p>}</>
      }
    </Layout>
  );
}
