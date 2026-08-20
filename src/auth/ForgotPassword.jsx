import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    alert("Function Started");

    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);

      alert("Email Sent Successfully");
      console.log("RESET EMAIL SENT");

      setMessage("Password reset link has been sent to your email.");
      setEmail("");
    } catch (err) {
      console.error(err);

      alert("Firebase Error: " + (err.code || err.message));

      setError(err.code || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">

       <div className="forgot-header">

  <div className="lock-icon">
    🔒
  </div>

  <h1>Forgot Password?</h1>

  <p>
    Don't worry! Enter your email address below and we'll
    send you a secure password reset link.
  </p>

</div>

        {message && (
          <p className="success-message">{message}</p>
        )}

        {error && (
          <p className="error-message">{error}</p>
        )}

        <form onSubmit={handleResetPassword}>

          <div className="input-wrapper">

  <FaEnvelope className="input-icon" />

  <input
    type="email"
    placeholder="Email Address"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="forgot-input"
    disabled={loading}
    required
  />

</div>

          <button
            type="submit"
            className="forgot-btn"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

        </form>

        <Link to="/signin" className="back-signin">
          ← Back to Sign In
        </Link>

      </div>
    </div>
  );
}

export default ForgotPassword;