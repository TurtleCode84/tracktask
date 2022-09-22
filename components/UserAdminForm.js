import Script from "next/script";

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
        <input type="checkbox" name="verified" id="verified" />
        <Script id="checkVerified">document.getElementById('verified').checked = lookup.permissions.verified;</Script>
      </label>
      <label>
        <span>Admin</span>
        <input type="checkbox" name="admin" id="admin" />
        <Script id="checkAdmin">document.getElementById("admin").checked = lookup.permissions.admin;</Script>
      </label>
      <label>
        <span>Banned</span>
        <input type="checkbox" name="banned" id="banned" />
        <Script id="checkBanned">document.getElementById("banned").checked = lookup.permissions.banned;</Script>
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
        }
        .error {
          color: brown;
          margin: 1rem 0 0;
        }
      `}</style>
    </form>
  );
}
