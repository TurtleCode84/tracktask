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
        <input type="url" name="profilePicture" value={lookup.history.notes} />
      </label><hr/>
      <h2>Permissions:</h2>
      <label for="verified">
        <span>Verified</span>
      </label>
      <input type="checkbox" name="verified" id="verified" value={lookup.permissions.verified} />
      <label for="admin">
        <span>Admin</span>
      </label>
      <input type="checkbox" name="admin" id="admin" value={lookup.permissions.admin} />
      <label for="banned">
        <span>Banned</span>
      </label>
      <input type="checkbox" name="banned" id="banned" value={lookup.permissions.banned} />
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
        .error {
          color: brown;
          margin: 1rem 0 0;
        }
      `}</style>
    </form>
  );
}
