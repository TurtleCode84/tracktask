import React from "react";
import Layout from "components/Layout";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";

export default function Admin({ user }) {
  return (
    <Layout>
      <h1>Example page</h1>
      <h2>
        Subtitle.
      </h2>
      {/*Anything can go here*/}
    </Layout>
  );
}

export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  res,
}) {
  const user = req.session.user;

  if (user === undefined) {
    res.setHeader("location", "/login");
    res.statusCode = 302;
    res.end();
    return {
      props: {
        user: { isLoggedIn: false, id: "", username: "", permissions: {} },
      },
    };
  }

  return {
    props: { user: req.session.user },
  };
},
sessionOptions);
