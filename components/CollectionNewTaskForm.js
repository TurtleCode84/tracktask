import dynamicToggle from "lib/dynamicToggle";

export default function CollectionNewTaskForm({ errorMessage, successMessage, onSubmit }) {
  return (
    <form id="collectionNewTaskForm" autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Name</span>
        <input type="text" name="name" maxlength={process.env.NEXT_PUBLIC_MAXLENGTH_TITLE} autoFocus required />
      </label>
      <details id="adetails">
      <summary onClick={(e) => { dynamicToggle(e, "adetails") }}>Additional details</summary><br/>
      <label>
        <span>Description (optional)</span>
        <textarea name="description" rows="8" cols="30" maxlength={process.env.NEXT_PUBLIC_MAXLENGTH_DESCRIPTION} />
      </label><br/>
      <label>
        <span>Due Date (optional)</span>
        <input type="datetime-local" name="dueDate" min="1970-01-01T00:00" />
      </label>
      <label>
        <span>Mark as priority</span>
        <input type="checkbox" name="markPriority" />
      </label>
      </details><br/>

      <button type="submit" id="createTaskBtn">Create task</button>

      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && !errorMessage && <p className="success">{successMessage}</p>}

      <style jsx>{`
        form,
        label {
          display: flex;
          flex-flow: column;
        }
        label > span {
          font-weight: 600;
        }
        input, select {
          padding: 8px;
          margin: 0.3rem 0 1rem;
          max-width: 400px;
        }
        input[type="checkbox"] {
          margin: 0;
          vertical-align: middle;
          width: 15px !important;
          margin-bottom: 10px;
        }
        textarea {
          border-color: var(--input-border-color);
        }
      `}</style>
    </form>
  );
}