import React, { useState } from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import TaskCreateForm from "components/TaskCreateForm";
import useUser from "lib/useUser";
import useData from "lib/useData";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";

export default function TasksCreate() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  const { data: collections, error: collectionsError } = useData(user, "collections", false, false); //unused error
  
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>Create a new task:</h1>
      <TaskCreateForm
        errorMessage={errorMsg}
        collections={collections}
        onSubmit={async function handleSubmit(event) {
          event.preventDefault();
          document.getElementById("createTaskBtn").disabled = true;
          
          var utcDueDate;
          if (event.currentTarget.dueDate.value) {
            const offset = new Date().getTimezoneOffset();
            utcDueDate = moment(event.currentTarget.dueDate.value, moment.HTML5_FMT.DATETIME_LOCAL).utcOffset(offset);
          } else {
            utcDueDate = "";
          }

          const addedCollections = event.currentTarget.collections.selectedOptions;
          const addedCollectionsValues = Array.from(addedCollections)?.map((item) => item.value);

          const body = {
            name: event.currentTarget.name.value,
            description: event.currentTarget.description.value,
            dueDate: utcDueDate,
            markPriority: event.currentTarget.markPriority.checked,
          };

          if (addedCollectionsValues.length > 0) {body.addCollections = addedCollectionsValues;}

          try {
            const getUrl = await fetchJson("/api/tasks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body),
            });
            router.push(`/tasks/${getUrl.insertedId}`);
          } catch (error) {
            if (error instanceof FetchError) {
              setErrorMsg(error.data?.message || error.message);
            } else {
              console.error("An unexpected error happened:", error);
            }
            document.getElementById("createTaskBtn").disabled = false;
          }
        }}
      />
      <br/><a href="#" onClick={(e) => {e.preventDefault();router.back();}}>Back to previous</a>
    </Layout>
  );
}
