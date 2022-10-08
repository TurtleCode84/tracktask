import React, { useState } from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import CollectionEditForm from "components/CollectionEditForm";
import useUser from "lib/useUser";
import useTasks from "lib/useTasks";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from 'next/router';
import moment from "moment";
import Link from "next/link";

export default function Collection() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  const { tasks: collections, error } = useTasks(user, true, false);
  
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { collectionId } = router.query;
  const collection = collections?.filter(item => item._id === collectionId)?.[0];
  var clientError;
  if (collections && !collection) {
    clientError = "No collection found";
  }
  const taskList = collection?.tasks.map((task) =>
    <li key={task._id} className="list-hover" style={{ margin: "0.5em", background: "#f8f8f8", padding: "5px", borderWidth: "2px", borderStyle: "solid", borderColor: "darkgray", borderRadius: "10px", width: "auto" }} onClick={() => router.push(`/tasks/${task._id}`)}>
      {task.completion.completed !== 0 ? <><span title="Completed">&#9989;{' '}</span></> : null}{task.priority ? <><span title="Priority">&#10071;</span></> : null}<b>{task.name}</b> - {task.description.slice(0,25).trim()}... (due <DueDate timestamp={task.dueDate}/>{task.dueDate !== 0 ? <>, on {moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}</> : null})
    </li>
  );
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  
  return (
    <Layout>
      <h2>{collection ? <>{collection.name}:</> : 'Loading...'}</h2>
      <Link href="/dashboard">Back to dashboard</Link><br/>
      {collection ?
        <><h3>General information</h3>
        <p>Description: {collection.description}</p>
        <p title={moment.unix(collection.created).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Created: {collection.created > 0 ? <>{moment.unix(collection.created).format("dddd, MMMM Do YYYY, h:mm:ss a")}{' '}({moment.unix(collection.created).fromNow()})</> : 'never'}</p>
        <p>Number of tasks: {collection.tasks.length}</p>
        <p>Tasks in collection:</p>
        {taskList === undefined || error ?
        <>
        {error ? <p style={{ fontStyle: "italic" }}>{error.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading tasks...</p>}
        </>
        :
        <><ul style={{ display: "table" }}>
          {taskList}
        </ul></>
        } 
        <hr/>
        <details>
          <summary>Edit collection</summary>
          <p style={{ fontStyle: "italic" }}>Coming soon...</p>
        </details></>
      :
        <>{error || clientError ? <p>{clientError ? clientError : error.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading task...</p>}</>
      }
    </Layout>
  );
}
