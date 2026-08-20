import "./SignIn.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaGoogle,
} from "react-icons/fa";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import {
  get,
  ref,
} from "firebase/database";

import {
  auth,
  googleProvider,
  database,
} from "../firebase";

function SignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================
  // Email & Password Sign In
  // ==========================
  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      const snapshot = await get(
        ref(database, "users/" + user.uid)
      );

      if (snapshot.exists()) {
        const data = snapshot.val();

        // Save role
        localStorage.setItem("role", data.role);
        localStorage.setItem("plan", data.plan);

        alert("Login Successful!");

        if (data.role === "teacher") {
  navigate("/teacher-dashboard");
} else {
  navigate("/student-dashboard");
}

      } else {
        alert("User data not found.");
      }

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Google Sign In
  // ==========================
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      const userCredential =
        await signInWithPopup(
          auth,
          googleProvider
        );

      const user = userCredential.user;

      const snapshot = await get(
        ref(database, "users/" + user.uid)
      );

      if (snapshot.exists()) {
        const data = snapshot.val();

        // Save role
        localStorage.setItem("role", data.role);
        localStorage.setItem("plan", data.plan);

        alert("Google Login Successful!");

       if (data.role === "teacher") {
  navigate("/teacher-dashboard");
} else {
  navigate("/student-dashboard");
}

      } else {
        alert("User data not found.");
      }

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-card">

        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/")}
        >
          <FaArrowLeft />
          Back
        </button>

        <h1>Welcome Back</h1>

        <p>Sign in to continue to Giganics.</p>

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <FaGoogle />
          <span>
            {loading
              ? "Please wait..."
              : "Continue with Google"}
          </span>
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        <form
          className="signin-form"
          onSubmit={handleSignIn}
        >

          <div className="input-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <div className="signin-options">
            <Link to="/forgot-password">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="signin-btn"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>

        </form>

        <p className="signup-link">
          Don't have an account?{" "}
          <Link to="/signup">
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
}

export default SignIn;