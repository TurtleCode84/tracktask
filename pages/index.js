import Layout from "components/Layout";
import Loading from "components/Loading";
import Image from "next/image";
import useUser from "lib/useUser";

export default function Home() {
  const { user } = useUser({
    redirectTo: "/dashboard",
    redirectIfFound: true,
  });
  if (user || user.isLoggedIn) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>
        <span style={{ marginRight: ".3em", verticalAlign: "middle" }}>
          <Image src="/GitHub-Mark-32px.png" width="32" height="32" alt="" />
        </span>
        TrackTask - Shareable Task Management
      </h1>

      <p>
        A task tracking platform built on Next.js,{" "}
        <b>perfect for keeping lists and sharing them with teams</b>.
      </p>

      <p>
        TrackTask is currently in development.
      </p>

      <h2>Features</h2>

      <ul>
        <li>Coming soon...</li>
      </ul>

      <h2>More headers:</h2>

      <ol>
        <li>Something will go here, eventually.</li>
      </ol>
      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </Layout>
  );
}
