import React from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Task from "components/Task";
import Collection from "components/Collection";
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

      {dynamicMsg && <p className="success">{dynamicMsg}</p>}

      {(upcomingTaskList === undefined && !upcomingTasksError) || (overdueTaskList === undefined && !overdueTasksError) || (notdueTaskList === undefined && !notdueTasksError) && <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
      {upcomingTasksError && overdueTasksError && notdueTasksError &&
      <><h2>Your tasks:</h2>
      <p style={{ fontStyle: "italic" }}>You have no relevant tasks!</p></>
      }

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
      {collectionList === undefined && !collectionsError && <p style={{ fontStyle: "italic" }}>Loading collections...</p>}
      {collectionsError ?
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
