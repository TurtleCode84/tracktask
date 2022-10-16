import React, { useState } from "react";
import fetchJson, { FetchError } from "lib/fetchJson";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import UserEditForm from "components/UserEditForm";
import useUser from "lib/useUser";
import { useRouter } from "next/router";

export default function Settings() {
  const { user } = useUser({
    redirectTo: "/login",
  });
  
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>Your account <span style={{ color: "gray" }} className="material-symbols-outlined">manage_accounts</span></h1>
      <h2>
        {user.username}{' '}{user.permissions.verified ? <span title="Verified" style={{ color: "#006dbe" }} className="material-symbols-outlined">verified</span> : null}{user.permissions.admin ? <span title="Admin" style={{ color: "slategray" }} className="material-symbols-outlined">verified_user</span> : null}:
      </h2>
      <Link href="/dashboard">Back to dashboard</Link><br/>
      <h3>General information</h3>
      <p>User ID: {user.id}</p>
      <p>Email: {user.email ? <><a href={`mailto:${user.email}`} target="_blank" rel="noreferrer">{user.email}</a></> : 'none'}</p>
      {user.permissions.verified ? <p>Share key: <pre>{user.shareKey}</pre></p> : null}
      <p>Profile picture: <Image src={user.profilePicture ? user.profilePicture : "/default-pfp.jpg" } width={32} height={32} alt=""/> ({user.profilePicture ? <a href={user.profilePicture} target="_blank" rel="noreferrer">link</a> : 'default'})</p>
      <h3>History</h3>
      <p title={moment.unix(user.history.joined).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Joined: {user.history.joined > 0 ? moment.unix(user.history.joined).fromNow() : 'never'}</p>
      <hr/>
      <details>
        <summary>Edit account details</summary>
        <br/><UserEditForm
            errorMessage={errorMsg}
            user={user}
            onSubmit={async function handleSubmit(event) {
              event.preventDefault();
              document.getElementById("editUserBtn").disabled = true;
              if (event.currentTarget.password.value !== event.currentTarget.cpassword.value) {
                setErrorMsg("New passwords do not match!");
                document.getElementById("editUserBtn").disabled = false;
                return;
              }
               
              const body = {};
              if (event.currentTarget.username.value !== event.currentTarget.username.defaultValue) {body.username = event.currentTarget.username.value}
              if (event.currentTarget.email.value !== event.currentTarget.email.defaultValue) {body.email = event.currentTarget.email.value}
              if (event.currentTarget.password.value !== "") {
                body.newPassword = event.currentTarget.password.value;
                body.oldPassword = event.currentTarget.opassword.value;
              }
              if (event.currentTarget.resetShareKey.checked) {body.resetShareKey = event.currentTarget.resetShareKey.checked}
              if (event.currentTarget.profilePicture.value !== event.currentTarget.profilePicture.defaultValue) {body.profilePicture = event.currentTarget.profilePicture.value}

              try {
               await fetchJson(`/api/user`, {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify(body),
               })
               router.reload();
             } catch (error) {
               if (error instanceof FetchError) {
                 setErrorMsg(error.data.message);
               } else {
                 console.error("An unexpected error happened:", error);
               }
               document.getElementById("editUserBtn").disabled = false;
             }
           }}
        />
      </details>
    </Layout>    
  );
}
