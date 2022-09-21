import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import useUser from "lib/useUser";
import useAdminUser from "lib/useAdminUser";
import { useRouter } from 'next/router';
import moment from "moment";
import Link from "next/link";
import Image from "next/image";

export default function UserAdmin() {
  const { user, mutateUser } = useUser({
    redirectTo: "/dashboard",
    adminOnly: true,
  });
  
  const router = useRouter();
  const { userId } = router.query;
  const { lookup } = useAdminUser(user, userId);

  if (!user || !user.isLoggedIn || !user.permissions.admin) {
    return (
      <Loading/>
    );
  }
  
  const pureIpList = lookup?.history.loginIpList;
  const sortedIpList = pureIpList?.reverse().slice(0, 6);
  const ipList = sortedIpList?.map((ip, index) =>
    <li key={index}>
      <a href={`https://whatismyipaddress.com/ip/${ip}`} target="_blank" rel="noreferrer">{ip}</a>
    </li>
  );
  
  return (
    <Layout>
      <h1>TrackTask User Admin &#128737;</h1>
      <h2>
        Viewing information for {lookup ? lookup.username : userId}:
      </h2>
      <Link href="/admin/users">Back to user search</Link><br/>
      {lookup ?
      <><p>User ID: {lookup._id}</p>
      <p>Username: {lookup.username}</p>
      <p>Email: <a href={`mailto:${lookup.email}`} target="_blank" rel="noreferrer">{lookup.email}</a></p>
      <p>Password (hashed): <pre>{lookup.password}</pre></p>
      <p>Share key: {lookup.shareKey}</p>
      <p>Profile picture: <Image src={lookup.profilePicture ? lookup.profilePicture : "/default-pfp.jpg" } width={32} height={32} alt=""/> ({lookup.profilePicture ? <a href={lookup.profilePicture} target="_blank" rel="noreferrer">link</a> : 'default'})</p>
      <p title={moment.unix(lookup.history.joined).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Joined: {moment.unix(lookup.history.joined).fromNow()}</p>
      <p>Join IP address: <a href={`https://whatismyipaddress.com/ip/${lookup.history.joinedIp}`} target="_blank" rel="noreferrer">{lookup.history.joinedIp}</a></p>
      <details>
        <summary>Last 5 IP addresses</summary>
        <p style={{ fontStyle: "italic" }}>(Newest to oldest)</p>
        <ul>{ipList.length > 0 ? ipList : 'No IPs found'}</ul>
       </details>
      <p title={moment.unix(lookup.history.lastLogin).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Last login: {moment.unix(lookup.history.lastLogin).fromNow()}</p>
      <p>Admin notes: {lookup.history.notes}</p>
      <p>Is admin: {lookup.permissions.admin ? <>&#9989;</> : <>&#10060;</>}</p>
      <p>Is verified: {lookup.permissions.verified ? <>&#9989;</> : <>&#10060;</>}</p>
      <p>Is banned: {lookup.permissions.banned ? <>&#9989;</> : <>&#10060;</>}</p>
      <p>Last ban reason: {lookup.history.banReason ? lookup.history.banReason : 'none'}</p></>
      :
      <>{lookup === undefined && <p style={{ fontStyle: "italic" }}>Loading user info...</p>}
      {lookup === null && <p>User does not exist</p>}</>
      }
      <details>
        <summary>View raw JSON</summary>
        <pre>{JSON.stringify(lookup, null, 2)}</pre>
      </details>
    </Layout>
  );
}
