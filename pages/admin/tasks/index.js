import React from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Task from "components/Task";
import Link from "next/link";
import useUser from "lib/useUser";
import useAdminData from "lib/useAdminData";

export default function TasksAdmin() {
  const { user } = useUser({
    redirectTo: "/login",
    adminOnly: true,
  });
  
  const { data: tasks, error: tasksError } = useAdminData(user, "tasks", false, "all");
  const relTaskList = tasks?.filter(task => task.completion.completed === 0).map((task) =>
    <Task task={task} key={task._id} admin={true}/>
  );
  const comTaskList = tasks?.filter(task => task.completion.completed > 0).map((task) =>
    <Task task={task} key={task._id} admin={true}/>
  );
  
  if (!user || !user.isLoggedIn || user.permissions.banned || !user.permissions.admin) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>All reported tasks:</h1>
      <Link href="/admin">Back to admin dashboard</Link><br/>
      {relTaskList === undefined || comTaskList === undefined || tasksError ?
      <>
      {tasksError ? <p style={{ fontStyle: "italic" }}>{tasksError.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
      </>
      :
      <ul style={{ display: "table" }}>
        {relTaskList.length > 0 || comTaskList.length > 0 ?
        <>{relTaskList.length > 0 && relTaskList}
        {comTaskList.length > 0 && <details><summary style={{ fontSize: "90%", color: "gray", paddingTop: "8px" }}>View more</summary>{comTaskList}</details>}</>
        :
        <li style={{ paddingBottom: "2px" }}>No tasks found!</li>}
      </ul>
      }
    </Layout>    
  );
}