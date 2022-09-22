export default function UserSearchForm({ errorMessage, onSubmit, lookup }) {
  return (
    <form onSubmit={onSubmit}>
      <label>
        <span>Username</span>
        <input type="text" name="username" value={lookup.username} required />
      </label>
      <label>
        <span>Email</span>
        <input type="email" name="email" value={lookup.email} required />
      </label>
      <hr/><label>
        <span>Change password</span>
        <input type="password" placeholder="New password" name="password" />
        <input type="password" placeholder="Retype new password" name="cpassword" />
      </label><hr/>
      <label>
        <span>Share key</span>
        <input type="text" name="shareKey" value={lookup.shareKey} required />
      </label>
      <label>
        <span>Profile picture</span>
        <input type="url" name="profilePicture" value={lookup.profilePicture} />
      </label>
      <label>
        <span>Admin notes</span>
        <textarea name="notes" value={lookup.history.notes} />
      </label><hr/>
      <h2>Permissions:</h2>
      <label>
        <span>Verified</span>
        {lookup.permissions.verified ? <input type="checkbox" name="verified" checked /> : <input type="checkbox" name="verified" />}
      </label>
      <label>
        <span>Admin</span>
        {lookup.permissions.admin ? <input type="checkbox" name="admin" checked /> : <input type="checkbox" name="admin" />}
      </label>
      <label>
        <span>Banned</span>
        {lookup.permissions.banned ? <input type="checkbox" name="banned" checked /> : <input type="checkbox" name="banned" />}
      </label>
      <label>
        <span>Ban reason</span>
        <input type="text" name="banReason" value={lookup.history.banReason} />
      </label>

      <button type="submit">Edit user data</button>

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
          width: 10px !important;
        }
        .error {
          color: brown;
          margin: 1rem 0 0;
        }
      `}</style>
    </form>
  );
}
