import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";
import Image from "next/image";

export default function UserEditForm({ errorMessage, onSubmit, user }) {
  const router = useRouter();
  return (
    <form id="userEditForm" autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Username</span>
        <input type="text" name="username" defaultValue={user.username} />
      </label>
      <label>
        <span>Email</span>
        <input type="email" name="email" defaultValue={user.email} />
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
        <span>Profile picture <Image src={user.profilePicture ? user.profilePicture : "/default-pfp.jpg" } width={32} height={32} alt=""/> ({user.profilePicture ? <a href={user.profilePicture} target="_blank" rel="noreferrer">link</a> : 'default'})</span>
        <input type="url" name="profilePicture" defaultValue={user.profilePicture} />
      </label>
      <h2>Preferences:</h2>
      <p style={{ fontStyle: "italic" }}>Coming soon...</p><hr/>

      <button type="submit" id="editUserBtn">Edit account details</button>

      {errorMessage && <p className="error">{errorMessage}</p>}<hr/>
       
      <a href={`/api/user`}
        onClick={async (e) => {
          e.preventDefault();
          const confirm = prompt("Are you sure? Deleting your account is irreversable, and will remove all of their tasks and collections as well! Type \"yes\" to confirm.");
          if (confirm.trim().toLowerCase() === "yes") {
            try {
              await fetchJson(`/api/user`, { method: "DELETE" });
              router.push("/");
            } catch (error) {
              document.getElementById("deleteUserMessage").innerHTML = error.data.message;
            }
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
