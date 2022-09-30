import React from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import DueDate from "components/DueDate";
import useUser from "lib/useUser";
import useTasks from "lib/useTasks";
import { useRouter } from "next/router";

export default function Dashboard() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  
  const { tasks } = useTasks(user);
  const router = useRouter();
  const sortedTasks = tasks?.sort((a, b) => (a.dueDate === 0 || b.priority) ? 1 : -1);
  const taskList = sortedTasks?.map((task) =>
    <li key={task._id} className="list-hover" style={{ margin: "0.5em", background: "#f8f8f8", padding: "5px", borderWeight: "5px", borderStyle: "ridge", borderRadius: "10px", width: "auto" }} onClick={() => router.push(`/tasks/${task._id}`)}>
      {task.priority ? <>&#10071;</> : null}<b>{task.name}</b> - {task.description.slice(0,20).trim()}... (due <DueDate timestamp={task.dueDate}/>{task.dueDate !== 0 ? <>, on {moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}</> : null})
    </li>
  );
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>
        {user ? 
        <>
        Welcome back, {user.username}!{user.permissions.verified ? <>{' '}&#9989;</> : null}{user.permissions.admin ? <>{' '}&#128737;</> : null}
        </>
        :
        <>
        Welcome back!
        </>
        }
      </h1>

      <h2>Your tasks:</h2>
      {taskList === undefined || taskList.length === 0 ?
      <>
      {taskList?.length === 0 ? <p style={{ fontStyle: "italic" }}>Looks like you have no tasks!</p> : <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
      </>
      :
      <><ul style={{ display: "table" }}>
        {taskList}
      </ul></>
      }
      
      <h2>Your collections:</h2>
      <p style={{ fontStyle: "italic" }}>
        Coming soon...
      </p>
    </Layout>    
  );
}
