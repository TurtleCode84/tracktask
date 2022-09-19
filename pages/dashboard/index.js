import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
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
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>
        {user ? 
        <>
        Welcome back, {user.username}!{user.permissions.verified ? <>{' '}&#9989;</> : null}{user.permissions.admin ? <>{' '}&#128273;</> : null}
        </>
        :
        <>
        Welcome back!
        </>
        }
      </h1>

      <h2>Your tasks:</h2>
      {taskList === undefined || taskList.length === 0 ?
      <>
      <p style={{ fontStyle: "italic" }}>
        Looks like you have no tasks!
      </p>
      </>
      :
      <>
      <ul>
        {taskList}
      </ul>
      </>
      }
      
      <h2>Your collections:</h2>
      <p style={{ fontStyle: "italic" }}>
        Coming soon...
      </p>
      <hr/>
      <p style={{ fontStyle: "italic" }}>
        Your user info, pulled from the TrackTask API.
      </p>

      <pre>{JSON.stringify(user, null, 2)}</pre>
    </Layout>
  );
}
