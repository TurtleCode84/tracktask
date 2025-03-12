import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Task from "components/Task";
import { useRouter } from "next/router";
import useUser from "lib/useUser";
import useAdminData from "lib/useAdminData";
import dynamicToggle from "lib/dynamicToggle";

export default function TasksAdmin() {
  const { user } = useUser({
    redirectTo: "/login",
    adminOnly: true,
  });
  const router = useRouter();
  
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
      <a href="#" onClick={(e) => {e.preventDefault();router.back();}}>Back to previous</a><br/>
      {relTaskList === undefined || comTaskList === undefined || tasksError ?
      <>
      {tasksError ? <p style={{ fontStyle: "italic" }}>{tasksError.data?.message || tasksError.message}</p> : <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
      </>
      :
      <ul style={{ display: "table" }}>
        {relTaskList.length > 0 || comTaskList.length > 0 ?
        <>{relTaskList.length > 0 ? relTaskList : <Task text="No incomplete tasks found!" />}
        {comTaskList.length > 0 && <details id="more"><summary style={{ fontSize: "90%", color: "gray", marginLeft: "15px" }} onClick={(e) => { dynamicToggle(e, "more") }}>View more</summary>{comTaskList}</details>}</>
        :
        <li style={{ fontStyle: "italic" }}>No tasks found!</li>}
      </ul>
      }
    </Layout>    
  );
}