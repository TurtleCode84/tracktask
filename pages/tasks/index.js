import React from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import DueDate from "components/DueDate";
import Link from "next/link";
import useUser from "lib/useUser";
import useTasks from "lib/useTasks";
import { useRouter } from "next/router";

export default function Tasks() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  
  const { tasks: allTasks, error: allTasksError } = useTasks(user, false, "all");
  const router = useRouter();
  const taskList = allTasks?.map((task) =>
    <li key={task._id} className="list-hover" style={{ margin: "0.5em", background: "#f8f8f8", padding: "5px", borderWidth: "2px", borderStyle: "solid", borderColor: "darkgray", borderRadius: "10px", width: "auto" }} onClick={() => router.push(`/tasks/${task._id}`)}>
      {task.completion.completed !== 0 ? <span title="Completed" style={{ color: "darkgreen" }} className="material-symbols-outlined icon-list">task_alt</span> : null}{task.priority ? <span title="Priority" style={{ color: "red" }} className="material-symbols-outlined icon-list">priority_high</span> : null}{' '}<b>{task.name}</b> - {task.description.slice(0,25).trim()}... (due <DueDate timestamp={task.dueDate}/>{task.dueDate !== 0 ? <>, on {moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}</> : null})
    </li>
  );
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>All tasks:</h1>
      <Link href="/dashboard">Back to dashboard</Link><br/>
      {taskList === undefined || allTasksError ?
      <>
      {allTasksError ? <p style={{ fontStyle: "italic" }}>{allTasksError.data ? allTasksError.data.message : allTasksError.message}</p> : <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
      </>
      :
      <><ul style={{ display: "table" }}>
        {taskList}
      </ul></>
      }
    </Layout>    
  );
}
