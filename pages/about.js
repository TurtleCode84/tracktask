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
      <p>
      TrackTask is a Shareable Task Management system. Users can create tasks with all relevant information and keep track of their completion & priority. Additionally,
      tasks can be grouped in collections, which can be shared with other users to work as a team and get work done in an organized way!
      It was created by <a href="https://wasteof.money/users/turtlecode84">TurtleCode84</a> and is actively developed with help from the other members of the TrackTask team.
      </p>
      <h2>Credits:</h2>
      <p>This project was made possible by the following people, groups, and projects...</p>
      <ul>
        <li><a href="https://github.com/vvo">vvo&apos;s</a><a href="https://github.com/vvo/iron-session">iron-session</a> (for the site&apos;s structure & session framework)</li>
        <li><a href="https://vercel.com">Vercel</a> for build and deployment</li>
        <li><a href="https://nextjs.org">Next.js</a> for an easy-to-use API & static rendering framework</li>
        <li>All contributors to the TrackTask GitHub repository!</li>
      </ul>
      <p>And of course, we can&apos;t have credits without mentioning the amazing people who have helped build and run TrackTask...</p>
      <ul>
        <li><a href="https://wasteof.money/users/daily_meme">@daily_meme</a>, logo designer</li>
        <li><a href="https://wasteof.money/users/radi8">@radi8</a>, tester & developer</li>
        <li><a href="https://wasteof.money/users/ankit_anmol">@ankit_anmol</a>, tester & developer</li>
        {/*<li><a href="https://wasteof.money/users/micahlt">@micahlt</a>, UI/styling</li>*/}
        <li><a href="https://wasteof.money/users/turtlecode84">@turtlecode84</a>, project manager</li>
        <li>Anyone else who gave suggestions or feedback!</li>
      </ul>

      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
          font-size: 90%;
        }
        p {
          font-size: 90%;
        }
      `}</style>
    </Layout>
  );
}
