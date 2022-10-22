import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";

export default function CollectionEditForm({ errorMessage, onSubmit, collection }) {
  const router = useRouter();
  return (
    <form id="collectionEditForm" autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Name</span>
        <input type="text" name="name" defaultValue={collection.name} maxlength="55" />
      </label>
      <label>
        <span>Description</span>
        <textarea name="description" rows="4" cols="30" defaultValue={collection.description} maxlength="500" />
      </label><hr/>
      <label>
        <span>Shared <span style={{ color: "lightslategray" }} className="material-symbols-outlined icon-list">group</span></span>
        <input type="checkbox" name="shared" defaultChecked={collection.sharing.shared} />
      </label><hr/>

      <button type="submit" id="editCollectionBtn">Edit collection data</button>

      {errorMessage && <p className="error">{errorMessage}</p>}<hr/>
       
      <a href={`/api/tasks?collection=true&id=${collection._id}`}
        onClick={async (e) => {
          e.preventDefault();
          const confirm = prompt("Are you sure? Deleting a collection is irreversable! Type \"yes\" to confirm.");
          if (confirm.trim().toLowerCase() === "yes") {
            try {
              await fetchJson(`/api/tasks?collection=true&id=${collection._id}`, { method: "DELETE" });
              router.push("/dashboard?deleted=true");
            } catch (error) {
              document.getElementById("deleteCollectionMessage").innerHTML = error.data.message;
            }
          }
        }}
      ><button><span style={{ color: "orange" }} className="material-symbols-outlined icon-list">warning</span> Delete collection <span style={{ color: "orange" }} className="material-symbols-outlined icon-list">warning</span></button></a>
      <p className="error" id="deleteCollectionMessage"></p>

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
