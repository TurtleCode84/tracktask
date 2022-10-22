import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import useUser from "lib/useUser";
import useAdminUsers from "lib/useAdminUsers";
import moment from "moment";
import Link from "next/link";
import { useRouter } from 'next/router'

export default function Admin() {
  const { user, mutateUser } = useUser({
    redirectTo: "/dashboard",
    adminOnly: true,
  });
  const router = useRouter();
  const { deleted } = router.query;
  var deletedMsg;
  if (deleted === "true") {
    deletedMsg = "User successfully deleted!"
  }
  const { users: recentlyActive } = useAdminUsers(user, "login", 5);
  const activeUsersList = recentlyActive?.map((activeUser) =>
    <li key={activeUser._id} style={{ margin: "0.5em" }}>
      <Link href={`/admin/users/${activeUser._id}`}>{activeUser.username}</Link>{activeUser.permissions.verified ? <>{' '}<span title="Verified" style={{ color: "#006dbe" }} className="material-symbols-outlined icon-list">verified</span></> : null}{activeUser.permissions.admin ? <>{' '}<span title="Admin" style={{ color: "slategray" }} className="material-symbols-outlined icon-list">verified_user</span></> : null}{activeUser.permissions.banned ? <>{' '}<span title="Banned" style={{ color: "red" }} className="material-symbols-outlined icon-list">block</span></> : null} - Last login {activeUser.history.lastLogin > 0 ? moment.unix(activeUser.history.lastLogin).fromNow() : 'never'}
    </li>
  );
  const { users: recentlyJoined } = useAdminUsers(user, "joined", 5);
  const newUsersList = recentlyJoined?.map((newUser) =>
    <li key={newUser._id} style={{ margin: "0.5em" }}>
      <Link href={`/admin/users/${newUser._id}`}>{newUser.username}</Link>{newUser.permissions.verified ? <>{' '}<span title="Verified" style={{ color: "#006dbe" }} className="material-symbols-outlined icon-list">verified</span></> : null}{newUser.permissions.admin ? <>{' '}<span title="Admin" style={{ color: "slategray" }} className="material-symbols-outlined icon-list">verified_user</span></> : null}{newUser.permissions.banned ? <>{' '}<span title="Banned" style={{ color: "red" }} className="material-symbols-outlined icon-list">block</span></> : null} - Joined {newUser.history.joined > 0 ? moment.unix(newUser.history.joined).fromNow() : 'never'}
    </li>
  );

  if (!user || !user.isLoggedIn || !user.permissions.admin) {
    return (
      <Loading/>
    );
  }
  return (
    <><Layout>
      <h1>TrackTask Admin Panel <span style={{ color: "slategray" }} className="material-symbols-outlined">verified_user</span></h1>
      {deletedMessage && <p className="success">{deletedMessage}</p>}
      <h2>Recent Reports</h2>
      <p style={{fontStyle: "italic"}}>(Coming soon...)</p>
      <h2>User Statistics</h2>
      <h3>Recently active:</h3>
      <ul>
        {activeUsersList ? activeUsersList : 'Loading active users...'}
        {activeUsersList && activeUsersList === null && <>No active users found</>}
      </ul>
      <h3>Recently joined:</h3>
      <ul>
        {newUsersList ? newUsersList : 'Loading new users...'}
        {newUsersList && newUsersList === null && <>No new users found</>}
      </ul>
      <p>All admin pages:</p>
      <ul>
        <li><Link href="/admin/users">User Admin</Link></li>
        <li>Task Admin <span style={{fontStyle: "italic"}}>(Coming soon...)</span></li>
        <li>Reports <span style={{fontStyle: "italic"}}>(Coming soon...)</span></li>
      </ul>
      <details>
        <summary>View my raw session info</summary>
        {user && (
          <>
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </>
        )}
      </details>
    </Layout>
    <style jsx>{`
      .success {
        color: darkgreen;
        margin: 1rem 0 0;
      }
    `}</style></>
  );
}
