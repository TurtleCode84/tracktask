export default function LoginForm({ errorMessage, onSubmit, joinMessage, joinUsername }) {
  return (
    <form onSubmit={onSubmit}>
      <label>
        <span>Username</span>
        <input type="text" name="username" defaultValue={joinUsername?.trim()} autoFocus required />
      </label>
      <label>
        <span>Password</span>
        <input type="password" name="password" required />
      </label>

      <button type="submit" id="loginBtn">Login</button>

      {errorMessage && <p className="error">{errorMessage}</p>}
      {joinMessage && !errorMessage && <p className="success">{joinMessage}</p>}

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
