import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Image from "next/image";
{/*import useUser from "lib/useUser";*/}

export default function About() {
  {/*const { user } = useUser({
    redirectTo: "/dashboard",
    redirectIfFound: true,
  });
  if (!user || user.isLoggedIn) {
    return (
      <Loading/>
    );
  }*/}
  return (
    <Layout>
      <h2>About TrackTask:</h2>
      <p style={{ fontSize:12px }}>
      TrackTask is a Shareable Task Management system. Users can create tasks with all relevant information and keep track of their completion & priority. Additionally,
      tasks can be grouped in collections, which can be shared with other users to work as a team and get work done in an organized way!
      It is created by <a href="https://wasteof.money/@turtle84375">@turtle84375</a> with help from others in the TrackTask team.
      {/*we need to add who else is in the team*/}
      </p>

      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </Layout>
  );
}
