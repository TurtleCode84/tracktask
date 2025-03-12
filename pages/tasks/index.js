import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Task from "components/Task";
import useUser from "lib/useUser";
import useData from "lib/useData";
import { useRouter } from "next/router";
import dynamicToggle from "lib/dynamicToggle";

export default function Tasks() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  const router = useRouter();
  
  const { data: allTasks, error: allTasksError } = useData(user, "tasks", false, "all");
  const relTaskList = allTasks?.filter(task => task.completion.completed === 0).map((task) =>
    <Task task={task} key={task._id}/>
  );
  const comTaskList = allTasks?.filter(task => task.completion.completed > 0).map((task) =>
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
      <a href="#" onClick={(e) => {e.preventDefault();router.back();}}>Back to previous</a><br/>
      {relTaskList === undefined || comTaskList === undefined || allTasksError ?
      <>
      {allTasksError ? <p style={{ fontStyle: "italic" }}>{allTasksError.data?.message || allTasksError.message}</p> : <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
      </>
      :
      <ul style={{ display: "table" }}>
        {relTaskList.length > 0 || comTaskList.length > 0 ?
        <>{relTaskList.length > 0 ? relTaskList : <Task text="No incomplete tasks found!" />}
        {comTaskList.length > 0 && <details id="more"><summary style={{ fontSize: "90%", color: "gray", marginLeft: "15px" }} onClick={(e) => { dynamicToggle(e, "more") }}>View more</summary>{comTaskList}</details>}</>
        :
        <li style={{ paddingBottom: "2px" }}>No tasks found!</li>}
      </ul>
      }
    </Layout>    
  );
}