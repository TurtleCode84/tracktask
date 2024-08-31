import fetchJson from "lib/fetchJson";
import { useRouter } from "next/router";

export default function CollectionEditForm({ verified, errorMessage, successMessage, onSubmit, collection }) {
  const router = useRouter();
  return (
    <form id="collectionEditForm" autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Name</span>
        <input type="text" name="name" defaultValue={collection.name} maxlength={process.env.NEXT_PUBLIC_MAXLENGTH_TITLE} required />
      </label>
      <label>
        <span>Description</span>
        <textarea name="description" rows="4" cols="30" defaultValue={collection.description} maxlength={process.env.NEXT_PUBLIC_MAXLENGTH_DESCRIPTION} />
      </label><hr/>

      <button type="submit" id="editCollectionBtn">Save collection details</button>

      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && !errorMessage && <p className="success">{successMessage}</p>}<hr/>
       
      <a href={`/api/collections/${collection._id}`}
        onClick={async (e) => {
          e.preventDefault();
          if (confirm("Are you sure? Deleting a collection is irreversable! Tasks in this collection will not be deleted.")) {
            try {
              await fetchJson(`/api/collections/${collection._id}`, { method: "DELETE" });
              router.push("/dashboard?deleted=c");
            } catch (error) {
              document.getElementById("deleteCollectionMessage").innerHTML = error.data?.message || "An error occurred.";
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
