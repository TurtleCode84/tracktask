import React, { useState } from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import UserAdminForm from "components/UserAdminForm";
import useUser from "lib/useUser";
import useAdminUser from "lib/useAdminUser";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from 'next/router';
import moment from "moment";
import Link from "next/link";
import Image from "next/image";

export default function UserAdmin() {
  const { user, mutateUser } = useUser({
    redirectTo: "/dashboard",
    adminOnly: true,
  });
  
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { userId } = router.query;
  const { lookup, error } = useAdminUser(user, userId);
  
  if (!user || !user.isLoggedIn || !user.permissions.admin) {
    return (
      <Loading/>
    );
  }
  
  var ipList = [];
  if (lookup?.history.loginIpList) {
    const sortedIpList = lookup?.history.loginIpList.slice(0, 5);
    ipList = sortedIpList?.map((ip, index) =>
      <li key={index} style={{ margin: "0.5em" }}>
        <a href={`https://whatismyipaddress.com/ip/${ip}`} target="_blank" rel="noreferrer">{ip}</a>
      </li>
    );
  }
  var warningList = [];
  if (lookup?.history.warnings) {
    warningList = lookup?.history.warnings.map((warning, index) =>
      <li key={index} style={{ margin: "0.5em" }}>
        {warning}
      </li>
    );
  }
  
  return (
    <Layout>
      <h1>TrackTask User Admin <span style={{ color: "slategray" }} className="material-symbols-outlined">admin_panel_settings</span></h1>
      <h2>
        Viewing information for {lookup ? lookup.username : userId} [{lookup?.permissions.verified ? <span title="Verified" style={{ color: "#006dbe" }} className="material-symbols-outlined">verified</span> : null}{lookup?.permissions.admin ? <span title="Admin" style={{ color: "slategray" }} className="material-symbols-outlined">verified_user</span> : null}{lookup?.permissions.banned ? <span title="Banned" style={{ color: "red" }} className="material-symbols-outlined">block</span> : null}]:
      </h2>
      <Link href="/admin/users">Back to user search</Link><br/>
      <Link href="/admin">Back to admin dashboard</Link><br/>
      {lookup ?
      <><p>{lookup.permissions.banned && <b>This user is banned.</b>}{' '}{lookup.permissions.banned && lookup.history.banReason && <i>Reason: {lookup.history.banReason}</i> }</p>
      <h3>General information</h3>
      <p>User ID: {lookup._id}</p>
      <p>Email: {lookup.email ? <><a href={`mailto:${lookup.email}`} target="_blank" rel="noreferrer">{lookup.email}</a></> : 'none'}</p>
      <p>Share key: <pre>{lookup.shareKey}</pre></p>
      <p>Profile picture: <Image src={lookup.profilePicture ? lookup.profilePicture : "/default-pfp.jpg" } width={32} height={32} alt=""/> ({lookup.profilePicture ? <a href={lookup.profilePicture} target="_blank" rel="noreferrer">link</a> : 'default'})</p>
      <h3>History</h3>
      <p title={moment.unix(lookup.history.joined).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Joined: {lookup.history.joined > 0 ? moment.unix(lookup.history.joined).fromNow() : 'never'}</p>
      <p>Join IP address: {lookup.history.joinedIp ? <a href={`https://whatismyipaddress.com/ip/${lookup.history.joinedIp}`} target="_blank" rel="noreferrer">{lookup.history.joinedIp}</a> : 'none'}</p>
      <details>
        <summary>Last 5 IP addresses</summary>
        <p style={{ fontStyle: "italic" }}>(Newest to oldest)</p>
        <ul>{ipList?.length > 0 ? ipList : 'No IPs found'}</ul>
      </details>
      <p title={moment.unix(lookup.history.lastLogin).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Last login: {lookup.history.lastLogin > 0 ? moment.unix(lookup.history.lastLogin).fromNow() : 'never'}</p>
      <p>Admin notes:</p>{' '}<textarea value={lookup.history.notes ? lookup.history.notes : 'None found!'} rows="3" cols="70" disabled /><br/>
      <br/><details>
        <summary>Warnings</summary>
        <p style={{ fontStyle: "italic" }}>(Newest to oldest)</p>
        <ul>{warningList?.length > 0 ? warningList : 'No warnings found'}</ul>
      </details>
      <p>Acknowledged last warning: {lookup.history.warnings.length > 0 ? <>{lookup.permissions.warned ? <span style={{ color: "red" }} className="material-symbols-outlined icon-list">close</span> : <span style={{ color: "darkgreen" }} className="material-symbols-outlined icon-list">done</span>}</> : 'N\/A'}</p>
      {!lookup.permissions.banned && <p>Last ban reason: {lookup.history.banReason ? lookup.history.banReason : 'none'}</p>}
      <hr/>
      <details>
        <summary>Edit user info</summary>
        <br/><UserAdminForm
            errorMessage={errorMsg}
            lookup={lookup}
            onSubmit={async function handleSubmit(event) {
              event.preventDefault();
              document.getElementById("editUserBtn").disabled = true;
              if (event.currentTarget.password.value !== event.currentTarget.cpassword.value) {
                setErrorMsg("Passwords do not match!");
                document.getElementById("editUserBtn").disabled = false;
                return;
              } else if (event.currentTarget.warn.checked && !event.currentTarget.warning.value) {
                setErrorMsg("Warnings can\'t be blank!");
                document.getElementById("editUserBtn").disabled = false;
                return;
              }
              
              const body = {};
              if (event.currentTarget.username.value !== event.currentTarget.username.defaultValue) {body.username = event.currentTarget.username.value}
              if (event.currentTarget.email.value !== event.currentTarget.email.defaultValue) {body.email = event.currentTarget.email.value}
              if (event.currentTarget.password.value) {body.password = event.currentTarget.password.value}
              if (event.currentTarget.resetShareKey.checked) {body.resetShareKey = event.currentTarget.resetShareKey.checked}
              if (event.currentTarget.profilePicture.value !== event.currentTarget.profilePicture.defaultValue) {body.profilePicture = event.currentTarget.profilePicture.value}
              if (event.currentTarget.notes.value !== event.currentTarget.notes.defaultValue) {body.notes = event.currentTarget.notes.value}
              if (event.currentTarget.clearWarnings.checked) {body.clearWarnings = event.currentTarget.clearWarnings.checked}
              if (event.currentTarget.banReason.value !== event.currentTarget.banReason.defaultValue) {body.banReason = event.currentTarget.banReason.value}
              if (event.currentTarget.warn.checked) {
                body.warn = event.currentTarget.warn.checked;
                body.warning = event.currentTarget.warning.value;
              }
              if (event.currentTarget.verify.checked !== event.currentTarget.verify.defaultChecked) {body.verify = event.currentTarget.verify.checked}
              if (event.currentTarget.admin.checked !== event.currentTarget.admin.defaultChecked) {body.admin = event.currentTarget.admin.checked}
              if (event.currentTarget.ban.checked !== event.currentTarget.ban.defaultChecked) {body.ban = event.currentTarget.ban.checked}

              try {
                await fetchJson(`/api/admin/users/${lookup._id}`, {
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
      </details></>
      :
      <>{error ? <p>{error.data.message}</p> : <p style={{ fontStyle: "italic" }}>Loading user info...</p>}</>
      }
      <br/><details>
        <summary>View raw JSON</summary>
        {error ? <pre>{JSON.stringify(error, null, 2)}</pre> : <pre>{JSON.stringify(lookup, null, 2)}</pre>}
      </details>
    </Layout>
  );
}
