import moment from "moment";
import { useRouter } from "next/router";
import stringToColor from "lib/stringToColor";

export default function Task({ task, key }) {
  const router = useRouter();
  const collectionTags = task.collections?.map((item, index) =>
    <span key={index} style={{backgroundColor: stringToColor(item), paddingTop: "0.5px", paddingLeft: 4 + "px", paddingBottom: "0.5px", paddingRight: 4 + "px", borderColor: "#d1d854", borderStyle: "solid", borderWidth: 2 + "px", borderRadius: 10 + "px", color: "black", marginTop: 5 + "px", marginLeft: 20 + "px", marginRight: -15 + "px", display: "inline-block" }}>{item}</span>
  );
  return (
    <li key={key} title={task.dueDate !== 0 ? moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a") : 'No due date'} className="list-hover" style={{ margin: "0.5em", background: "#f8f8f8", padding: "8px", borderWidth: "2px", borderStyle: "solid", borderColor: "darkgray", borderRadius: "10px", width: "auto" }} onClick={() => router.push(`/tasks/${task._id}`)}>
      {task.completion.completed !== 0 ? <span title="Completed" style={{ color: "darkgreen" }} className="material-symbols-outlined icon-list">task_alt</span> : null}{task.priority ? <span title="Priority" style={{ color: "red" }} className="material-symbols-outlined icon-list">priority_high</span> : null}{' '}<b>{task.name}:</b> {task.description.length > 30 ? <>{task.description.slice(0,30).trim()}...</> : task.description} (due {task.dueDate !== 0 ? moment.unix(task.dueDate).fromNow() : 'never'})
      <br/>{collectionTags}{task.collections?.[0]}
    </li>
  );
}
