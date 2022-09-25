export default function UserAdminForm({ errorMessage, onSubmit, lookup }) {
  return (
    <form id="userAdminForm" onSubmit={onSubmit}>
      <label>
        <span>Username</span>
        <input type="text" name="username" placeholder={lookup.username} />
      </label>
      <label>
        <span>Email</span>
        <input type="email" name="email" placeholder={lookup.email} />
      </label>
      <hr/><label>
        <span>Change password</span>
        <input type="password" placeholder="New password" name="password" />
        <input type="password" placeholder="Retype new password" name="cpassword" />
      </label><hr/>
      <label>
        <span>Share key</span>
        <input type="text" name="shareKey" placeholder={lookup.shareKey} />
      </label>
      <label>
        <span>Profile picture</span>
        <input type="url" name="profilePicture" placeholder={lookup.profilePicture} />
      </label>
      <label>
        <span>Remove profile picture</span>
        <input type="checkbox" name="removeProfilePicture" />
      </label>
      <label>
        <span>Admin notes</span>
        <textarea name="notes" rows="4" cols="30" placeholder={lookup.history.notes} />
      </label><hr/>
      <h2>Permissions:</h2>
      <label>
        {lookup.permissions.verified ?
        <><span>Unverify user</span>
        <input type="checkbox" name="unverify" /></>
        :
        <><span>Verify user</span>
        <input type="checkbox" name="verify" /></>
        }
      </label>
      <label>
        {lookup.permissions.admin ? <span>Remove admin from user</span> : <span>Make user admin</span>}
        <input type="checkbox" name="toggleAdmin" disabled />
      </label>
      <label>
        {lookup.permissions.banned ? <span>Unban user</span> : <span>Ban user</span>}
        <input type="checkbox" name="toggleBanned" disabled />
      </label>
      <label>
        {lookup.permissions.banned ? <span>Edit ban reason</span> : <span>Ban reason</span>}
        <input type="text" name="banReason" disabled />
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
