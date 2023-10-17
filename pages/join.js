import React, { useState } from "react";
import useUser from "lib/useUser";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Layout from "components/Layout";
import SignupForm from "components/SignupForm";
import Link from "next/link";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from 'next/router'

export default function Join() {
  // here we just check if user is already logged in and redirect to dashboard
  const { user, mutateUser } = useUser({
    redirectTo: "/dashboard",
    redirectIfFound: true,
  });

  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  return (
    <Layout>
      <div className="signup">
        <h2>Create an account:</h2>
        <hr/><br/>
        <SignupForm
          errorMessage={errorMsg}
          onSubmit={async function handleSubmit(event) {
            event.preventDefault();
            document.getElementById("signupBtn").disabled = true;
            if (!executeRecaptcha) {
              setErrorMsg("reCAPTCHA not available, please try again.");
              document.getElementById("signupBtn").disabled = false;
              return;
            } else if (event.currentTarget.password.value !== event.currentTarget.cpassword.value) {
              setErrorMsg("Passwords do not match!");
              document.getElementById("signupBtn").disabled = false;
              return;
            }         
            const body = {
              username: event.currentTarget.username.value,
              password: event.currentTarget.password.value,
              email: event.currentTarget.email.value,
              gReCaptchaToken: await executeRecaptcha("joinFormSubmit"),
            };

            try {
              const res = await fetchJson("/api/auth", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              })
              router.push(`/login?joined=true&username=${res.username}`);
            } catch (error) {
              if (error instanceof FetchError) {
                setErrorMsg(error.data.message);
              } else {
                console.error("An unexpected error happened:", error);
              }
              document.getElementById("signupBtn").disabled = false;
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
