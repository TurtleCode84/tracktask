import React from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Task from "components/Task";
import Link from "next/link";
import useUser from "lib/useUser";
import useData from "lib/useData";

export default function Tasks() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  
  const { data: allTasks, error: allTasksError } = useData(user, "tasks", false, "all");
  const taskList = allTasks?.map((task) =>
    <Task task={task} key={task._id}/>
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
      {taskList && taskList.length === 0 ? <p style={{ fontStyle: "italic" }}>No tasks found!</p> : null}
      {taskList === undefined || allTasksError ?
      <>
      {allTasksError ? <p style={{ fontStyle: "italic" }}>{allTasksError.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
      </>
      :
      <><ul style={{ display: "table" }}>
        {taskList}
      </ul></>
      }
    </Layout>    
  );
}
