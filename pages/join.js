import React, { useState } from "react";
import useUser from "lib/useUser";
import Layout from "components/Layout";
import SignupForm from "components/SignupForm";
import Link from "next/link";
import fetchJson, { FetchError } from "lib/fetchJson";

export default function Join() {
  // here we just check if user is already logged in and redirect to dashboard
  const { mutateUser } = useUser({
    redirectTo: "/dashboard",
    redirectIfFound: true,
  });

  const [errorMsg, setErrorMsg] = useState("");

  return (
    <Layout>
      <div className="signup">
        <h2>Sign Up:</h2>
        <hr/><br/>
        <SignupForm
          errorMessage={errorMsg}
          onSubmit={async function handleSubmit(event) {
            event.preventDefault();
            if (event.currentTarget.password.value !== event.currentTarget.cpassword.value) {
              setErrorMsg("Passwords do not match!");
              return;
            }

            const body = {
              username: event.currentTarget.username.value,
              password: event.currentTarget.password.value,
              email: event.currentTarget.email.value
            };

            try {
              mutateUser(
                await fetchJson("/api/signup", {
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
          }}
        />
        <p>Already have an account?{' '}
        <Link href="/login">
          <a>Login!</a>
        </Link>
        </p>
      </div>
      <style jsx>{`
        .signup {
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
