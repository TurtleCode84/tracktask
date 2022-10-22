export default function CollectionCreateForm({ verified, errorMessage, onSubmit }) {
  return (
    <form id="collectionCreateForm" autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Name</span>
        <input type="text" name="name" maxlength="55" required />
      </label>
      <label>
        <span>Description</span>
        <textarea name="description" rows="4" cols="30" maxlength="500" required />
      </label><br/>
      {verified ? <>
      <label>
        <span><span style={{ color: "lightslategray" }} className="material-symbols-outlined icon-list">group</span> Shared</span>
        <input type="checkbox" name="shared" />
      </label></>
      : null}

      <button type="submit" id="createCollectionBtn">Create collection</button>

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
