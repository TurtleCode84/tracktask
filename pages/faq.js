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
        <li><p style={{ fontStyle: "italic" }}>Can you add...?</p><p>Feature requests likely won&apos;t be considered until TrackTask is officially announced as ready for the public (meaning all of critical features are in place).</p></li>
        <li><p style={{ fontStyle: "italic" }}>This is cool, how can I help out?</p><p>Our public GitHub repository with contributor instructions is in the making, check back soon!</p></li>
        <li><p style={{ fontStyle: "italic" }}>What does it mean to be verified?</p><p>If your account is verified, you will be able to share collections of tasks with other users, among other perks. This is to prevent abuse of the sharing capabilities by restricting them to reviewed & trusted users.</p></li>
        <li><p style={{ fontStyle: "italic" }}>How do I get verified?</p><p>There is currently no official way to request verification, so at the moment it&apos;s given only at admin discretion.</p></li>
        <li><p style={{ fontStyle: "italic" }}>Help, I&apos;ve been banned!</p><p>Unfortunately for you, there is no official way to appeal to a ban yet, so you&apos;ll either have find an admin to contact or wait until the next update...</p></li>
      </ul>

      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </Layout>
  );
}
