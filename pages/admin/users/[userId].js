import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import useUser from "lib/useUser";
import useAdminUser from "lib/useAdminUser";
import { useRouter } from 'next/router';
import moment from "moment";
import Link from "next/link";

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
      <Link target="_blank" href={`https://whatismyipaddress.com/ip/${ip}`}>{ip}</Link>
    </li>
  );
  
  return (
    <Layout>
      <h1>TrackTask User Admin &#128737;</h1>
      <h2>
        Viewing information for {lookup ? lookup.username : userId}:
      </h2>
      {lookup ?
      <><p>User ID: {lookup._id}</p>
      <p>Username: {lookup.username}</p>
      <p>Email: <Link target="_blank" href={`mailto:${lookup.email}`}>{lookup.email}</Link></p>
      <p title={moment.unix(lookup.history.joined).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Joined: {moment.unix(lookup.history.joined).fromNow()}</p>
      <p>Join IP address: <Link target="_blank" href={`https://whatismyipaddress.com/ip/${lookup.history.joinedIp}`}>{lookup.history.joinedIp}</Link></p>
      <details>
        <summary>Last 5 IP addresses</summary>
        <p style={{ fontStyle: "italic" }}>(Newest to oldest)</p>
        <ul>{ipList}</ul>
       </details>
      <p title={moment.unix(lookup.history.lastLogin).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Last login: {moment.unix(lookup.history.lastLogin).fromNow()}</p>
      <p>Admin notes: {lookup.history.notes}</p></>
      :
      <p style={{ fontStyle: "italic" }}>Loading user info...</p>
      }
      <pre>{JSON.stringify(lookup, null, 2)}</pre>
    </Layout>
  );
}
