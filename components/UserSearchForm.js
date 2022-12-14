export default function UserSearchForm({ errorMessage, onSubmit }) {
  return (
    <form id="userSearchForm" autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Keyword...</span>
        <input type="text" name="keyword" required />
      </label>
      <label>
        <span>Search by...</span>
        <select name="query" required>
          <option value="username">Username</option>
          <option value="uid">User ID</option>
          <option value="email">Email</option>
          <option value="ip">IP Address (beta)</option>
        </select>
      </label>

      <br/><button type="submit" id="findUserBtn">Find user</button>

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
        .success {
          color: darkgreen;
          margin: 1rem 0 0;
        }
      `}</style>
    </form>
  );
}
