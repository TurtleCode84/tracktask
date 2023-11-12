import React, { useState } from "react";
import fetchJson, { FetchError } from "lib/fetchJson";
import Layout from "components/Layout";
import Loading from "components/Loading";
import useUser from "lib/useUser";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Verify() {
    const { user } = useUser({
      redirectTo: "/login",
    });

    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();
    const { key } = router.query;
    
    if (!user || !user.isLoggedIn || user.permissions.banned) {
      return (
        <Loading/>
      );
    }
    return (
        <Layout>
            <h1>Verify your email <span style={{ color: "#006dbe" }} className="material-symbols-outlined icon-list">verified</span></h1>
            <p>Back to <Link href="/dashboard/account">account</Link> or <Link href="/dashboard">dashboard</Link></p>
            <h3>{key ? "Almost there! Click the button below to verify your email address." : "Click the button below to send a verification request to your email. To keep your account secure, we need to confirm that you have access to your linked email address."}</h3>
            <p>{user.email ? `You have linked the email address ${user.email} to your account.` : "You have not linked an email address to your account, please add one before requesting verification."}</p>
            <a href="/api/email/"
              onClick={async (e) => {
                e.preventDefault();
                document.getElementById("verifyEmailBtn").disabled = true;
                const body = {};
                if (key) {
                  body.key = key;
                } else {
                  body.type = "verify";
                }
                try {
                  await fetchJson("/api/email", {
                  method: key ? "PATCH" : "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(body),
                  });
                  router.push(`/?verify=${key ? "done" : "pending"}`);
                } catch (error) {
                  if (error instanceof FetchError) {
                    setErrorMsg(error.data.message);
                  } else {
                    console.error("An unexpected error happened:", error);
                  }
                  document.getElementById("verifyEmailBtn").disabled = false;
                }
              }}
        ><button id="verifyEmailBtn" disabled={user.email ? false : true}><span style={{ color: key ? "darkgreen" : "lightslategray" }} className="material-symbols-outlined icon-list">{key ? "outgoing_mail" : "mark_email_read"}</span> {key ? "Verify email" : "Send verification request"}</button></a>
        {errorMsg && <p className="error">{errorMsg}</p>}
        </Layout>
    );
}