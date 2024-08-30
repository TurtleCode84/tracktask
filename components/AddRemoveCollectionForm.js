export default function addRemoveCollectionForm({ errorMessage, successMessage, onSubmit, collections, taskId, isTaskOwner }) {
  const addCollections = collections?.filter(collection => !collection.tasks?.some((element) => element._id === taskId) && (collection.sharing?.role === "owner" || collection.sharing?.role === "contributor")).map((collection) =>
    <option key={collection._id} value={collection._id}>{collection.name}</option>
  );
  const removeCollections = collections?.filter(collection => collection.tasks?.some((element) => element._id === taskId) && (collection.sharing?.role === "owner" || collection.sharing?.role === "contributor")).map((collection) =>
    <option key={collection._id} value={collection._id}>{collection.name}</option>
  );
  return (
    <form id="addRemoveCollectionForm" autocomplete="off" onSubmit={onSubmit}>
      {isTaskOwner && <label>
        <span>Add to collections</span>
        <select name="addCollections" multiple>
          {addCollections}
        </select>
      </label>}
      <label>
        <span>Remove from collections</span>
        <select name="removeCollections" multiple>
          {removeCollections}
        </select>
      </label><hr/>

      <button type="submit" id="addRemoveCollectionBtn">Save collection data</button>

      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && !errorMessage && <p className="success">{successMessage}</p>}<hr/>

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
