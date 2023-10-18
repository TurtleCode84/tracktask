import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import User from "components/User";
import Report from "components/Report";
import useUser from "lib/useUser";
import useAdminUsers from "lib/useAdminUsers";
import useAdminReports from "lib/useAdminReports";
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
  var dynamicMsg;
  if (deleted === "true") {
    dynamicMsg = "User successfully deleted!"
  }
  const { reports, error: reportsError } = useAdminReports(user, false);
  const reportList = reports?.slice(0,4).map((report) =>
    <span key={report._id} style={{ float: "left", paddingRight: "12px" }}><Report user={user} report={report}/></span>
  );
  const { users: recentlyActive } = useAdminUsers(user, "login", 5);
  const activeUsersList = recentlyActive?.map((activeUser) =>
    <li key={activeUser._id} style={{ margin: "0.5em" }}>
      <User user={user} id={activeUser._id} link={true}/>{activeUser.permissions.admin && <span title="Admin" style={{ color: "slategray" }} className="material-symbols-outlined icon-list">verified_user</span>}{activeUser.permissions.banned && <span title="Banned" style={{ color: "red" }} className="material-symbols-outlined icon-list">block</span>} - Last login {activeUser.history.lastLogin > 0 ? moment.unix(activeUser.history.lastLogin).fromNow() : 'never'}
    </li>
  );
  const { users: recentlyJoined } = useAdminUsers(user, "joined", 5);
  const newUsersList = recentlyJoined?.map((newUser) =>
    <li key={newUser._id} style={{ margin: "0.5em" }}>
      <User user={user} id={newUser._id} link={true}/>{newUser.permissions.admin && <span title="Admin" style={{ color: "slategray" }} className="material-symbols-outlined icon-list">verified_user</span>}{newUser.permissions.banned && <span title="Banned" style={{ color: "red" }} className="material-symbols-outlined icon-list">block</span>} - Joined {newUser.history.joined > 0 ? moment.unix(newUser.history.joined).fromNow() : 'never'}
    </li>
  );

  if (!user || !user.isLoggedIn || user.permissions.banned || !user.permissions.admin) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>TrackTask Admin Panel <span style={{ color: "slategray" }} className="material-symbols-outlined">verified_user</span></h1>
      {dynamicMsg && <p className="success">{dynamicMsg}{' '}<Link href="/admin">Ok</Link></p>}
      <h2>Recent Reports</h2>
      <ul style={{ display: "table" }}>
        {reportList?.length > 0 ? reportList : <li>No reports found!</li>}
      </ul>
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
      <Link href="/admin/users">View all users</Link>
      <p>Useful admin pages:</p>
      <ul style={{ listStyle: "revert", margin: "revert" }}>
        <li><Link href="/admin/users/search">Find a user</Link></li>
        <li><Link href="/admin/tasks">View reported tasks</Link></li>
        <li><Link href="/admin/collections">View reported collections</Link></li>
        <li><Link href="/admin/reports">Moderate reports</Link></li>
      </ul>
      <details>
        <summary>View my raw session info</summary>
        {user && <pre>{JSON.stringify(user, null, 2)}</pre>}
      </details>
    </Layout>
  );
}
