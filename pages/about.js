import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Image from "next/image";

export default function About() {
  return (
    <Layout>
      <h1>About TrackTask:</h1>
      <p>
      TrackTask is a Shareable Task Management system. Users can create tasks with all relevant information and keep track of their completion & priority.
      <br/>Additionally, tasks can be grouped in collections, which can be shared with other users to work as a team and get work done in an organized way!
      <br/>It was created by <a href="https://wasteof.money/users/turtlecode84" target="_blank" rel="noreferrer">TurtleCode84</a> and is actively developed with help from the other members of the TrackTask team.
      </p>
      <h2>Credits:</h2>
      <p>This project was made possible by the following people, groups, and projects...</p>
      <ul>
        <li><a href="https://github.com/vvo" target="_blank" rel="noreferrer">vvo&apos;s</a>{' '}<a href="https://github.com/vvo/iron-session" target="_blank" rel="noreferrer">iron-session</a> (for the site&apos;s structure & session framework)</li>
        <li><a href="https://vercel.com" target="_blank" rel="noreferrer">Vercel</a> for build and deployment</li>
        <li><a href="https://nextjs.org" target="_blank" rel="noreferrer">Next.js</a> for an easy-to-use API & static rendering framework</li>
        <li>All contributors to the TrackTask GitHub repository!</li>
      </ul>
      <p>And of course, we can&apos;t have credits without mentioning the amazing people who have helped build and run TrackTask...</p>
      <ul>
        <li><a href="https://wasteof.money/users/daily_meme" target="_blank" rel="noreferrer">@daily_meme</a>, logo designer</li>
        <li><a href="https://wasteof.money/users/radi8" target="_blank" rel="noreferrer">@radi8</a>, tester & developer</li>
        <li><a href="https://github.com/quantum-codes" target="_blank" rel="noreferrer">@ankit_anmol</a>, tester & developer</li>
        <li><a href="https://github.com/micahlt" target="_blank" rel="noreferrer">@micahlt</a>, UI/styling</li>
        <li><a href="https://wasteof.money/users/reid" target="_blank" rel="noreferrer">@reid</a>, tester</li>
        <li><a href="https://github.com/turtlecode84" target="_blank" rel="noreferrer">@turtlecode84</a>, project manager</li>
        <li>Anyone else who gave suggestions or feedback!</li>
      </ul>

      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
          font-size: 90%;
        }
      `}</style>
    </Layout>
  );
}
