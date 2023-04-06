import moment from "moment";
import { useRouter } from "next/router";

export default function Task({ task, key }) {
  const router = useRouter();
  return (
    <li key={key} title={task.dueDate !== 0 ? moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a") : 'No due date'} className="list-hover" style={{ margin: "0.5em", background: "#f8f8f8", padding: "8px", borderWidth: "2px", borderStyle: "solid", borderColor: "darkgray", borderRadius: "10px", width: "auto" }} onClick={() => router.push(`/tasks/${task._id}`)}>
      {task.completion.completed !== 0 ? <span title="Completed" style={{ color: "darkgreen" }} className="material-symbols-outlined icon-list">task_alt</span> : null}{task.priority ? <span title="Priority" style={{ color: "red" }} className="material-symbols-outlined icon-list">priority_high</span> : null}{' '}<b>{task.name}:</b> {task.description.length > 30 ? <>{task.description.slice(0,30).trim()}...</> : task.description} (due {task.dueDate !== 0 ? moment.unix(task.dueDate).fromNow() : 'never'})
    </li>
  );
}
