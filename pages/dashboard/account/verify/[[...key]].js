import React, { useState } from "react";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
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
    const { executeRecaptcha } = useGoogleReCaptcha();
    const { key } = router.query;
    
    if (!user || !user.isLoggedIn || user.permissions.banned) {
      return (
        <Loading/>
      );
    }
    return (
        <Layout>
            <h1>Verify your email <span style={{ color: "#006dbe" }} className="material-symbols-outlined">verified</span></h1>
            <p>Back to <Link href="/dashboard/account">account</Link> or <Link href="/dashboard">dashboard</Link></p>
            {!user.permissions.verified ? <>
                <h3>{key?.length > 0 ? "Almost there! Click the button below to verify your email address." : "To keep your account secure, we need to confirm that you have access to your linked email address. Click the button below to send a verification request to your email."}</h3>
                <p>{user.email ? `You have linked the email address "${user.email}" to your account.` : "You have not linked an email address to your account, please add one before requesting verification."}</p>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/api/email"
                onClick={async (e) => {
                    e.preventDefault();
                    document.getElementById("verifyEmailBtn").disabled = true;
                    if (!executeRecaptcha) {
                      setErrorMsg("reCAPTCHA not available, please try again.");
                      document.getElementById("verifyEmailBtn").disabled = false;
                      return;
                    } 
                    const body = { gReCaptchaToken: await executeRecaptcha("verifyEmailFormSubmit") };
                    if (key?.length > 0) {
                        body.key = key[0];
                    }
                    try {
                        await fetchJson("/api/email", {
                            method: key?.length > 0 ? "PATCH" : "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(body),
                        });
                        router.push(`/dashboard?verify=${key?.length > 0 ? "done" : "pending"}`);
                    } catch (error) {
                        if (error instanceof FetchError) {
                            setErrorMsg(error.data.message);
                        } else {
                            console.error("An unexpected error happened:", error);
                        }
                        document.getElementById("verifyEmailBtn").disabled = false;
                    }
                }}
                ><button id="verifyEmailBtn" disabled={user.email ? false : true}><span style={{ color: key?.length > 0 ? "darkgreen" : "lightslategray" }} className="material-symbols-outlined icon-list">{key?.length > 0 ? "mark_email_read" : "outgoing_mail"}</span> {key?.length > 0 ? "Verify email" : "Send verification request"}</button></a>
                {errorMsg && <p className="error">{errorMsg}</p>}
            </> : <>
                <h3>Your email is already verified!</h3>
                <p>This page won&apos;t be useful to you unless you change your email address and need to reverify.</p>
            </>}
        </Layout>
    );
}