import React from "react";
import Layout from "components/Layout";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "lib/session";

export default function Admin({ user }) {
  return (
    <Layout>
      <h1>TrackTask Admin Panel</h1>
      <h2>
        You probably shouldn&apos;t be here...
      </h2>

      {user?.isLoggedIn && (
        <>
          <p style={{ fontStyle: "italic" }}>
            Public data, from{" "}
            <a href={`https://github.com/${user.login}`}>
              https://github.com/{user.login}
            </a>
            , reduced to `login` and `avatar_url`.
          </p>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </>
      )}
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
  } else if (!user.permissions.admin) {
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
