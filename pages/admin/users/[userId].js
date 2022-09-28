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
  
  var ipList
  if (lookup?.history.loginIpList) {
    const sortedIpList = lookup?.history.loginIpList.slice(0, 5);
    ipList = sortedIpList?.map((ip, index) =>
      <li key={index}>
        <a href={`https://whatismyipaddress.com/ip/${ip}`} target="_blank" rel="noreferrer">{ip}</a>
      </li>
    );
  }
  var warningList;
  if (lookup?.history.warnings) {
    warningList = lookup?.history.warnings.map((warning, index) =>
      <li key={index}>
        {warning}
      </li>
    );
  }
  
  return (
    <Layout>
      <h1>TrackTask User Admin &#128737;</h1>
      <h2>
        Viewing information for {lookup ? lookup.username : userId} [{lookup?.permissions.verified ? <>&#9989;</> : null}{lookup?.permissions.admin ? <>&#128737;</> : null}{lookup?.permissions.banned ? <>&#10060;</> : null}]:
      </h2>
      <Link href="/admin/users">Back to user search</Link><br/>
      <Link href="/admin">Back to admin dashboard</Link><br/>
      {lookup ?
      <><p>{lookup.permissions.banned && <b>This user is banned.</b>}{' '}{lookup.permissions.banned && lookup.history.banReason && <i>Reason: {lookup.history.banReason}</i> }</p>
      <h3>General information</h3>
      <p>User ID: {lookup._id}</p>
      <p>Username: {lookup.username}</p>
      <p>Email: <a href={`mailto:${lookup.email}`} target="_blank" rel="noreferrer">{lookup.email}</a></p>
      <p>Password (hashed): <pre>{lookup.password}</pre></p>
      <p>Share key: {lookup.shareKey ? <pre>{lookup.shareKey}</pre> : 'none'}</p>
      <p>Profile picture: <Image src={lookup.profilePicture ? lookup.profilePicture : "/default-pfp.jpg" } width={32} height={32} alt=""/> ({lookup.profilePicture ? <a href={lookup.profilePicture} target="_blank" rel="noreferrer">link</a> : 'default'})</p>
      <h3>History</h3>
      <p title={moment.unix(lookup.history.joined).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Joined: {lookup.history.joined > 0 ? moment.unix(lookup.history.joined).fromNow() : 'never'}</p>
      <p>Join IP address: {lookup.history.joinedIp ? <a href={`https://whatismyipaddress.com/ip/${lookup.history.joinedIp}`} target="_blank" rel="noreferrer">{lookup.history.joinedIp}</a> : 'none'}</p>
      <details>
        <summary>Last 5 IP addresses</summary>
        <p style={{ fontStyle: "italic" }}>(Newest to oldest)</p>
        <ul>{ipList.length > 0 ? ipList : 'No IPs found'}</ul>
      </details>
      <p title={moment.unix(lookup.history.lastLogin).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Last login: {lookup.history.lastLogin > 0 ? moment.unix(lookup.history.lastLogin).fromNow() : 'never'}</p>
      <p>Admin notes: {lookup.history.notes ? lookup.history.notes : 'none'}</p>
      {warningList &&
      <><details>
        <summary>Warnings</summary>
        <p style={{ fontStyle: "italic" }}>(Newest to oldest)</p>
        <ul>{warningList.length > 0 ? warningList : 'No warnings found'}</ul>
      </details></>}
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
              
              const body = {
                username: event.currentTarget.username.value,
                email: event.currentTarget.email.value,
                password: event.currentTarget.password.value,
                resetShareKey: event.currentTarget.resetShareKey.checked,
                profilePicture: event.currentTarget.profilePicture.value,
                removeProfilePicture: event.currentTarget.removeProfilePicture.checked,
                notes: event.currentTarget.notes.value,
                //toggleAdmin: event.currentTarget.toggleAdmin.checked,
                //clearWarnings: event.currentTarget.clearWarnings.checked,
                banReason: event.currentTarget.banReason.value,
              };
              
              if (event.currentTarget.verify && event.currentTarget.verify.checked) {
                body.verify = true;
              } else if (event.currentTarget.unverify && event.currentTarget.unverify.checked) {
                body.verify = false;
              }
              if (event.currentTarget.warn.checked) {
                body.warn = true;
                body.warning = event.currentTarget.warning.value;
              } else {
                body.warn = false;
              }
              if (event.currentTarget.ban && event.currentTarget.ban.checked) {
                body.ban = true;
              } else if (event.currentTarget.unban && event.currentTarget.unban.checked) {
                body.ban = false;
              }

              try {
                const getUrl = await fetchJson(`/api/admin/users/${lookup._id}`, {
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
