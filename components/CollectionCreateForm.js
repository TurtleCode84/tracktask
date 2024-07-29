import Link from "next/link";

export default function CollectionCreateForm({ verified, errorMessage, onSubmit }) {
  return (
    <form id="collectionCreateForm" autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Name</span>
        <input type="text" name="name" maxlength="55" autoFocus required />
      </label>
      <label>
        <span>Description (optional)</span>
        <textarea name="description" rows="8" cols="30" maxlength="500" />
      </label>
      <p style={{ fontStyle: "italic" }}>{verified ? 'You will be able to share this collection after you create it.' : <>If you would like to share this collection, please <Link href="/dashboard/account/verify">verify your email</Link>.</>}</p>

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
