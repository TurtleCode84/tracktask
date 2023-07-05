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
            <option value="viewer">Viewer (can view the collection)</option>
            <option value="collaborator">Collaborator (can complete tasks ඞ)</option>
            <option value="contributor">Contributor (can add to the collection)</option>
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
      `}</style>
    </form>
  );
}
