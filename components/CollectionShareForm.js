import fetchJson, { FetchError } from "lib/fetchJson";

export default function CollectionShareForm({ errorMessage, onSubmit }) {
  return (
    <form id="collectionShareForm" autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Username</span>
        <input type="text" name="username" maxlength="55" required />
      </label>
      <label>
        <span>Role</span>
        <select name="role" required>
            <option value="viewer"></option>
            <option value="collaborator"></option>
            <option value="editor"></option>
        </select>
      </label><hr/>

      <button type="submit" id="shareCollectionBtn">Send share request</button>

      {errorMessage && <p className="error">{errorMessage}</p>}<hr/>
       
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
