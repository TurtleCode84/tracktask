import React, { useState } from "react";
import useUser from "lib/useUser";
import Layout from "components/Layout";
import LoginForm from "components/LoginForm";
import Link from "next/link";
import fetchJson, { FetchError } from "lib/fetchJson";

export default function Login() {
  // here we just check if user is already logged in and redirect to dashboard
  const { mutateUser } = useUser({
    redirectTo: "/dashboard",
    redirectIfFound: true,
  });

  const [errorMsg, setErrorMsg] = useState("");

  return (
    <Layout>
      <div className="login">
        <h2>Log in:</h2>
        <hr/><br/>
        <LoginForm
          errorMessage={errorMsg}
          onSubmit={async function handleSubmit(event) {
            event.preventDefault();
            grecaptcha.ready(function() {
              grecaptcha.execute('6LdQjxQiAAAAAJzWoXdUgeI3nsSxzDtG5Z7njbFe', {action: 'submit'}).then(function(token) {
                // Add your logic to submit to your backend server here.
                const body = {
                  username: event.currentTarget.username.value,
                  password: event.currentTarget.password.value,
                  recaptcha_token: token,
                };
              
                try {
                  mutateUser(
                    await fetchJson("/api/login", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(body),
                    }),
                    false,
                  );
                } catch (error) {
                  if (error instanceof FetchError) {
                    setErrorMsg(error.data.message);
                  } else {
                    console.error("An unexpected error happened:", error);
                  }
                }
              });
            });
          }}
        />
        <p>Don&apos;t have an account?{' '}
        <Link href="/join">
          <a>Sign up!</a>
        </Link>
        </p>
      </div>
      <style jsx>{`
        .login {
          max-width: 21rem;
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
      `}</style>
    </Layout>
  );
}
