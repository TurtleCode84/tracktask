import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";

export default function UserEditForm({ errorMessage, onSubmit, user }) {
  const router = useRouter();
  return (
    <form id="userEditForm" autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Username</span>
        <input type="text" name="username" defaultValue={user.username} required />
      </label>
      <label>
        <span>Email</span>
        <input type="email" name="email" defaultValue={user.email} />
      </label>
      <hr/><label>
        <span>Change password</span>
        <input type="password" placeholder="Old password" name="opassword" />
        <input type="password" placeholder="New password" name="password" />
        <input type="password" placeholder="Retype new password" name="cpassword" />
      </label><hr/>
      <label>
        <span>Profile picture</span>
        <input type="url" name="profilePicture" defaultValue={user.profilePicture} />
        <details style={{ fontSize: "80%", color: "gray" }}>
        <summary>Allowed image hosts</summary>
          <ul>
            <li>tracktask.eu.org</li>
            <li>avatars.githubusercontent.com</li>
            <li>u.cubeupload.com</li>
            <li>i.bb.com</li>
            <li>api.wasteof.money</li>
          </ul>
        </details>
      </label>
      <p style={{ fontStyle: "italic" }}>Preferences coming soon...</p><hr/>

      <button type="submit" id="editUserBtn">Save account details</button>

      {errorMessage && <p className="error">{errorMessage}</p>}<hr/>
       
      <a href={`/api/user`}
        onClick={async (e) => {
          e.preventDefault();
          const confirm = prompt("Are you sure? Deleting your account is irreversable and will also delete all of your tasks and collections! Type \"delete my account\" to confirm.");
          if (confirm.trim().toLowerCase() === "delete my account") {
            try {
              await fetchJson(`/api/user`, { method: "DELETE" });
              router.push("/");
            } catch (error) {
              document.getElementById("deleteUserMessage").innerHTML = error.data.message;
            }
          } else if (confirm) {
            alert("You didn't type \"delete my account\", so we'll assume you didn't want to. Great choice!");
          }
        }}
      ><button><span style={{ color: "orange" }} className="material-symbols-outlined icon-list">warning</span> Delete my account <span style={{ color: "orange" }} className="material-symbols-outlined icon-list">warning</span></button></a>
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
        .error {
          color: brown;
          margin: 1rem 0 0;
        }
      `}</style>
    </form>
  );
}
