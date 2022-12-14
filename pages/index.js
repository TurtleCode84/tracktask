import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Image from "next/legacy/image";
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
        <span style={{ marginRight: "-1.3rem", verticalAlign: "middle" }}>
          <Image src="/tracktask.png" width="304.7" height="110" quality="95" alt="TrackTask" priority /> {/* Ratio 2.77:1 */}
        </span>
        - Shareable Task Management
      </h1>

      <h1>
        A task-tracking platform built on Next.js,{" "}
        <i>perfect for keeping lists and sharing them with teams</i>.
      </h1>

      <h2>What&apos;s inside?</h2>
      <ul>
        <li>Tasks with priority and completion labels,</li>
        <li>A sorted dashboard so you can prioritize what needs to get done,</li>
        <li>Collections to group your tasks or share them with others,</li>
        <li>Regular feature updates and bug fixes,</li>
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
