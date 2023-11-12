export default function PasswordResetForm({ errorMessage, onSubmit }) {
  return (
    <form id="passwordResetForm" autocomplete="off" onSubmit={onSubmit}>
      <label>
        <span>New password</span>
        <input type="password" name="password" required />
      </label>
      <label>
        <span>Confirm new password</span>
        <input type="password" name="cpassword" required />
      </label><hr/>

      <button type="submit" id="editUserBtn">Reset password</button>

      {errorMessage && <p className="error">{errorMessage}</p>}<hr/>

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
