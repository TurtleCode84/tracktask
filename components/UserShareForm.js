import fetchJson, { FetchError } from "lib/fetchJson";

export default function UserShareForm({ errorMessage, onSubmit, share, collectionId }) {
  const role = share.role.split("-");
  return (
    <form id={share.id} autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Role</span>
        <select name="role" selected={role[1] ? role[1] : role[0]} required>
            <option value="viewer">Viewer (can view the collection)</option>
            <option value="collaborator">Collaborator (can complete tasks ඞ)</option>
            <option value="contributor">Contributor (can add to the collection)</option>
        </select>
      </label><hr/>

      <button type="submit" id="modifyUserShareBtn">Modify share settings</button>

      {errorMessage && <p className="error">{errorMessage}</p>}<hr/>
      
      <a href={`/api/collections/${collectionId}`}
        onClick={async (e) => {
          e.preventDefault();
          if (confirm("Are you sure? This user will lose access to the tasks in this collection!")) {
            const body = {
              action: "remove",
              id: share.id,
            };
            try {
              await fetchJson(`/api/collections/${collectionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              });
              router.push(`/collections/${collection._id}/share?removed=true`);
            } catch (error) {
              document.getElementById("removeShareMessage").innerHTML = error.data.message;
            }
          }
        }}
      ><button><span style={{ color: "darkslategray" }} className="material-symbols-outlined icon-list">person_remove</span> Remove user</button></a>
      <p className="error" id="removeShareMessage"></p>

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
