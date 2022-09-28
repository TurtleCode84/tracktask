import React, { useState } from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import TaskCreateForm from "components/TaskCreateForm";
import useUser from "lib/useUser";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";
import Link from "next/link";

export default function TasksCreate() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>
        Create a new task:
      </h1>
      <TaskCreateForm
        errorMessage={errorMsg}
        onSubmit={async function handleSubmit(event) {
          event.preventDefault();
          document.getElementById("createTaskBtn").disabled = true;
          
          var ISODueDate;
          if (event.currentTarget.dueDate) {
            const submittedDueDate = event.currentTarget.dueDate.value;
            const offset = Date().getTimezoneOffset();
            ISODueDate = "test";
          } else {
            ISODueDate = "";
          }

          const body = {
            name: event.currentTarget.name.value,
            description: event.currentTarget.description.value,
            dueDate: ISODueDate,
            markCompleted: event.currentTarget.markCompleted.checked,
            markPriority: event.currentTarget.markPriority.checked,
          };

          try {
            const getUrl = await fetchJson("/api/tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            })
            router.push(`/tasks/${getUrl.insertedId}`);
          } catch (error) {
            if (error instanceof FetchError) {
              setErrorMsg(error.data.message);
            } else {
              console.error("An unexpected error happened:", error);
            }
            document.getElementById("createTaskBtn").disabled = false;
          }
        }}
      />
      <br/><Link href="/dashboard">Back to dashboard</Link>
    </Layout>
  );
}
