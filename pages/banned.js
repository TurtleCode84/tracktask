import React from "react";
import Layout from "components/Layout";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";

export default function Banned({ user }) {
  return (
    <Layout>
      <h1>Account Banned:</h1>
      <h2>
        Your TrackTask account was banned by an administrator.
      </h2>

      {/*user.banReason !== undefined && (*/}
        <p>
          The following ban reason was given: <b>(ban reasons are a WIP, this is a placeholder)</b>
        </p>
      {/*)}*/}
      
      <p>
        <i>If you would like to appeal to this decision, please contact Turtle84375 on wasteof.money.</i>
      </p>
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
  } else if (!user.permissions.banned) {
    res.setHeader("location", "/");
    res.statusCode = 302;
    res.end();
    return {
      props: { user: req.session.user },
    };
  }

  return {
    props: { user: req.session.user },
  };
},
sessionOptions);
