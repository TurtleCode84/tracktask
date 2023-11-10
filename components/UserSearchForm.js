import User from "components/User";
import { useEffect, useRef } from "react";

export default function UserSearchForm({ user, errorMessage, searchResults, autoKeyword, autoQuery, onSubmit }) {
  const resultsList = searchResults.map((result) =>
    <li key={result._id} style={{ margin: "0.5em" }}>
      <User user={user} id={result._id} link={true}/>
    </li>
  );

  const form = useRef();

  useEffect(()=>{
    if (autoKeyword && autoQuery) {
      form.current.dispatchEvent(new Event("submit", { cancelable: true }));
    }
  },[]);

  return (
    <form id="userSearchForm" ref={form} autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Keyword...</span>
        <input type="text" name="keyword" defaultValue={autoKeyword?.trim()} autoFocus />
      </label>
      <label>
        <span>Search by...</span>
        <select name="query" defaultValue={autoQuery?.trim().toLowerCase()} required>
          <option value="username">Username</option>
          <option value="uid">User ID</option>
          <option value="email">Email</option>
          <option value="ip">IP Address</option>
        </select>
      </label>

      <br/><button type="submit" id="findUserBtn">Find user</button>

      {resultsList.length > 0 && !errorMessage && <ul><li className="success">Found {resultsList.length} matching users:</li>{resultsList}</ul>}
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
        input, select {
          padding: 8px;
          margin: 0.3rem 0 1rem;
          max-width: 400px;
        }
      `}</style>
    </form>
  );
}
