import React from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Task from "components/Task";
//import Collection from "components/Collection";
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
    <Task task={task} key={task._id}/>
  );
  const { tasks: overdueTasks, error: overdueTasksError } = useTasks(user, false, "overdue");
  const overdueTaskList = overdueTasks?.map((task) =>
    <Task task={task} key={task._id}/>
  );
  const { tasks: notdueTasks, error: notdueTasksError } = useTasks(user, false, "notdue");
  const notdueTaskList = notdueTasks?.map((task) =>
    <Task task={task} key={task._id}/>
  );
  const { tasks: collections, error: collectionsError } = useTasks(user, true, false);
  const collectionList = collections?.map((collection) =>
    <li key={collection._id} className="list-hover" style={{ margin: "0.5em", background: "#f8f8f8", padding: "5px", borderWidth: "2px", borderStyle: "solid", borderColor: "darkgray", borderRadius: "10px", width: "auto" }} onClick={() => router.push(`/collections/${collection._id}`)}>
      {collection.sharing.shared ? <span title="Shared" style={{ color: "lightslategray" }} className="material-symbols-outlined icon-list">group</span> : <span title="Private" style={{ color: "lightslategray" }} className="material-symbols-outlined icon-list">lock</span>}{' '}<b>{collection.name}</b> - {collection.description.slice(0,30).trim()}... (created {collection.created !== 0 ? moment.unix(collection.created).fromNow() : 'never'})
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

      {upcomingTaskList !== undefined && overdueTaskList !== undefined && notdueTaskList !== undefined && !upcomingTasksError && !overdueTasksError && !notdueTasksError ? null : <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
      
      {!upcomingTasksError &&
      <><h2>Upcoming tasks:</h2>
      <ul style={{ display: "table" }}>
        {upcomingTaskList}
      </ul></>
      }
      
      {!overdueTasksError &&
      <><h2>Past due date:</h2>
      <ul style={{ display: "table" }}>
        {overdueTaskList}
      </ul></>
      }
      
      {!notdueTasksError &&
      <><h2>Not due:</h2>
      <ul style={{ display: "table" }}>
        {notdueTaskList}
      </ul></>
      }
      <Link href="/tasks">View all tasks</Link>
      
      <h2>Your collections:</h2>
      {collectionList === undefined || collectionsError ?
      <>
      {collectionsError ? <p style={{ fontStyle: "italic" }}>{collectionsError.data? collectionsError.data.message : collectionsError.message}</p> : <p style={{ fontStyle: "italic" }}>Loading collections...</p>}
      </>
      :
      <><ul style={{ display: "table" }}>
        {collectionList}
      </ul></>
      }
    </Layout>    
  );
}
