import React, { useState } from "react";
import fetchJson, { FetchError } from "lib/fetchJson";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import UserEditForm from "components/UserEditForm";
import Link from "next/link";
import Image from "next/image";
import useUser from "lib/useUser";
import dynamicToggle from "lib/dynamicToggle";
import { useRouter } from "next/router";

export default function Account() {
  const { user, mutateUser } = useUser({
    redirectTo: "/login",
  });
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();
  
  if (!user || !user.isLoggedIn || user.permissions.banned) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>Your account <span style={{ color: "dimgray" }} className="material-symbols-outlined">manage_accounts</span></h1>
      <Link href="/dashboard">Back to dashboard</Link><br/>
      <h3><hr/>General information<hr/></h3>
      <p>Username: {user.username}{' '}{user.permissions.verified ? <span title="Verified" style={{ color: "#006dbe" }} className="material-symbols-outlined icon-list">verified</span> : null}{user.permissions.admin ? <span title="Admin" style={{ color: "slategray" }} className="material-symbols-outlined icon-list">verified_user</span> : null}</p>
      <p>User ID: <code>{user.id}</code></p>
      <p>Email: {user.email ? <><a href={`mailto:${user.email}`} target="_blank" rel="noreferrer">{user.email}</a></> : 'none'}</p>
      {user.email && !user.permissions.verified && <p style={{ fontStyle: "italic", color: "var(--secondary-text-color)" }}>Your email is not verified, <Link href="/dashboard/account/verify">click here to verify</Link>.</p>}
      <p>Profile picture: <Image src={user.profilePicture ? user.profilePicture : "/default-pfp.jpg" } width={32} height={32} style={{ verticalAlign: "middle", borderRadius: "100%", overflow: "hidden" }} alt=""/> ({user.profilePicture ? <a href={user.profilePicture} target="_blank" rel="noreferrer">link</a> : 'default'})</p>
      <h3><hr/>History<hr/></h3>
      <p title={moment.unix(user.history.joined).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Joined: {user.history.joined > 0 ? moment.unix(user.history.joined).fromNow() : 'never'}</p>
      <p>Created tasks: {user.stats?.tasks}</p>
      <p>Created collections: {user.stats?.collections}</p>
      <hr/>
      <details id="edit">
        <summary onClick={(e) => { dynamicToggle(e, "edit") }}>Edit account details</summary>
        <UserEditForm
            errorMessage={errorMsg}
            successMessage={successMsg}
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
              if (event.currentTarget.profilePicture.value !== event.currentTarget.profilePicture.defaultValue) {body.profilePicture = event.currentTarget.profilePicture.value}

              try {
               await fetchJson(`/api/user`, {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify(body),
               });
               await mutateUser();
               setSuccessMsg("Account saved!");
               document.getElementById("editUserBtn").disabled = false;
             } catch (error) {
               if (error instanceof FetchError) {
                 setErrorMsg(error.data?.message || "An error occurred.");
               } else {
                 console.error("An unexpected error happened:", error);
               }
               document.getElementById("editUserBtn").disabled = false;
             }
           }}
        />
      </details>
      <p style={{ fontStyle: "italic" }} title={user.history.lastEdit?.timestamp > 0 ? moment.unix(user.history.lastEdit?.timestamp).format("dddd, MMMM Do YYYY, h:mm:ss a") : 'Never'}>Last edited {user.history.lastEdit?.timestamp > 0 ? moment.unix(user.history.lastEdit?.timestamp).fromNow() : 'never'}{user.history.lastEdit?.timestamp > 0 && !user.history.lastEdit?.by && ' by an administrator'}</p>
    </Layout>    
  );
}
