import moment from "moment";
import Link from "next/link";
import User from "components/User";
import fetchJson from "lib/fetchJson";
import dynamicToggle from "lib/dynamicToggle";

export default function Report({ user, report, key, mutate }) {
  var path = "collections";
  if (report.type === "share") {
    delete report.type;
    report.type = "share request";
  } else if (report.type === "user") {
    path = "users";
  } else if (report.type === "task") {
    path = "tasks";
  } else if (report.type === "verify") {
    delete report.type;
    report.type = "verification request";
    path = "users";
  }
  return (
    <li key={key} id={"report-" + report._id} className="report-li" style={{ margin: "0.5em", background: "var(--element-background)", padding: "5px 20px", borderWidth: "2px", borderStyle: "solid", borderColor: "var(--border-color)", borderRadius: "10px", width: "auto" }}>
      <p style={{ fontWeight: "bold" }}>{report.reviewed > 0 && <><span title="Reviewed" style={{ color: "darkgreen" }} className="material-symbols-outlined icon-list">task_alt</span>{' '}</>}{moment.unix(report.timestamp).format("dddd, MMMM Do YYYY, h:mm:ss a")}</p><p>Type: {report.type}</p><p>Reported {report.type}: {report.type === "user" ? <User user={user} id={report.reported._id} link={true}/> : <Link href={`/admin/${path}/${report.reported._id}`}>{report.reported.name}</Link>}</p><p>Reason: {report.reason}</p><p>Reported by: <User user={user} id={report.reporter} link={true}/></p>{report.reviewed > 0 && <p>Reviewed on: {moment.unix(report.reviewed).format("dddd, MMMM Do YYYY, h:mm:ss a")}</p>}<details id={`snapshot-${report._id}`}><summary onClick={(e) => { dynamicToggle(e, `snapshot-${report._id}`, ["start", "center"]) }}>View snapshot</summary><pre>{JSON.stringify(report.reported, null, 2)}</pre></details>
      {/* Fix later */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <br/>{report.reviewed === 0 && <a style={{ paddingRight: "5px" }} href="/api/reports"
        onClick={async (e) => {
        e.preventDefault();
        try {
            await fetchJson("/api/reports", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: report._id,
                }),
            });
            await mutate();
        } catch (error) {
            document.getElementById(`reportErrorMessage-${report._id}`).innerHTML = error.data?.message || error.message;
        }
        }}
    ><button><span style={{ color: "darkgreen" }} className="material-symbols-outlined icon-list">fact_check</span> Review</button></a>}
    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
    <a href="/api/reports"
      onClick={async (e) => {
        e.preventDefault();
        if (confirm("Are you sure? Deleting a report is permanent!")) {
          try {
              await fetchJson(`/api/reports?id=${report._id}`, { method: "DELETE" });
              await mutate();
          } catch (error) {
              document.getElementById(`reportErrorMessage-${report._id}`).innerHTML = error.data?.message || error.message;
          }
        }
      }}
    ><button><span style={{ color: "darkred" }} className="material-symbols-outlined icon-list">delete_forever</span> Delete</button></a>
    <p className="error" id={`reportErrorMessage-${report._id}`} style={{ color: "brown", margin: "1rem 0 0" }}></p>
    </li>
  );
}
