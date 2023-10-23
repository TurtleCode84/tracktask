import React from "react";
import Layout from "components/Layout";
import Loading from "components/Loading";
import Report from "components/Report";
import Link from "next/link";
import useUser from "lib/useUser";
import useAdminReports from "lib/useAdminReports";
import { useRouter } from 'next/router';

export default function ReportsAdmin() {
  const { user } = useUser({
    redirectTo: "/login",
    adminOnly: true,
  });
  const router = useRouter();
  const { reviewed } = router.query;
  const { reports, error: reportsError } = useAdminReports(user, reviewed);
  const reportList = reports?.map((report) =>
    <Report user={user} report={report} key={report._id}/>
  );
  
  if (!user || !user.isLoggedIn || user.permissions.banned || !user.permissions.admin) {
    return (
      <Loading/>
    );
  }
  return (
    <Layout>
      <h1>Reports:</h1>
      <Link href="/admin">Back to admin dashboard</Link><br/>
      <br/><Link href={`/admin/reports${!reviewed ? "?reviewed=true" : ""}`}><button>{reviewed ? 'Hide' : 'Show'} reviewed reports</button></Link><br/>
      {reportList === undefined || reportsError ?
      <>
      {reportsError ? <p style={{ fontStyle: "italic" }}>{reportsError.data ? reportsError.data.message : reportsError.message}</p> : <p style={{ fontStyle: "italic" }}>Loading reports...</p>}
      </>
      :
      <><ul style={{ display: "table" }}>
        {reportList.length > 0 ? reportList : <li>No reports found!</li>}
      </ul></>
      }
    </Layout>    
  );
}
