import React from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import DueDate from "components/DueDate";
import Link from "next/link";
import useUser from "lib/useUser";
import useTasks from "lib/useTasks";
import { useRouter } from "next/router";

export default function Dashboard() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  
  const { tasks: upcomingTasks, error: upcomingTasksError } = useTasks(user, false, "upcoming");
  const router = useRouter();
  const upcomingTaskList = upcomingTasks?.map((task) =>
    <li key={task._id} className="list-hover" style={{ margin: "0.5em", background: "#f8f8f8", padding: "5px", borderWidth: "2px", borderStyle: "solid", borderColor: "darkgray", borderRadius: "10px", width: "auto" }} onClick={() => router.push(`/tasks/${task._id}`)}>
      {task.completion.completed !== 0 ? <span title="Completed" style={{ color: "darkgreen" }} className="material-symbols-outlined">task_alt</span> : null}{task.priority ? <span title="Priority" style={{ color: "red" }} className="material-symbols-outlined">priority_high</span> : null}{' '}<b>{task.name}</b> - {task.description.slice(0,25).trim()}... (due <DueDate timestamp={task.dueDate}/>{task.dueDate !== 0 ? <>, on {moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}</> : null})
    </li>
  );
  const { tasks: recentTasks, error: recentTasksError } = useTasks(user, false, "recent");
  const recentTaskList = recentTasks?.map((task) =>
    <li key={task._id} className="list-hover" style={{ margin: "0.5em", background: "#f8f8f8", padding: "5px", borderWidth: "2px", borderStyle: "solid", borderColor: "darkgray", borderRadius: "10px", width: "auto" }} onClick={() => router.push(`/tasks/${task._id}`)}>
      {task.completion.completed !== 0 ? <span title="Completed" style={{ color: "darkgreen" }} className="material-symbols-outlined">task_alt</span> : null}{task.priority ? <span title="Priority" style={{ color: "red" }} className="material-symbols-outlined">priority_high</span> : null}{' '}<b>{task.name}</b> - {task.description.slice(0,25).trim()}... (due <DueDate timestamp={task.dueDate}/>{task.dueDate !== 0 ? <>, on {moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}</> : null})
    </li>
  );
  const { tasks: collections, error: collectionsError } = useTasks(user, true, false);
  const collectionList = collections?.map((collection) =>
    <li key={collection._id} className="list-hover" style={{ margin: "0.5em", background: "#f8f8f8", padding: "5px", borderWidth: "2px", borderStyle: "solid", borderColor: "darkgray", borderRadius: "10px", width: "auto" }} onClick={() => router.push(`/collections/${collection._id}`)}>
      {collection.owner === user.id ? <span title="You own this collection" style={{ color: "steelblue" }} className="material-symbols-outlined">person</span> : null}{' '}<b>{collection.name}</b> - {collection.description.slice(0,25).trim()}... (created <DueDate timestamp={collection.created}/>)
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
        Welcome back, {user.username}!{user.permissions.verified ? <>{' '}<span title="Verified" style={{ color: "#006dbe" }} className="material-symbols-outlined">verified</span></> : null}{user.permissions.admin ? <>{' '}<span title="Admin" style={{ color: "slategray" }} className="material-symbols-outlined">verified_user</span></> : null}
        </>
        :
        <>
        Welcome back!
        </>
        }
      </h1>

      <h2>Upcoming tasks:</h2>
      {upcomingTaskList === undefined || upcomingTasksError ?
      <>
      {upcomingTasksError ? <p style={{ fontStyle: "italic" }}>{upcomingTasksError.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
      </>
      :
      <><ul style={{ display: "table" }}>
        {upcomingTaskList}
      </ul></>
      }
      
      <h2>Recently added:</h2>
      {recentTaskList === undefined || recentTasksError ?
      <>
      {recentTasksError ? <p style={{ fontStyle: "italic" }}>{recentTasksError.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
      </>
      :
      <><ul style={{ display: "table" }}>
        {recentTaskList}
      </ul></>
      }
      <Link href="/tasks">View all tasks</Link>
      
      <h2>Your collections:</h2>
      {collectionList === undefined || collectionsError ?
      <>
      {collectionsError ? <p style={{ fontStyle: "italic" }}>{collectionsError.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading collections...</p>}
      </>
      :
      <><ul style={{ display: "table" }}>
        {collectionList}
      </ul></>
      }
    </Layout>    
  );
}
