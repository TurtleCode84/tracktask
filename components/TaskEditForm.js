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
        <span>Due Date</span>
        <input type="datetime-local" name="dueDate" defaultValue={moment.unix(task.dueDate).format(moment.HTML5_FMT.DATETIME_LOCAL)} min="1970-01-01T00:00" />
      </label>
      <label>
        <span>&#10071; Priority</span>
        <input type="checkbox" name="priority" defaultChecked={task.priority} />
      </label>
      <label>
        <span>&#9989; Completed</span>
        <input type="checkbox" name="complete" defaultChecked={task.completion.completed ? true : false} />
      </label><hr/>

      <button type="submit" id="editTaskBtn">Edit task data</button>

      {errorMessage && <p className="error">{errorMessage}</p>}<hr/>
       
      <a href={`/api/tasks?id=${task._id}`}
        onClick={async (e) => {
          e.preventDefault();
          const confirm = prompt("Are you sure? Deleting a task is irreversable! Type \"yes\" to confirm.");
          if (confirm.trim().toLowerCase() === "yes") {
            try {
              await fetchJson(`/api/tasks?id=${task._id}`, { method: "DELETE" });
              router.push("/dashboard?deleted=true");
            } catch (error) {
              document.getElementById("deleteTaskMessage").innerHTML = error.data.message;
            }
          }
        }}
      ><>&#9888;</> Delete task <>&#9888;</></a>
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
        textarea {
          resize: none;
        }
        .error {
          color: brown;
          margin: 1rem 0 0;
        }
      `}</style>
    </form>
  );
}
