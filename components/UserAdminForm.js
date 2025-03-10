import fetchJson from "lib/fetchJson";
import { useRouter } from "next/router";
import { useState } from "react";

export default function UserAdminForm({ errorMessage, successMessage, onSubmit, lookup }) {
  const router = useRouter();
  const [canEditBanReason, setCanEditBanReason] = useState(false);
  return (
    <form id="userAdminForm" autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Username</span>
        <input type="text" name="username" defaultValue={lookup.username} required />
      </label>
      <label>
        <span>Email</span>
        <input type="email" name="email" defaultValue={lookup.email} />
      </label>
      <hr/><label>
        <span>Change password</span>
        <input type="password" placeholder="New password" name="password" />
        <input type="password" placeholder="Retype new password" name="cpassword" />
      </label><hr/>
      <label>
        <span>Profile picture (URL)</span>
        <input type="text" title="Must be a valid absolute or relative URL." pattern="(^https?:\/\/.*?\..{2,}?|^\/.*?)" name="profilePicture" defaultValue={lookup.profilePicture} />
      </label>
      <label>
        <span>Admin notes</span>
        <textarea name="notes" rows="4" cols="30" defaultValue={lookup.history.notes} />
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
      <label>
        <span>Generate new verification key</span>
        <input type="checkbox" name="generateVerificationKey" disabled />
      </label>
      <label>
        <span>Generate new OTP</span>
        <input type="checkbox" name="generateOtp" disabled />
      </label>
      <h2>Permissions:</h2>
      <label>
        <span>Verified <span style={{ color: "#006dbe" }} className="material-symbols-outlined icon-list">verified</span></span>
        <input type="checkbox" name="verify" defaultChecked={lookup.permissions.verified} />
      </label>
      <label>
        <span>Admin <span style={{ color: "slategray" }} className="material-symbols-outlined icon-list">verified_user</span></span>
        <input type="checkbox" name="admin" defaultChecked={lookup.permissions.admin} />
      </label>
      <label>
        <span>Banned <span style={{ color: "red" }} className="material-symbols-outlined icon-list">block</span></span>
        <input type="checkbox" name="ban" defaultChecked={lookup.permissions.banned} onChange={(e) => {setCanEditBanReason(e.target.checked)}} />
      </label>
      <label>
        {lookup.permissions.banned ?
        <><span>Edit ban reason</span>
        <input type="text" defaultValue={lookup.history.ban.reason} name="banReason" disabled={!canEditBanReason} /></>
        :
        <>{canEditBanReason && <><span>Ban reason</span>
        <input type="text" name="banReason" /></>}</>
        }
      </label><hr/>

      <button type="submit" id="editUserBtn">Save account data</button>

      {errorMessage && !successMessage && <p className="error">{errorMessage}</p>}
      {successMessage && <p className="success">{successMessage}</p>}<hr/>
       
      <a href={`/api/admin/users/${lookup._id}`}
        onClick={async (e) => {
          e.preventDefault();
          const confirm = prompt("Are you sure? Deleting a user is irreversable, and will delete all of their tasks and collections as well! Type \"delete this account\" to confirm.");
          if (confirm.trim().toLowerCase() === "delete this account") {
            try {
              await fetchJson(`/api/admin/users/${lookup._id}`, { method: "DELETE" });
              router.push("/admin?deleted=true");
            } catch (error) {
              document.getElementById("deleteUserMessage").innerHTML = error.data?.message || error.message;
            }
          } else if (confirm) {
            alert("You didn't type \"delete this account\", so we'll assume you didn't want to. Only delete a user if it's completely necessary!");
          }
        }}
      ><button><span style={{ color: "orange" }} className="material-symbols-outlined icon-list">warning</span> Delete user <span style={{ color: "orange" }} className="material-symbols-outlined icon-list">warning</span></button></a>
      <p className="error" id="deleteUserMessage"></p>

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
          max-width: 400px;
        }
        input[type="checkbox"] {
          margin: 0;
          vertical-align: middle;
          width: 15px !important;
          margin-bottom: 10px;
        }
        textarea {
          border-color: var(--input-border-color);
        }
      `}</style>
    </form>
  );
}
