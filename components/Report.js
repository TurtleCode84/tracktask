import moment from "moment";
import Link from "next/link";
import User from "components/User";
import { useRouter } from "next/router";
import fetchJson from "lib/fetchJson";

export default function Report({ user, report, key }) {
  const router = useRouter();
  var path = "collections";
  if (report.type === "share") {
    delete report.type;
    report.type = "share request";
  } else if (report.type === "user") {
    path = "users";
  } else if (report.type === "task") {
    path = "tasks";
  }
  return (
    <li key={key} style={{ margin: "0.5em", background: "#f8f8f8", padding: "5px", borderWidth: "2px", borderStyle: "solid", borderColor: "darkgray", borderRadius: "10px", width: "auto" }}>
      <p style={{ fontWeight: "bold" }}>{report.reviewed > 0 && <><span title="Reviewed" style={{ color: "darkgreen" }} className="material-symbols-outlined icon-list">task_alt</span>{' '}</>}{moment.unix(report.timestamp).format("dddd, MMMM Do YYYY, h:mm:ss a")}</p><p>Type: {report.type}</p><p>Reported {report.type}: <Link href={`/admin/${path}/${report.reported._id}`}>{report.reported.name}</Link></p><p>Reason: {report.reason}</p><p>Reported by: <User user={user} id={report.reporter} link={true}/></p>{report.reviewed > 0 && <p>Reviewed on: {moment.unix(report.reviewed).format("dddd, MMMM Do YYYY, h:mm:ss a")}</p>}<details><summary>View snapshot</summary><pre>{JSON.stringify(report.reported, null, 2)}</pre></details>
      <br/>{report.reviewed > 0 && <a style={{ paddingRight: "5px" }} href="/api/reports"
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
            //router.reload();
        } catch (error) {
            document.getElementById(`reportErrorMessage-${report._id}`).innerHTML = error.data.message;
        }
        }}
    ><button><span style={{ color: "darkgreen" }} className="material-symbols-outlined icon-list">fact_check</span> Review</button></a>}
    <a href="/api/reports"
        onClick={async (e) => {
        e.preventDefault();
        const confirm = prompt("Are you sure? Deleting a report is permanent! (This feature will be removed if abused.) Type \"yes\" to confirm.");
        if (confirm !== "yes") {return false;}
        try {
            await fetchJson(`/api/reports?id=${report._id}`, { method: "DELETE" });
            //router.reload();
        } catch (error) {
            document.getElementById(`reportErrorMessage-${report._id}`).innerHTML = error.data.message;
        }
        }}
    ><button><span style={{ color: "darkred" }} className="material-symbols-outlined icon-list">delete_forever</span> Delete</button></a>
    <p className="error" id={`reportErrorMessage-${report._id}`} style={{ color: "brown", margin: "1rem 0 0" }}></p>
    </li>
  );
}
