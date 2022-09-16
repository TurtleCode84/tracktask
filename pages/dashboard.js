import React from "react";
import Layout from "components/Layout";
import useUser from "lib/useUser";
import useEvents from "lib/useEvents";

// Make sure to check https://nextjs.org/docs/basic-features/layouts for more info on how to use layouts
export default function Dashboard() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  const { events } = useEvents(user);

  return (
    <Layout>
      <h1>Welcome to TrackTask!</h1>
      <h2>
        The shareable task management system.
      </h2>
      {user && (
        <>
          <p style={{ fontStyle: "italic" }}>
            Your user info, pulled from the TrackTask API.
          </p>

          <pre>{JSON.stringify(user, null, 2)}</pre>
        </>
      )}

      {events !== undefined && (
        <p>
          Number of GitHub events for user (deprecated): <b>{events.length}</b>.{" "}
          {events.length > 0 && (
            <>
              Last event type: <b>{events[0].type}</b>
            </>
          )}
        </p>
      )}
    </Layout>
  );
}
