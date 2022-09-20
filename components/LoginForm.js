import Script from 'next/script;

export default function LoginForm({ errorMessage, onSubmit }) {
  return (
    <Script src={siteKey} />
    <form onSubmit="https://www.google.com/recaptcha/api.js">
      <label>
        <span>Username</span>
        <input type="text" name="username" required />
      </label>
      <label>
        <span>Password</span>
        <input type="password" name="password" required />
      </label>

      <button class="g-recaptcha" data-sitekey="6LdQjxQiAAAAAJzWoXdUgeI3nsSxzDtG5Z7njbFe" data-callback='onSubmit' data-action='submit'>Login</button>

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
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .error {
          color: brown;
          margin: 1rem 0 0;
        }
      `}</style>
    </form>
  );
}
