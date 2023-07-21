import fetchJson, { FetchError } from "lib/fetchJson";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function UserEditForm({ errorMessage, onSubmit, user }) {
  const router = useRouter();
  useEffect(() => {
    const themeDropdown = document.getElementById("theme-dropdown");
    const notificationsDropdown = document.getElementById("notifications-dropdown");
    const currentTheme = localStorage.getItem("theme");
    const currentNotifications = localStorage.getItem("pushNotifications");
    if (currentTheme) {
      themeDropdown.value = currentTheme;
    } else {
      themeDropdown.value = "dark";
    }
    if (currentNotifications) {
      notificationsDropdown.value = currentNotifications;
    } else {
      notificationsDropdown.value = "disabled";
    }
  
    function switchTheme(e) {
      document.documentElement.setAttribute("data-theme", e.currentTarget.value);
      localStorage.setItem("theme", e.currentTarget.value);
    }
    function toggleNotifications(e) {
      localStorage.setItem("pushNotifications", e.currentTarget.value);
      router.reload();
    }
  
    themeDropdown.addEventListener("change", switchTheme, false);
    notificationsDropdown.addEventListener("change", toggleNotifications, false);
  }, [])

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
      </label><hr/>
      <label>
        <span>Theme</span>
        <select id="theme-dropdown" name="theme" >
          <option value="dark">Dark (default)</option>
          <option value="light">Light</option>
        </select>
      </label>
      <label>
        <span>Push Notifications (beta)</span>
        <select id="notifications-dropdown" name="notifications" >
          <option value="disabled">Disabled (default)</option>
          <option value="enabled">Enabled</option>
        </select>
      </label>
      <p style={{ fontStyle: "italic" }}>More preferences coming soon...</p><hr/>

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
