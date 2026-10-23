import { useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [resetToken, setResetToken] = useState(
    new URLSearchParams(window.location.search).get(
      "resetToken"
    )
  );

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const clearMessages = () => {
    setError("");
    setMessage("");
  };

  const switchMode = (newMode) => {
    clearMessages();
    setMode(newMode);
  };


  /* =========================
     LOGIN
  ========================= */

  const handleLogin = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!email.trim() || !password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to login."
        );
        return;
      }

      onLogin(data.user);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================
     SIGN UP
  ========================= */

  const handleSignup = async (event) => {
    event.preventDefault();

    clearMessages();

    if (
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to create account."
        );
        return;
      }

      onLogin(data.user);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================
     FORGOT PASSWORD
  ========================= */

  const handleForgotPassword = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to create reset link."
        );
        return;
      }

      setMessage(
        "Reset link created. Check your server terminal."
      );
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================
     RESET PASSWORD
  ========================= */

  const handleResetPassword = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!resetToken) {
      setError(
        "Invalid or missing reset token."
      );
      return;
    }

    if (!newPassword) {
      setError(
        "Please enter your new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "New password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: resetToken,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to reset password."
        );
        return;
      }

      setMessage(
        "Password reset successfully. You can now login."
      );

      setNewPassword("");
      setResetToken(null);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );

      setTimeout(() => {
        setMessage("");
        setMode("login");
      }, 1500);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================
     RESET SCREEN
  ========================= */

  if (resetToken) {
    return (
      <main className="auth-screen">

        <div className="auth-card">

          <div className="auth-brand">

            <div className="auth-logo">
              PM
            </div>

            <div className="auth-brand-name">
              <strong>
                Watches
              </strong>
            </div>

          </div>

          <div className="auth-heading">

            <p className="eyebrow">
              ACCOUNT RECOVERY
            </p>

            <h1>
              Create a
              <br />
              new password.
            </h1>

            <p>
              Choose a new password for your PM Watches account.
            </p>

          </div>

          <form
            className="auth-form"
            onSubmit={handleResetPassword}
          >

            <div className="auth-field">

              <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                placeholder="New Password"
                aria-label="New Password"
                autoComplete="new-password"
              />

            </div>

            {error && (
              <p className="auth-error">
                {error}
              </p>
            )}

            {message && (
              <p className="auth-success">
                {message}
              </p>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Updating..."
                : "Update Password"}
            </button>

          </form>

        </div>

      </main>
    );
  }


  /* =========================
     MAIN AUTH UI
  ========================= */

  return (
    <main className="auth-screen">

      <div className="auth-card">

        <div className="auth-brand">

          <div className="auth-logo">
            PM
          </div>

          <div className="auth-brand-name">
            <strong>
              Watches
            </strong>
          </div>

        </div>


        {/* LOGIN */}

        {mode === "login" && (
          <>
            <div className="auth-heading">

              <p className="eyebrow">
                WELCOME BACK
              </p>

              <h1>
                Login to
                <br />
                PM Watches.
              </h1>

              <p>
                Sign in to continue to your PM Watches experience.
              </p>

            </div>

            <form
              className="auth-form"
              onSubmit={handleLogin}
            >

              <div className="auth-field">

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Email"
                  aria-label="Email"
                  autoComplete="email"
                />

              </div>

              <div className="auth-field">

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Password"
                  aria-label="Password"
                  autoComplete="current-password"
                />

              </div>

              {error && (
                <p className="auth-error">
                  {error}
                </p>
              )}

              {message && (
                <p className="auth-success">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Logging in..."
                  : "Login"}
              </button>

            </form>

            <button
              type="button"
              className="auth-link"
              onClick={() =>
                switchMode("forgot")
              }
            >
              Forgot password?
            </button>

            <div className="auth-switch">

              <span>
                Don't have an account?
              </span>

              <button
                type="button"
                onClick={() =>
                  switchMode("signup")
                }
              >
                Sign Up
              </button>

            </div>
          </>
        )}


        {/* SIGN UP */}

        {mode === "signup" && (
          <>
            <div className="auth-heading">

              <p className="eyebrow">
                JOIN PM WATCHES
              </p>

              <h1>
                Create your
                <br />
                account.
              </h1>

              <p>
                Create an account to explore PM Watches.
              </p>

            </div>

            <form
              className="auth-form"
              onSubmit={handleSignup}
            >

              <div className="auth-field">

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Full Name"
                  aria-label="Full Name"
                  autoComplete="name"
                />

              </div>

              <div className="auth-field">

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Email"
                  aria-label="Email"
                  autoComplete="email"
                />

              </div>

              <div className="auth-field">

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Password"
                  aria-label="Password"
                  autoComplete="new-password"
                />

              </div>

              {error && (
                <p className="auth-error">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>

            </form>

            <div className="auth-switch">

              <span>
                Already have an account?
              </span>

              <button
                type="button"
                onClick={() =>
                  switchMode("login")
                }
              >
                Login
              </button>

            </div>
          </>
        )}


        {/* FORGOT */}

        {mode === "forgot" && (
          <>
            <div className="auth-heading">

              <p className="eyebrow">
                ACCOUNT RECOVERY
              </p>

              <h1>
                Reset your
                <br />
                password.
              </h1>

              <p>
                Enter your account email to create a password reset link.
              </p>

            </div>

            <form
              className="auth-form"
              onSubmit={handleForgotPassword}
            >

              <div className="auth-field">

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Email"
                  aria-label="Email"
                  autoComplete="email"
                />

              </div>

              {error && (
                <p className="auth-error">
                  {error}
                </p>
              )}

              {message && (
                <p className="auth-success">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading
                  ? "Creating Link..."
                  : "Send Reset Link"}
              </button>

            </form>

            <button
              type="button"
              className="auth-link auth-back"
              onClick={() =>
                switchMode("login")
              }
            >
              ← Back to Login
            </button>

          </>
        )}

      </div>

    </main>
  );
}
