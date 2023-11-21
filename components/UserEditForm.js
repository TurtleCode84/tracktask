import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function UserEditForm({ errorMessage, onSubmit, user }) {
  const router = useRouter();
  useEffect(() => {
    const themeDropdown = document.getElementById("theme-dropdown");
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme) {
      themeDropdown.value = currentTheme;
    } else {
      themeDropdown.value = "dark";
    }
    themeDropdown.addEventListener("change", switchTheme, false);

    if (user.permissions.verified) {
      const notificationsDropdown = document.getElementById("notifications-dropdown");
      const currentNotifications = localStorage.getItem("notifications");
      if (currentNotifications.includes("enable")) {
        notificationsDropdown.value = "enable";
      } else {
        notificationsDropdown.value = "disable";
      }
      notificationsDropdown.addEventListener("change", toggleNotifications, false);
    }

    const displayNameInput = document.getElementById("displayNameInput");
    displayNameInput.value = localStorage.getItem("displayName");
    displayNameInput.addEventListener("input", changeDisplayName, false);
  
    function switchTheme(e) {
      document.documentElement.setAttribute("data-theme", e.currentTarget.value);
      localStorage.setItem("theme", e.currentTarget.value);
    }
    function toggleNotifications(e) {
      localStorage.setItem("notifications", e.currentTarget.value);
      router.reload();
    }
    function changeDisplayName(e) {
      localStorage.setItem("displayName", e.currentTarget.value.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <form id="userEditForm" autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>Username</span>
        <input type="text" name="username" minlength="3" maxlength="20" defaultValue={user.username} required />
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
        <span>Profile picture (URL)</span>
        <input type="text" title="Must be a valid absolute or relative URL." pattern="(^https?:\/\/.*?\..{2,}?|^\/.*?)" name="profilePicture" defaultValue={user.profilePicture} />
        <details style={{ fontSize: "80%", color: "gray" }}>
        <summary>Allowed image hosts</summary>
          <ul style={{ listStyle: "revert", margin: "revert" }}>
            <li>tracktask.eu.org</li>
            <li>avatars.githubusercontent.com</li>
            <li>u.cubeupload.com</li>
            <li>i.ibb.co</li>
            <li>api.wasteof.money</li>
          </ul>
        </details>
      </label><hr/>
      <label>
        <span>Theme</span>
        <select id="theme-dropdown" name="theme" >
          <option value="dark">Dark (default)</option>
          <option value="light">Light</option>
        </select>
      </label>
      {user.permissions.verified && <label>
        <span>Push Notifications (beta)</span>
        <select id="notifications-dropdown" name="notifications" >
          <option value="disable">Disabled (default)</option>
          <option value="enable">Enabled</option>
        </select>
      </label>}
      <label>
        <span>Display name (stored locally)</span>
        <input type="text" id="displayNameInput" name="displayName" />
      </label><hr/>

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
        input, select {
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
      `}</style>
    </form>
  );
}
