import { useState } from "react";
import fetchJson, { FetchError } from "lib/fetchJson";
import Layout from "components/Layout";
import PasswordResetForm from "components/PasswordResetForm";
import useUser from "lib/useUser";
import { useRouter } from "next/router";
import Link from "next/link";

export default function ResetPassword() {
    useUser({
      redirectTo: "/dashboard",
      redirectIfFound: true,
    });

    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();
    const { key } = router.query;
    const confirmed = key?.length > 0;

    return (
        <Layout>
            <div className="reset-password">
            <h2>Reset your password:</h2>
            <hr/>
            <PasswordResetForm
                errorMessage={errorMsg}
                confirmed={confirmed}
                onSubmit={async function handleSubmit(event) {
                    event.preventDefault();
                    document.getElementById("resetPasswordBtn").disabled = true;
                    if (confirmed && event.currentTarget.password.value !== event.currentTarget.cpassword.value) {
                      setErrorMsg("Passwords do not match!");
                      document.getElementById("resetPasswordBtn").disabled = false;
                      return;
                    }

                    const body = {
                      email: confirmed ? undefined : event.currentTarget.email.value,
                      password: confirmed ? event.currentTarget.password.value : undefined,
                      key: confirmed ? key[0] : undefined,
                      cf_turnstile: event.currentTarget.cf-turnstile-response.value,
                    };

                    try {
                      await fetchJson(confirmed ? "/api/auth" : "/api/email", {
                        method: confirmed ? "PATCH" : "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                      });
                      router.push(`/login?reset=${confirmed ? "done" : "pending"}`);
                    } catch (error) {
                      if (error instanceof FetchError) {
                        setErrorMsg(error.data?.message || error.message);
                      } else {
                        console.error("An unexpected error happened:", error);
                      }
                      document.getElementById("resetPasswordBtn").disabled = false;
                    }
                }}
                />
                {!key &&
                <p style={{ textAlign: "center", marginTop: "7px", marginBottom: "10px", fontSize: "95%" }}>
                  <Link href="/login">Back to login</Link>
                </p>}
            </div>
            <style jsx>{`
              .reset-password {
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