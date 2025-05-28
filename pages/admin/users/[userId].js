import React, { useState } from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import UserAdminForm from "components/UserAdminForm";
import User from "components/User";
import ReportButton from "components/ReportButton";
import useUser from "lib/useUser";
import useAdminUser from "lib/useAdminUser";
import dynamicToggle from "lib/dynamicToggle";
import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";
import moment from "moment";
import Image from "next/image";
import Linkify from "linkify-react";

export default function UserAdmin() {
  const { user } = useUser({
    redirectTo: "/dashboard",
    adminOnly: true,
  });
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();
  const { userId } = router.query;
  const { lookup, error, mutate } = useAdminUser(user, userId);
  
  if (!user || !user.isLoggedIn || user.permissions.banned || !user.permissions.admin) {
    return (
      <Loading/>
    );
  }
  
  var ipList = [];
  if (lookup?.history.loginIpList) {
    const sortedIpList = lookup?.history.loginIpList.slice(0, 5);
    ipList = sortedIpList?.map((ip, index) =>
      <li key={index} title={moment.unix(parseInt(ip.split(",")[1])).format("dddd, MMMM Do YYYY, h:mm:ss a")} style={{ margin: "0.5em" }}>
        <a href={`https://whatismyipaddress.com/ip/${ip.split(",")[0]}`} target="_blank" rel="noreferrer">{ip.split(",")[0]}</a> {parseInt(ip.split(",")[1]) > 0 ? moment.unix(parseInt(ip.split(",")[1])).fromNow() : 'never'}
      </li>
    );
  }
  var warningList = [];
  if (lookup?.history.warnings) {
    warningList = lookup?.history.warnings.map((warning, index) =>
      <li key={index} title={moment.unix(warning.timestamp).format("dddd, MMMM Do YYYY, h:mm:ss a")} style={{ margin: "0.5em" }}>
        &quot;{warning.reason}&quot; {moment.unix(warning.timestamp).fromNow()} by <User user={user} id={warning.by} link={true}/>
      </li>
    );
  }
  
  return (
    <Layout>
      <h1>TrackTask User Admin <span style={{ color: "slategray" }} className="material-symbols-outlined">admin_panel_settings</span></h1>
      <h2>
        Viewing information for {lookup ? lookup.username : userId}{' '}{lookup?.permissions.verified ? <span title="Verified" style={{ color: "#006dbe" }} className="material-symbols-outlined">verified</span> : null}{lookup?.permissions.admin ? <span title="Admin" style={{ color: "slategray" }} className="material-symbols-outlined">verified_user</span> : null}{lookup?.permissions.banned ? <span title="Banned" style={{ color: "red" }} className="material-symbols-outlined">block</span> : null}:
      </h2>
      <a href="#" onClick={(e) => {e.preventDefault();router.back();}}>Back to previous</a><br/>
      {lookup ?
      <><p>{lookup.permissions.banned && <b>This user is banned.</b>}{' '}{lookup.permissions.banned && lookup.history.ban.reason && <i>Reason: {lookup.history.ban.reason}</i> }</p>
      <h3><hr/>General information<hr/></h3>
      <p>User ID: <code>{lookup._id}</code></p>
      <p>Email: {lookup.email ? <><a href={`mailto:${lookup.email}`} target="_blank" rel="noreferrer">{lookup.email}</a></> : 'none'}</p>
      <p>Profile picture: <Image src={lookup.profilePicture ? lookup.profilePicture : "/default-pfp.jpg" } width={32} height={32} style={{ verticalAlign: "middle", borderRadius: "100%", overflow: "hidden" }} quality={85} alt=""/> ({lookup.profilePicture ? <a href={lookup.profilePicture} target="_blank" rel="noreferrer">{lookup.profilePicture}</a> : 'default'})</p>
      <p>Admin notes:</p>{' '}<div className="textarea"><Linkify options={{target:'blank'}}>{lookup.history.notes}</Linkify></div>
      <h3><hr/>History<hr/></h3>
      <p title={moment.unix(lookup.history.joined).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Joined: {lookup.history.joined > 0 ? moment.unix(lookup.history.joined).fromNow() : 'never'} from {lookup.history.joinedIp ? <a href={`https://whatismyipaddress.com/ip/${lookup.history.joinedIp}`} target="_blank" rel="noreferrer">{lookup.history.joinedIp}</a> : 'nowhere'}</p>
      <p title={moment.unix(lookup.history.lastLogin).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Last login: {lookup.history.lastLogin > 0 ? moment.unix(lookup.history.lastLogin).fromNow() : 'never'}</p>
      <details id="logins">
        <summary onClick={(e) => { dynamicToggle(e, "logins", ["start", "center"]) }}>Last 5 logins</summary>
        <ul style={{ listStyle: "revert", margin: "revert" }}>{ipList?.length > 0 ? ipList : 'No logins found'}</ul>
      </details>
      <p title={moment.unix(lookup.history.lastEdit.timestamp).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Last modified: {lookup.history.lastEdit?.timestamp > 0 ? <span title={moment.unix(lookup.history.lastEdit.timestamp).format("dddd, MMMM Do YYYY, h:mm:ss a")}>{moment.unix(lookup.history.lastEdit.timestamp).fromNow()} by <User user={user} id={lookup.history.lastEdit.by} link={true}/></span> : 'never'}</p>
      {!lookup.permissions.banned && <p title={moment.unix(lookup.history.ban.timestamp).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Last banned: {lookup.history.ban.timestamp > 0 ? <>{moment.unix(lookup.history.ban.timestamp).fromNow()} by <User user={user} id={lookup.history.ban.by} link={true}/>{lookup.history.ban.reason && ' for \"' + lookup.history.ban.reason + '\"'}</> : 'never'}</p>}
      <details id="warnings">
        <summary onClick={(e) => { dynamicToggle(e, "warnings", ["start", "center"]) }}>Warnings</summary>
        <ul style={{ listStyle: "revert", margin: "revert" }}>{warningList?.length > 0 ? warningList : 'No warnings found'}</ul>
      </details>
      <p>Acknowledged last warning: {lookup.history.warnings.length > 0 ? <>{lookup.permissions.warned ? <span style={{ color: "red" }} className="material-symbols-outlined icon-list">close</span> : <span style={{ color: "darkgreen" }} className="material-symbols-outlined icon-list">done</span>}</> : 'N\/A'}</p>
      <h3><hr/>Statistics<hr/></h3>
      <p>Tasks created: {lookup?.stats.tasks}</p>
      <p>Collections created: {lookup?.stats.collections}</p>
      <p>Collections shared: {lookup?.stats.shared}</p>
      <hr/>
      <details id="edit">
        <summary onClick={(e) => { dynamicToggle(e, "edit") }}>Edit user info</summary>
        <UserAdminForm
            errorMessage={errorMsg}
            successMessage={successMsg}
            lookup={lookup}
            onSubmit={async function handleSubmit(event) {
              event.preventDefault();
              document.getElementById("editUserBtn").disabled = true;
              if (event.currentTarget.password.value !== event.currentTarget.cpassword.value) {
                setErrorMsg("Passwords do not match!");
                setSuccessMsg("");
                document.getElementById("editUserBtn").disabled = false;
                return;
              } else if (event.currentTarget.warn.checked && !event.currentTarget.warning.value) {
                setErrorMsg("Warnings can\'t be blank!");
                setSuccessMsg("");
                document.getElementById("editUserBtn").disabled = false;
                return;
              }
              
              const body = {};
              if (event.currentTarget.username.value !== event.currentTarget.username.defaultValue) {body.username = event.currentTarget.username.value}
              if (event.currentTarget.email.value !== event.currentTarget.email.defaultValue) {body.email = event.currentTarget.email.value}
              if (event.currentTarget.password.value) {body.password = event.currentTarget.password.value}
              if (event.currentTarget.profilePicture.value !== event.currentTarget.profilePicture.defaultValue) {body.profilePicture = event.currentTarget.profilePicture.value}
              if (event.currentTarget.notes.value !== event.currentTarget.notes.defaultValue) {body.notes = event.currentTarget.notes.value}
              if (event.currentTarget.clearWarnings.checked) {body.clearWarnings = event.currentTarget.clearWarnings.checked}
              if (event.currentTarget.banReason && event.currentTarget.banReason.value !== event.currentTarget.banReason.defaultValue) {body.banReason = event.currentTarget.banReason.value}
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
                });
                await mutate();
                setSuccessMsg("User saved!");
                document.getElementById("editUserBtn").disabled = false;
              } catch (error) {
                if (error instanceof FetchError) {
                  setErrorMsg(error.data?.message || error.message);
                  setSuccessMsg("");
                } else {
                  console.error("An unexpected error happened:", error);
                }
                document.getElementById("editUserBtn").disabled = false;
              }
            }}
        />
      </details></>
      :
      <>{error ? <p>{error.data?.message || error.message}</p> : <p style={{ fontStyle: "italic" }}>Loading user info...</p>}</>
      }
      <details id="raw">
        <summary onClick={(e) => { dynamicToggle(e, "raw") }}>View raw JSON</summary>
        {error ? <pre>{JSON.stringify(error, null, 2)}</pre> : <pre>{JSON.stringify(lookup, null, 2)}</pre>}
      </details><br/>
      <ReportButton user={user} type="user" reported={lookup} flag={true}/>
    </Layout>
  );
}
