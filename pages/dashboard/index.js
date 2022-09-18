import React from "react";
import Layout from "components/Layout";
import useUser from "lib/useUser";
import useTasks from "lib/useTasks";

// Make sure to check https://nextjs.org/docs/basic-features/layouts for more info on how to use layouts
export default function Dashboard() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  {/*const { events } = useEvents(user);*/}
  const { tasks } = useTasks(user);
  const taskList = tasks?.map((task) =>
    <li key={task._id}>
      {task.name} - {task.description} (due {task.dueDate})
    </li>
  );
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }
  return (
    <Layout>
      <h1>Welcome to TrackTask!</h1>
      <h2>
        The shareable task management system.
      </h2>
      <p style={{ fontStyle: "italic" }}>
        Your user info, pulled from the TrackTask API.
      </p>

      <pre>{JSON.stringify(user, null, 2)}</pre>

      <h2>Your tasks:</h2>
      {taskList !== [] ?
      <>
      <ul>
        {taskList}
        <p>end of task list</p>
      </ul>
      </>
      :
      <>
      <p style={{ fontStyle: "italic" }}>
        Looks like you have no tasks!
      </p>
      </>
      }
    </Layout>
  );
}
