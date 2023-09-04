import React from "react";
import Layout from "components/Layout";

export default function About() {
  return (
    <Layout>
      <h1>About TrackTask:</h1>
      <p>
      TrackTask is a shareable task management platform. Users can create tasks with all relevant information and keep track of their completion & priority.
      Additionally, tasks can be grouped in collections, which can be shared with other users to work in teams and get work done in an organized way!<br/>
      <br/>The site was created by <a href="https://github.com/TurtleCode84" target="_blank" rel="noreferrer">TurtleCode84</a> and is actively developed with help from the other members of the TrackTask team.
      </p>
      <h2>Credits:</h2>
      <p>This project was made possible by the following people, groups, and projects...</p>
      <ul style={{ listStyle: "revert", margin: "revert" }}>
        <li><a href="https://github.com/vvo" target="_blank" rel="noreferrer">vvo&apos;s</a>{' '}<a href="https://github.com/vvo/iron-session" target="_blank" rel="noreferrer">iron-session</a> (for the site&apos;s structure & session framework)</li>
        <li><a href="https://vercel.com" target="_blank" rel="noreferrer">Vercel</a> for build and deployment</li>
        <li><a href="https://nextjs.org" target="_blank" rel="noreferrer">Next.js</a> for an easy-to-use API & static rendering framework</li>
        <li>All contributors to the TrackTask codebase!</li>
      </ul>
      <p>And of course, we can&apos;t have credits without mentioning the amazing people who have helped build and run TrackTask...</p>
      <ul style={{ listStyle: "revert", margin: "revert" }}>
        <li><a href="https://wasteof.money/users/daily_meme" target="_blank" rel="noreferrer">@daily_meme</a>, logo designer</li>
        <li><a href="https://github.com/radeeyate" target="_blank" rel="noreferrer">@radi8</a>, tester & developer</li>
        <li><a href="https://github.com/Quantum-Codes" target="_blank" rel="noreferrer">@ankit_anmol</a>, tester & developer</li>
        <li><a href="https://wasteof.money/users/silly" target="_blank" rel="noreferrer">@silly</a>, tester</li>
        <li><a href="https://github.com/micahlt" target="_blank" rel="noreferrer">@micahlt</a>, consultant</li>
        <li><a href="https://github.com/TurtleCode84" target="_blank" rel="noreferrer">@turtlecode84</a>, lead developer</li>
        <li>Anyone else who gave suggestions or feedback!</li>
      </ul>
      <h2>Found a bug or have feedback?</h2>
      <p>Head over to our <a href="https://github.com/TurtleCode84/tracktask" target="_blank" rel="noreferrer">GitHub repository</a>, we&apos;d love to hear how we can make TrackTask better!</p>

      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
          font-size: 90%;
        }
      `}</style>
    </Layout>
  );
}
