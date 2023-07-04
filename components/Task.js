import moment from "moment";
import { useRouter } from "next/router";
import stringToColor from "lib/stringToColor";

export default function Task({ task, key }) {
  const router = useRouter();
  const collectionTags = task.collections?.map((item, index) =>
    <span key={index} className="list-inset" style={{backgroundColor: stringToColor(item.name), paddingTop: "0.5px", paddingLeft: "4px", paddingBottom: "0.5px", paddingRight: "4px", borderStyle: "solid", borderWidth: "2px", borderColor: "var(--inset-border-color)", borderRadius: "7px", color: "#111", marginTop: "5px", marginLeft: "20px", marginRight: "-15px", display: "inline-block", filter: "grayscale(0.4) brightness(1.5)" }}>{item.name}</span>
  );
  return (
    <li key={key} title={task.dueDate !== 0 ? moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a") : 'No due date'} className="list-hover" style={{ margin: "0.5em", background: "var(--element-background)", padding: "8px", borderWidth: "2px", borderStyle: "solid", borderColor: "var(--border-color)", borderRadius: "10px", width: "auto" }} onClick={() => router.push(`/tasks/${task._id}`)}>
      {task.completion.completed !== 0 ? <span title="Completed" style={{ color: "darkgreen" }} className="material-symbols-outlined icon-list">task_alt</span> : null}{task.priority ? <span title="Priority" style={{ color: "red" }} className="material-symbols-outlined icon-list">priority_high</span> : null}{' '}<b>{task.name}:</b> {task.description.length > 30 ? <>{task.description.slice(0,30).trim()}...</> : task.description} (due {task.dueDate !== 0 ? moment.unix(task.dueDate).fromNow() : 'never'})
      <br/>{collectionTags}
    </li>
  );
}
