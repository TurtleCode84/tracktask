import React, { useState } from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
//import TaskEditForm from "components/TaskEditForm";
import useUser from "lib/useUser";
import useTasks from "lib/useTasks";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from 'next/router';
import moment from "moment";
import Link from "next/link";

export default function Task() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  const { tasks, error } = useTasks(user, false, "all");
  
  //const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { taskId } = router.query;
  const task = tasks?.filter(item => item._id === taskId)?.[0];
  var clientError;
  if (tasks && !task) {
    clientError = "Task not found";
  }
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  
  return (
    <Layout>
      <h2>{task ? <>{task.name}:</> : 'Loading...'}</h2>
      <Link href="/dashboard">Back to dashboard</Link><br/>
      {task ?
        <><h3>General information</h3>
        <p>Description: {task.description}</p>
        <p title={moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Due date: {task.dueDate > 0 ? <>{moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}{' '}({moment.unix(task.dueDate).fromNow()})</> : 'never'}</p>
        <p>Priority: {task.priority ? <>&#9989;</> : <>&#10060;</>}</p>
        <p>Completed: {task.completion.completed > 0 ? <>&#9989;</> : <>&#10060;</>}</p>
        {task.completion.completed > 0 && <>
        <p>Completed on: {moment.unix(task.completion.completed).format("dddd, MMMM Do YYYY, h:mm:ss a")}{' '}({moment.unix(task.completion.completed).fromNow()})</p>
        <p>Completed by: {task.completion.completedBy}</p>
        </>}
        <hr/>
        <details>
          <summary>Edit task</summary>
          <p style={{ fontStyle: "italic" }}>(Coming soon...)</p>
        </details></>
      :
        <>{error || clientError ? <p>{clientError ? clientError : error.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading task...</p>}</>
      }
    </Layout>
  );
}
