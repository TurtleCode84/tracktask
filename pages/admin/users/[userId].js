import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import useUser from "lib/useUser";
import useAdminUser from "lib/useAdminUser";
import { useRouter } from 'next/router'
import moment from "moment";
import Link from "next/link";

export default function Admin() {
  const { user, mutateUser } = useUser({
    redirectTo: "/dashboard",
    adminOnly: true,
  });
  const router = useRouter()
  const { userId } = router.query
  const { lookup } = useAdminUser(user, userId);

  if (!user || !user.isLoggedIn || !user.permissions.admin) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>TrackTask User Admin &#128737;</h1>
      <h2>
        Viewing information for {lookup.username}:
      </h2>
      <p>User ID: {lookup._id}</p>
      <p>Username: {lookup.user}</p>
      <p>Email: <Link href={`mailto:${lookup.email}`}>{lookup.email}</Link></p>
      <p title={moment.unix(lookup.joined).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Joined: {moment.unix(lookup.joined).fromNow()}</p>
      <p>Join IP address: <Link title="Lookup IP address" href={`https://whatismyipaddress.com/ip/${lookup.joinedIp}`}>{lookup.joinedIp}</Link></p>
      <p title={moment.unix(lookup.lastLogin).format("dddd, MMMM Do YYYY, h:mm:ss a")}>Last login: {moment.unix(lookup.lastLogin).fromNow()}</p>
      <p>Admin notes: {lookup.notes}</p>
      <pre>{JSON.stringify(getUser, null, 2)}</pre>
    </Layout>
  );
}
