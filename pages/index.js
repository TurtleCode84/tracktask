import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Image from "next/image";
import Link from "next/link";
import useUser from "lib/useUser";

export default function Home() {
  const { user } = useUser({
    redirectTo: "/dashboard",
    redirectIfFound: true,
  });
  if (!user || user.isLoggedIn) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1 style={{ fontSize: 50, marginBottom: "-20px", marginTop: "-2px" }}>
        <span style={{ marginRight: "-0.6rem", verticalAlign: "middle" }}>
          <Image src="/tracktask.png" width={305} height={110} quality={95} alt="TrackTask" priority={true} />
        </span>
        - Shareable Task Management
      </h1>

      <h1>
        A task-tracking platform built on Next.js,{' '}
        <i>perfect for keeping lists and sharing them with teams</i>.
      </h1>

      <h2>What&apos;s inside?</h2>
      <ul style={{ listStyle: "revert", margin: "revert" }}>
        <li>Tasks with relevant information, priority, and completion,</li>
        <li>A sorted dashboard for quick review of what needs to get done,</li>
        <li>Collections to group your tasks or collaborate on them with others,</li>
        <li>Continuous feature updates and bug fixes,</li>
        <li>And even more!</li>
      </ul>

      <h3 style={{ paddingBottom: "15px" }}><Link href="/join">Sign up</Link> or <Link href="/login">login</Link> to get started!</h3>

      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </Layout>
  );
}
