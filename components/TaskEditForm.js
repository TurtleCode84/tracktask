import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";

export default function TaskEditForm({ errorMessage, onSubmit, task }) {
  const router = useRouter();
  return (
    <form id="taskEditForm" onSubmit={onSubmit}>
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
        <input type="datetime-local" name="dueDate" min="1970-01-01T00:00" />
      </label>
      <label>
        {task.priority ?
        <><span>Unmark as priority</span>
        <input type="checkbox" name="unpriority" /></>
        :
        <><span>Mark as priority</span>
        <input type="checkbox" name="priority" /></>
        }
      </label>
      <label>
        {task.completion.completed ?
        <><span>Mark as not completed</span>
        <input type="checkbox" name="uncomplete" /></>
        :
        <><span>Mark as completed</span>
        <input type="checkbox" name="complete" /></>
        }
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
