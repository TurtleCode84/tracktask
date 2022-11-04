import moment from "moment";
import Link from "next/link";
import User from "components/User";

export default function Report({ report, key }) {
  const router = useRouter();
  var path = `/admin/collections/${report.reported._id}`;
  if (report.type === "share") {
    delete report.type;
    report.type = "share request";
  } else if (report.type === "user") {
    path = `/admin/users/${report.reported.id}`;
  } else if (report.type === "task") {
    path = `/admin/tasks/${report.reported._id}`;
  }
  return (
    <li key={key} style={{ margin: "0.5em", background: "#f8f8f8", padding: "5px", borderWidth: "2px", borderStyle: "solid", borderColor: "darkgray", borderRadius: "10px", width: "auto" }}>
      {report.reviewed > 0 && <><span title="Reviewed" style={{ color: "darkgreen" }} className="material-symbols-outlined icon-list">task_alt</span>{' '}</>}<p style={{ fontWeight: "bold" }}>{moment.unix(report.timestamp).format("dddd, MMMM Do YYYY, h:mm:ss a")}</p><p>Type: {report.type}</p><p>Reported {report.type}: <Link href={path}>{report.reported.name}</Link></p>
    </li>
  );
}
