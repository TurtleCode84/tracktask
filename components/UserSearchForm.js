import User from "components/User";

export default function UserSearchForm({ user, errorMessage, searchResults, onSubmit }) {
  /*const resultsList = searchResults?.map((result) =>
    <li key={result._id} style={{ margin: "0.5em" }}>
      <User user={user} id={result._id} link={true}/>
    </li>
  );*/
  const resultsList = JSON.stringify(searchResults);

  return (
    <form id="userSearchForm" autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Keyword...</span>
        <input type="text" name="keyword" autoFocus />
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

      {resultsList && <ul><li className="success">Found {resultsList.length} matching users:</li>{resultsList}</ul>}
      {errorMessage && !resultsList && <p className="error">{errorMessage}</p>}

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
      `}</style>
    </form>
  );
}
