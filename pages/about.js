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
      <p>TrackTask is an STM - a Shareable Task Management system created by 
        <a href="https://wasteof.money/@turtle84375">
          @turtle84375
        </a> 
        with help from others in the TrackTask team.
       </p> //we need to add who else is in the team

      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </Layout>
  );
}
