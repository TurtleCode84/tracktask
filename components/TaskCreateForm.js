export default function TaskCreateForm({ errorMessage, onSubmit }) {
  return (
    <form id="taskCreateForm" autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Name</span>
        <input type="text" name="name" maxlength="55" required />
      </label>
      <label>
        <span>Description</span>
        <textarea name="description" rows="4" cols="30" maxlength="500" required />
      </label><br/>
      <label>
        <span>Due Date (optional)</span>
        <input type="datetime-local" name="dueDate" min="1970-01-01T00:00" />
      </label>
      <label>
        <span>Mark as priority</span>
        <input type="checkbox" name="markPriority" />
      </label>

      <button type="submit" id="createTaskBtn">Create task</button>

      {errorMessage && <p className="error">{errorMessage}</p>}

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
