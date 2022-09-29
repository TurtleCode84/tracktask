import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";

export default function UserAdminForm({ errorMessage, onSubmit, lookup }) {
  const router = useRouter();
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
      <label>
        <span>Remove email</span>
        <input type="checkbox" name="removeEmail" disabled />
      </label>
      <hr/><label>
        <span>Change password</span>
        <input type="password" placeholder="New password" name="password" />
        <input type="password" placeholder="Retype new password" name="cpassword" />
      </label><hr/>
      <label>
        <span>Reset share key</span>
        <input type="checkbox" name="resetShareKey" />
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
      <label>
        <span>Warn user</span>
        <input type="checkbox" name="warn" />
      </label>
      <label>
        <span>Warning</span>
        <input type="text" name="warning" />
      </label>
      <label>
        <span>Clear all warnings</span>
        <input type="checkbox" name="clearWarnings" />
      </label>
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
        {lookup.permissions.banned ?
        <><span>Unban user</span>
        <input type="checkbox" name="unban" /></>
        :
        <><span>Ban user</span>
        <input type="checkbox" name="ban" /></>
        }
      </label>
      <label>
        {lookup.permissions.banned ?
        <><span>Edit ban reason</span>
        <input type="text" placeholder={lookup.history.banReason} name="banReason" /></>
        :
        <><span>Ban reason</span>
        <input type="text" name="banReason" /></>
        }
      </label><hr/>

      <button type="submit" id="editUserBtn">Edit user data</button>

      {errorMessage && <p className="error">{errorMessage}</p>}<hr/>
       
      <a href={`/api/admin/users/${lookup._id}`}
        onClick={async (e) => {
          e.preventDefault();
          const confirm = prompt("Are you sure? Deleting a user is irreversable, and will delete all of their tasks and collections as well! Type \"yes\" to confirm, not case sensitive.");
          if (confirm.trim().toLowerCase() === "yes") {
            try {
              await fetchJson(`/api/admin/users/${lookup._id}`, { method: "DELETE" });
              router.push("/admin/users?deleted=true");
            } catch (error) {
              if (error instanceof FetchError) {
                setErrorMsg(error.data.message);
              } else {
                console.error("An unexpected error happened:", error);
              }
            }
          }
        }}
      ><>&#9888;</> Delete user <>&#9888;</></a>

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
