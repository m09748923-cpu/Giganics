import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

import {
  ref,
  set,
} from "firebase/database";

import {
  auth,
  googleProvider,
  database,
} from "../firebase";

import "./SignUp.css";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaGoogle,
} from "react-icons/fa";

function SignUp() {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [selectedRole, setSelectedRole] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, []);

  const handleSignUp = async (e) => {

    e.preventDefault();

    if (!fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!selectedRole) {
      alert("Please choose Student or Teacher.");
      return;
    }

    if (!acceptTerms) {
      alert("Please accept the Terms.");
      return;
    }

    try {

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

  await set(
  ref(database, "users/" + userCredential.user.uid),
  {
    fullName,
    email,
    role: selectedRole,

    plan:
      selectedRole === "teacher"
        ? "teacher_free"
        : "student_free",
  }
);

     localStorage.setItem("role", selectedRole);
      alert("Account created successfully!");

if (selectedRole === "teacher") {
  navigate("/teacher-dashboard");
} else {
  navigate("/student-dashboard");
}

    } catch (error) {
      alert(error.message);
    }

  };
    const handleGoogleSignIn = async () => {

    try {

      const userCredential =
        await signInWithPopup(
          auth,
          googleProvider
        );

      const user = userCredential.user;

 await set(
  ref(database, "users/" + user.uid),
  {
    fullName: user.displayName || "",
    email: user.email,
    role: "student",
    plan: "student_free",
  }
);

  localStorage.setItem("role", "student");
   alert("Google Sign In Successful!");

navigate("/student-dashboard");

    } catch (error) {
      alert(error.message);
    }

  };

  const getPasswordStrength = () => {

    if (password.length === 0) {
      return {
        text: "",
        width: "0%",
        color: "transparent",
      };
    }

    if (password.length < 6) {
      return {
        text: "Weak",
        width: "30%",
        color: "#ef4444",
      };
    }

    if (password.length < 10) {
      return {
        text: "Medium",
        width: "65%",
        color: "#f59e0b",
      };
    }

    return {
      text: "Strong",
      width: "100%",
      color: "#22c55e",
    };

  };

  const passwordStrength = getPasswordStrength();

  return (
        <div className="signup-page">

      <div className="signup-bg"></div>

      <div className="signup-card">

        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>

        <div className="signup-logo">
          <h1>Giganics</h1>
          <p>
            Join thousands of students and teachers using AI to learn,
            teach and grow smarter.
          </p>
        </div>

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleSignIn}
        >
          <FaGoogle />
          <span>Continue with Google</span>
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        <form
          className="signup-form"
          onSubmit={handleSignUp}
        >

          <div className="input-group">
            <FaUser className="input-icon" />

            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <FaEnvelope className="input-icon" />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">

            <FaLock className="input-icon" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>

          </div>

          <div className="password-strength">

            <div className="strength-bar">
              <span
                style={{
                  width: passwordStrength.width,
                  background: passwordStrength.color,
                }}
              ></span>
            </div>

            {passwordStrength.text && (
              <p>
                Password Strength{" "}
                <strong
                  style={{
                    color: passwordStrength.color,
                  }}
                >
                  {passwordStrength.text}
                </strong>
              </p>
            )}

          </div>

          <div className="input-group">

            <FaLock className="input-icon" />

            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
            />

            <button
              type="button"
              className="eye-btn"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? (
                <FaEyeSlash />
              ) : (
                <FaEye />
              )}
            </button>

          </div>
                    <div className="role-section">

            <h3>Choose Your Role</h3>

            <div className="role-container">

              <div
                className={`role-card ${
                  selectedRole === "student"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSelectedRole("student")
                }
              >
                <FaGraduationCap className="role-icon" />

                <h4>Student</h4>

                <p>Learn smarter with AI tools.</p>

                {selectedRole === "student" && (
                  <FaCheckCircle className="check-icon" />
                )}

              </div>

              <div
                className={`role-card ${
                  selectedRole === "teacher"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSelectedRole("teacher")
                }
              >
                <FaChalkboardTeacher className="role-icon" />

                <h4>Teacher</h4>

                <p>Create notes, MCQs & Test Papers.</p>

                {selectedRole === "teacher" && (
                  <FaCheckCircle className="check-icon" />
                )}

              </div>

            </div>

          </div>

          <label className="terms">

            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) =>
                setAcceptTerms(e.target.checked)
              }
            />

            <span>
              I agree to the Terms & Privacy Policy
            </span>

          </label>

          <button
            type="submit"
            className="signup-btn"
          >
            Create Account
          </button>

          <div className="signup-terms">
            By creating an account, you agree to our{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </div>

          <p className="signin-link">
            Already have an account?{" "}
            <Link to="/signin">
              Sign In
            </Link>
          </p>

        </form>

      </div>

    </div>
  );
}

export default SignUp;