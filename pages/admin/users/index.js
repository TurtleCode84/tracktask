import React from "react";
import moment from "moment";
import Layout from "components/Layout";
import Loading from "components/Loading";
import User from "components/User";
import Link from "next/link";
import useUser from "lib/useUser";
import useAdminUsers from "lib/useAdminUsers";
import { useRouter } from "next/router";

export default function UsersAdmin() {
  const { user } = useUser({
    redirectTo: "/login",
    adminOnly: true,
  });
  const router = useRouter();
  const { c } = router.query;
  var count;
  if (parseInt(c)) {
    count = parseInt(c);
  } else {
    count = 25;
  }
  
  const { users: allUsers, error: allUsersError } = useAdminUsers(user, "joined", count);
  const allUsersList = allUsers?.map((item) =>
    <li key={item._id} style={{ margin: "0.5em" }}>
      <User user={user} id={item._id} link={true}/>{item.permissions.admin && <span title="Admin" style={{ color: "slategray" }} className="material-symbols-outlined icon-list">verified_user</span>}{item.permissions.banned && <span title="Banned" style={{ color: "red" }} className="material-symbols-outlined icon-list">block</span>} &bull; Last login {item.history.lastLogin > 0 ? moment.unix(item.history.lastLogin).fromNow() : 'never'}
    </li>
  );
  
  if (!user || !user.isLoggedIn || user.permissions.banned || !user.permissions.admin) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>All users:</h1>
      <a href="#" onClick={(e) => {e.preventDefault();router.back();}}>Back to previous</a><br/>
      {allUsersList === undefined || allUsersError ?
      <>
      {allUsersError ? <p style={{ fontStyle: "italic" }}>{allUsersError.data ? allUsersError.data.message : allUsersError.message}</p> : <p style={{ fontStyle: "italic" }}>Loading users...</p>}
      </>
      :
      <><ul style={{ display: "table" }}>
        {allUsersList}
      </ul>
      <p>Show more users &raquo; <Link href="/admin/users">25</Link> | <Link href="/admin/users?c=50">50</Link> | <Link href="/admin/users?c=100">100</Link> | <Link href="/admin/users?c=500">500</Link></p></>
      }
    </Layout>    
  );
}
