export default function UserSearchForm({ errorMessage, onSubmit, lookup }) {
  return (
    <form onSubmit={onSubmit}>
      <label>
        <span>Username</span>
        <input type="text" name="username" placeholder={lookup.username} required />
      </label>
      <label>
        <span>Email</span>
        <input type="email" name="email" placeholder={lookup.email} required />
      </label>
      <hr/><label>
        <span>Change password</span>
        <input type="password" placeholder="New password" name="password" />
        <input type="password" placeholder="Retype new password" name="cpassword" />
      </label><hr/>
      <label>
        <span>Share key</span>
        <input type="text" name="shareKey" placeholder={lookup.shareKey} required />
      </label>
      <label>
        <span>Profile picture</span>
        <input type="url" name="profilePicture" placeholder={lookup.profilePicture} />
      </label>
      <label>
        <span>Admin notes</span>
        <textarea name="notes" placeholder={lookup.history.notes} />
      </label><hr/>
      <h2>Permissions:</h2>
      <label>
        {lookup.permissions.verified ? <span>Unverify user</span> : <span>Verify user</span>}
        <input type="checkbox" name="toggleVerified" />
      </label>
      <label>
        {lookup.permissions.admin ? <span>Remove admin from user</span> : <span>Make user admin</span>}
        <input type="checkbox" name="toggleAdmin" disabled />
      </label>
      <label>
        {lookup.permissions.banned ? <span>Unban user</span> : <span>Ban user</span>}
        <input type="checkbox" name="toggleBanned" />
      </label>
      {!lookup.permissions.banned && <label>
        <span>Ban reason</span>
        <input type="text" name="banReason" placeholder={lookup.history.banReason} />
      </label>}

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
          width: 14 !important;
        }
        .error {
          color: brown;
          margin: 1rem 0 0;
        }
      `}</style>
    </form>
  );
}
