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
  //const { tasks } = useTasks(user);
  
  //const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { taskId } = router.query;
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  
  return (
    <Layout>
      <h2>Viewing task {taskId}:</h2>
      <Link href="/dashboard">Back to dashboard</Link><br/>
      {user ?
      <><h3>General information</h3>
      <p>(stuff)</p>
      {user.permissions.verified && <><h3>Sharing</h3>
      <p>(more stuff)</p></>}
      <hr/>
      <details>
        <summary>Edit task</summary>
        <br/><p>(there will be something here eventually)</p>
      </details></>
      :
      <>{error ? <p>{error.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading task...</p>}</>
      }
    </Layout>
  );
}
