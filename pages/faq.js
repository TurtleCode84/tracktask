import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Image from "next/image";
{/*import useUser from "lib/useUser";*/}

export default function Faq() {
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
      <h2>Frequently Asked Questions:</h2>
      <p>
        Everything you ever wanted to know about TrackTask, more or less.
      </p>

      <ul>
        <li><p style={{ fontStyle: "italic" }}>What does it mean to be verified?</p><br/><p>If your account is verified, you will be able to share collections of tasks with other users, among other perks. This is to prevent abuse of the sharing capabilities by restricting them to reviewed & trusted users.</p></li>
      </ul>

      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </Layout>
  );
}
