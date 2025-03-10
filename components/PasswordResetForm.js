import { Turnstile } from "@marsidev/react-turnstile";

export default function PasswordResetForm({ errorMessage, onSubmit, confirmed }) {
  return (
    <form id="passwordResetForm" autocomplete="off" onSubmit={onSubmit}>
      {confirmed ? <>
      <p>Almost there! Set a new, secure password below.</p>
      <label>
        <span>New password</span>
        <input type="password" name="password" autoFocus required />
      </label>
      <label>
        <span>Confirm new password</span>
        <input type="password" name="cpassword" required />
      </label>
      </> : <>
      <p>Enter a verified account email address to send a password reset request.</p>
      <label>
        <span>Email address</span>
        <input type="email" name="email" autoFocus required />
      </label>
      </>}

      <button type="submit" id="resetPasswordBtn">Reset password</button>

      <hr/><Turnstile
        siteKey={process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY}
        options={{
          action: "passwordResetFormSubmit",
        }}
      />

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
