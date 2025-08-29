"use client";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import ErrorBanner from "./ErrorBanner";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const { login, signup, resetPassword } = useAuth();
  const router = useRouter();
  const cantAuth = !email.includes("@") || password.length < 6;

  async function handleAuthUser() {
    // check if email is legit and password is acceptable
    if (cantAuth) {
      setError("Invalid email or password");
      return;
    }

    setIsAuthenticating(true);

    try {
      if (isRegister) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      // if we get here with no errors, we're authenticated, then we redirect to the notes page
      router.push("/notes");
    } catch (err) {
      console.log(err.message);
      setError(err.message);
    } finally {
      setIsAuthenticating(false);
    }
  }

  async function handleResetPassword() {
    try {
      setError(null);
      await resetPassword(email);
      alert("Password reset email sent!");
      setIsForgotPassword(false); // go back to login
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <>
      <div className="login-container">
        <h1 className="text-gradient">MDNOTES</h1>
        <h2>Organized note taking made easy</h2>
        <p>
          Build your very own archive of easily navigated and indexed
          information and notes.
        </p>
        <div className="full-line"></div>

        {error && (
          <ErrorBanner message={error} onClose={() => setError(null)} />
        )}
        <h6>{isRegister ? "Create an account" : "Log in"}</h6>
        <div>
          <p>Email</p>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            placeholder="Enter your email address"
          />
        </div>
        <div>
          <p>Password</p>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="*********"
          />{" "}
        </div>
        <button
          onClick={handleAuthUser}
          disabled={cantAuth || isAuthenticating}
          className="submit-btn"
        >
          <h6>{isAuthenticating ? "Submitting..." : "Submit"}</h6>
        </button>
        <div className="secondary-btns-container">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="card-button-secondary"
          >
            <small>{isRegister ? "Log in" : "Sign up"}</small>
          </button>
          <button
            onClick={() => setIsForgotPassword(true)} // 🔴 toggle forgot password
            className="card-button-secondary"
          >
            <small>Forgot password?</small>
          </button>
        </div>
        <div className="full-line"></div>
        {isForgotPassword && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h6>Reset Password</h6>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div>
                <button onClick={handleResetPassword} className="submit-btn">
                  Send Reset Link
                </button>
                <button
                  onClick={() => setIsForgotPassword(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <footer>
          <a
            target="_blank"
            href="https://github.com/mikmb/nextjs-15-markdown-note-app"
          >
            <h6>@mikmb</h6>
            <i className="fa-brands fa-github"></i>
          </a>
        </footer>
      </div>
    </>
  );
}
