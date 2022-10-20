import React from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Task from "components/Task";
import Link from "next/link";
import useUser from "lib/useUser";
import useTasks from "lib/useTasks";

export default function Tasks() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  
  const { tasks: allTasks, error: allTasksError } = useTasks(user, false, "all");
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
