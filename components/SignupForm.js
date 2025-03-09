import Link from "next/link";
import Script from "next/script";

export default function SignupForm({ errorMessage, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <label>
        <span>Username</span>
        <input type="text" name="username" minlength="3" maxlength="20" autoFocus required />
      </label>
      <label>
        <span>Email (optional)</span>
        <input type="email" name="email" />
      </label>
      <label>
        <span>Password</span>
        <input type="password" name="password" required />
      </label>
      <label>
        <span>Confirm password</span>
        <input type="password" name="cpassword" required />
      </label>

      <p style={{ marginTop: "0" }}>By creating an account, you agree to our <Link href="/privacy">Privacy Policy</Link> and <Link href="/terms">Terms of Use</Link>.</p>

      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" defer></Script>
      
      <div class="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY} data-action="joinFormSubmit"></div>
      <button type="submit" id="signupBtn">Sign up</button>

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
        }
      `}</style>
    </form>
  );
}
