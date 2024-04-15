import React from "react";
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
      <Link href="/dashboard">Back to dashboard</Link><br/>
      {relTaskList === undefined || comTaskList === undefined || allTasksError ?
      <>
      {allTasksError ? <p style={{ fontStyle: "italic" }}>{allTasksError.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
      </>
      :
      <ul style={{ display: "table" }}>
        {relTaskList.length > 0 || comTaskList.length > 0 ?
        <>{relTaskList.length > 0 && relTaskList}
        {comTaskList.length > 0 && <details id="more"><summary style={{ fontSize: "90%", color: "gray" }} onClick={(e) => {
          e.preventDefault();
          const section = document.getElementById("more");
          section.open = section.open ? false : true;
          section.scrollIntoView({ behavior: "smooth", block: section.open ? "start" : "end", inline: "nearest" });
        }}>View more</summary>{comTaskList}</details>}</>
        :
        <li style={{ paddingBottom: "2px" }}>No tasks found!</li>}
      </ul>
      }
    </Layout>    
  );
}