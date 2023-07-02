import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";
import moment from "moment";

export default function TaskEditForm({ errorMessage, onSubmit, task }) {
  const router = useRouter();
  return (
    <form id="taskEditForm" autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Name</span>
        <input type="text" name="name" defaultValue={task.name} maxlength="55" />
      </label>
      <label>
        <span>Description</span>
        <textarea name="description" rows="4" cols="30" defaultValue={task.description} maxlength="500" />
      </label><hr/>
      <label>
        <span>Due Date (<a style={{fontWeight: "400"}} href={`/task/${task._id}`}
        onClick={async (e) => {
          e.preventDefault();
          document.getElementById("editTaskBtn").disabled = true;
          document.getElementById("dueDate").value = "";
          document.getElementById("editTaskBtn").disabled = false;
        }}
        >remove</a>)</span>
        <input type="datetime-local" id="dueDate" name="dueDate" defaultValue={task.dueDate !== 0 && moment.unix(task.dueDate).format(moment.HTML5_FMT.DATETIME_LOCAL)} min="1970-01-01T00:00" />
      </label>
      <label>
        <span>Priority <span style={{ color: "red" }} className="material-symbols-outlined icon-list">priority_high</span></span>
        <input type="checkbox" name="priority" defaultChecked={task.priority} />
      </label>
      <label>
        <span>Completed <span style={{ color: "darkgreen" }} className="material-symbols-outlined icon-list">task_alt</span></span>
        <input type="checkbox" name="complete" defaultChecked={task.completion.completed ? true : false} />
      </label><hr/>

      <button type="submit" id="editTaskBtn">Save task data</button>

      {errorMessage && <p className="error">{errorMessage}</p>}<hr/>
       
      <a href={`/api/tasks/${task._id}`}
        onClick={async (e) => {
          e.preventDefault();
          if (confirm("Are you sure? Deleting a task is irreversable!")) {
            try {
              await fetchJson(`/api/tasks/${task._id}`, { method: "DELETE" });
              router.push("/dashboard?deleted=t");
            } catch (error) {
              document.getElementById("deleteTaskMessage").innerHTML = error.data.message;
            }
          }
        }}
      ><button><span style={{ color: "orange" }} className="material-symbols-outlined icon-list">warning</span> Delete task <span style={{ color: "orange" }} className="material-symbols-outlined icon-list">warning</span></button></a>
      <p className="error" id="deleteTaskMessage"></p>

      <style jsx>{`
        form,
        label {
          display: flex;
          flex-flow: column;
        }
        label > span {
          font-weight: 600;
        }
        input {
          padding: 8px;
          margin: 0.3rem 0 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          max-width: 400px;
        }
        input[type="checkbox"] {
          margin: 0;
          vertical-align: middle;
          width: 15px !important;
          margin-bottom: 10px;
        }
      `}</style>
    </form>
  );
}
