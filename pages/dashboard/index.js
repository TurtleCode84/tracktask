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
  } else if (deleted === "true") {
    dynamicMsg = "Task successfully deleted!"
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

      {upcomingTaskList === undefined || overdueTaskList === undefined || notdueTaskList === undefined && <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
      {upcomingTaskList.length === 0 && overdueTaskList.length === 0 && notdueTaskList === 0 &&
      <><h2>Your tasks:</h2>
      <p style={{ fontStyle: "italic" }}>You have no relevant tasks!</p></>
      }

      {upcomingTaskList.length > 0 &&
      <><h2>Upcoming tasks:</h2>
      <ul style={{ display: "table" }}>
        {upcomingTaskList}
      </ul></>
      }
      
      {overdueTaskList.length > 0 &&
      <><h2>Past due date:</h2>
      <ul style={{ display: "table" }}>
        {overdueTaskList}
      </ul></>
      }
      
      {notdueTaskList > 0 &&
      <><h2>Not due:</h2>
      <ul style={{ display: "table" }}>
        {notdueTaskList}
      </ul></>
      }
      <Link href="/tasks">View all tasks</Link>
      
      <h2>Your collections:</h2>
      {collectionList === undefined && <p style={{ fontStyle: "italic" }}>Loading collections...</p>}
      {collectionList.length === 0 ?
      <p style={{ fontStyle: "italic" }}>You have no collections!</p>
      :
      <ul style={{ display: "table" }}>
        {collectionList}
      </ul>
      }
      <Link href="/collections">View all collections</Link>
    </Layout>    
  );
}
