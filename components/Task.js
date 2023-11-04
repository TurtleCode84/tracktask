import moment from "moment";
import { useRouter } from "next/router";
import stringToColor from "lib/stringToColor";

export default function Task({ task, key, admin }) {
  const router = useRouter();
  const collectionTags = task.collections?.map((item, index) =>
    <span key={index} style={{backgroundColor: stringToColor(item.name), padding: "0.5px 4px", borderStyle: "solid", borderWidth: "2px", borderColor: "var(--inset-border-color)", borderRadius: "7px", color: "#111", marginRight: "5px", display: "inline-block", filter: "grayscale(0.4) brightness(1.5)" }} onClick={(e) => {e.stopPropagation(); router.push(`/${admin === true ? 'admin/' : ''}collections/${item._id}`);}}>{item.name}</span>
  );
  return (
    <li key={key} title={task.dueDate > 0 ? moment.unix(task.dueDate).format("dddd, MMMM Do YYYY, h:mm:ss a") : 'No due date'} className="list-hover" style={{ margin: "0.5em", background: "var(--element-background)", padding: "8px", borderWidth: "2px", borderStyle: "solid", borderColor: "var(--border-color)", borderRadius: "10px", width: "auto" }} onClick={() => router.push(`/${admin === true ? 'admin/' : ''}tasks/${task._id}`)}>
      {task.completion.completed > 0 ? <span title="Completed" style={{ color: "darkgreen", marginRight: "5px" }} className="material-symbols-outlined icon-list">task_alt</span> : null}{task.priority ? <span title="Priority" style={{ color: "red", marginRight: "5px" }} className="material-symbols-outlined icon-list">label_important</span> : null}{collectionTags}<b>{task.name}</b>{' '}({task.completion.completed > 0 ? <>completed {moment.unix(task.completion.completed).fromNow()}</> : <>due {task.dueDate > 0 ? moment.unix(task.dueDate).fromNow() : 'never'}</>})
      <br/><span style={{ marginLeft: "25px", color: "#555" }}>{task.description.length > 65 ? <>{task.description.slice(0,65).trim()}...</> : task.description}</span>
    </li>
  );
}
