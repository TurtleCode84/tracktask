import React from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Task from "components/Task";
import Collection from "components/Collection";
import Link from "next/link";
import useUser from "lib/useUser";
import useData from "lib/useData";
import { useRouter } from "next/router";

export default function Dashboard() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  
  const { data: upcomingTasks, error: upcomingTasksError } = useData(user, "tasks", false, "upcoming");
  const router = useRouter();
  const { reported, deleted } = router.query;
  var dynamicMsg;
  if (reported === "true") {
    dynamicMsg = "Your report had been sent, an administrator will review it soon."
  } else if (deleted === "t") {
    dynamicMsg = "Task successfully deleted!"
  } else if (deleted === "c") {
    dynamicMsg = "Collection successfully deleted!"
  }
  const upcomingTaskList = upcomingTasks?.map((task) =>
    <Task task={task} key={task._id}/>
  );
  const { data: overdueTasks, error: overdueTasksError } = useData(user, "tasks", false, "overdue");
  const overdueTaskList = overdueTasks?.map((task) =>
    <Task task={task} key={task._id}/>
  );
  const { data: notdueTasks, error: notdueTasksError } = useData(user, "tasks", false, "notdue");
  const notdueTaskList = notdueTasks?.map((task) =>
    <Task task={task} key={task._id}/>
  );
  const { data: collections, error: collectionsError } = useData(user, "collections", false, false);
  const collectionList = collections?.map((collection) =>
    <Collection user={user} collection={collection} key={collection._id}/>
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

      {dynamicMsg && <p className="success">{dynamicMsg}{' '}<Link href="/dashboard">Ok</Link></p>}

      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "40px", minHeight: "300px" }}><div style={{ position: "relative", padding: "5px", borderStyle: "solid", borderWidth: "2px", borderColor: "var(--border-color)", borderRadius: "7px" }}>
      {(upcomingTaskList === undefined || overdueTaskList === undefined || notdueTaskList === undefined) && <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
      {(upcomingTasksError || overdueTasksError || notdueTasksError) && <p style={{ fontStyle: "italic" }}>An error occurred while loading your tasks.</p>}
      {(upcomingTaskList && upcomingTaskList.length === 0) && (overdueTaskList && overdueTaskList.length === 0) && (notdueTaskList && notdueTaskList.length === 0) &&
      <><h2 style={{ marginTop: 0 }}>Your tasks:</h2>
      <p style={{ fontStyle: "italic" }}>You have no relevant tasks!</p></>
      }

      {upcomingTaskList && upcomingTaskList.length > 0 &&
      <><h2 style={{ marginTop: 0 }}>Upcoming tasks:</h2>
      <ul style={{ display: "table" }}>
        {upcomingTaskList}
      </ul></>
      }
      
      {overdueTaskList && overdueTaskList.length > 0 &&
      <><h2 style={{ marginTop: 0 }}>Past due date:</h2>
      <ul style={{ display: "table" }}>
        {overdueTaskList}
      </ul></>
      }
      
      {notdueTaskList && notdueTaskList.length > 0 &&
      <><h2 style={{ marginTop: 0 }}>No due date:</h2>
      <ul style={{ display: "table" }}>
        {notdueTaskList}
      </ul></>
      }
      <Link href="/tasks" style={{ position: "absolute", bottom: 0, right: 0, paddingRight: "5px", paddingBottom: "5px" }}>View all tasks</Link>
      </div>
      
      <div style={{ position: "relative", padding: "5px", borderStyle: "solid", borderWidth: "2px", borderColor: "var(--border-color)", borderRadius: "7px" }}>
      <h2 style={{ marginTop: 0 }}>Your collections:</h2>
      {collectionList === undefined && !collectionsError && <p style={{ fontStyle: "italic" }}>Loading collections...</p>}
      {collectionsError && <p style={{ fontStyle: "italic" }}>An error occurred while loading your collections.</p>}
      {collectionList && collectionList.length === 0 ?
      <p style={{ fontStyle: "italic" }}>You have no collections!</p>
      :
      <ul style={{ display: "table" }}>
        {collectionList}
      </ul>
      }
      <Link href="/collections" style={{ position: "absolute", bottom: 0, right: 0, paddingRight: "5px", paddingBottom: "5px" }}>View all collections</Link>
      </div></div>
    </Layout>    
  );
}
