export default function addRemoveCollectionForm({ errorMessage, onSubmit, collections, taskId }) {
  const addCollections = collections?.filter(collection => !collection.tasks?.some((element) => element._id === taskId && !element.pending)).map((collection) =>
    <option key={collection._id} value={collection._id}>{collection.name}</option>
  );
  const removeCollections = collections?.filter(collection => collection.tasks?.some((element) => element._id === taskId && !element.pending)).map((collection) =>
    <option key={collection._id} value={collection._id}>{collection.name}</option>
  );
  return (
    <form id="addRemoveCollectionForm" autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Add to collections</span>
        <select name="addCollections" multiple>
          {addCollections}
        </select>
      </label>
      <label>
        <span>Remove from collections</span>
        <select name="removeCollections" multiple>
          {removeCollections}
        </select>
      </label><hr/>

      <button type="submit" id="addRemoveCollectionBtn">Save collection data</button>

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
