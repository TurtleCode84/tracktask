import { Turnstile } from "@marsidev/react-turnstile";

export default function VerificationForm({ errorMessage, onSubmit, buttonDisabled, key }) {
  return (
    <form id="verificationForm" autocomplete="off" onSubmit={onSubmit}>
      
      <button type="submit" id="verifyEmailBtn" disabled={buttonDisabled}><span style={{ color: key?.length > 0 ? "darkgreen" : "lightslategray" }} className="material-symbols-outlined icon-list">{key?.length > 0 ? "mark_email_read" : "outgoing_mail"}</span> {key?.length > 0 ? "Verify email" : "Send verification request"}</button>

      {!buttonDisabled && <>
        <hr/><Turnstile
          siteKey={process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY}
          options={{
            action: "verifyEmailFormSubmit",
          }}
        />
      </>}

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
