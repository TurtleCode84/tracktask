import React, { useState } from "react";
import useUser from "lib/useUser";
import Layout from "components/Layout";
import LoginForm from "components/LoginForm";
import Link from "next/link";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";

export default function Login() {
  // Here we just check if user is already logged in and redirect to dashboard
  const { mutateUser } = useUser({
    redirectTo: "/dashboard",
    redirectIfFound: true,
  });
  
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { joined, reset, username } = router.query;
  var joinMsg;
  if (joined === "true") {
    joinMsg = "Account created! You can log in now.";
  } else if (reset === "pending") {
    joinMsg = "Password reset request sent, please check your email.";
  } else if (reset === "done") {
    joinMsg = "Password successfully reset, you may login now.";
  }

  return (
    <Layout>
      <div className="login">
        <h2>Log in:</h2>
        <hr/><br/>
        <LoginForm
          errorMessage={errorMsg}
          joinMessage={joinMsg}
          joinUsername={username}
          onSubmit={async function handleSubmit(event) {
            event.preventDefault();
            document.getElementById("loginBtn").disabled = true;

            const body = {
              username: event.currentTarget.username.value,
              password: event.currentTarget.password.value,
              //cf_turnstile: event.currentTarget.cf-turnstile-response.value,
            };

            try {
              mutateUser(
                await fetchJson("/api/auth", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                }),
                false,
              );
            } catch (error) {
              if (error instanceof FetchError) {
                setErrorMsg(error.data?.message || error.message);
              } else {
                console.error("An unexpected error happened:", error);
              }
              document.getElementById("loginBtn").disabled = false;
            }
          }}
        />
        <p style={{ textAlign: "center", marginTop: "25px", marginBottom: "10px", fontSize: "95%" }}>
          <Link href="/join">Sign up</Link>
          {' '}&bull;{' '}
          <Link href="/dashboard/account/reset-password">Forgot password</Link>
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
