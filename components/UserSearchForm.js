export default function UserSearchForm({ errorMessage, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <label>
        <span>Username or User ID</span>
        <input type="text" name="usernameuid" required />
      </label>
      <label>
        <span>Search by...</span>
        <input list="options" name="query" required />
        <datalist id="options">
          <option value="username" />
          <option value="uid" />
        </datalist>
      </label>

      <button type="submit">Find user</button>

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
        }
        .error {
          color: brown;
          margin: 1rem 0 0;
        }
      `}</style>
    </form>
  );
}
