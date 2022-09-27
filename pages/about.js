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
      <p style={{ fontStyle: "italic" }}>
        Coming soon!
      </p>

      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </Layout>
  );
}
