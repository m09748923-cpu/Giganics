import "./LandingPage.css";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      {/* Background Glow */}
      <div className="bg-glow glow1"></div>
      <div className="bg-glow glow2"></div>

      {/* Navbar */}
      <nav className="navbar">

        <div className="logo-area">
          <img src={logo} alt="Giganics Logo" />
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-buttons">
          <button
            className="login-btn"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </button>
        </div>

      </nav>

      {/* ================= HERO ================= */}

      <section className="hero">

        <h1>
          Pakistan's Next Generation
          <span> AI Learning Platform</span>
        </h1>

        <p>
          Smart Notes, MCQs, Test Papers, Flashcards,
          Homework, Classwork aur AI Learning Tools —
          Everything in one Platform.
        </p>

        <button
          className="hero-btn"
          onClick={() => navigate("/signup")}
        >
          Get Started
        </button>

      </section>

      {/* ================= FEATURES ================= */}

      <section id="features" className="features-preview">

        <h2>Powerful AI Features</h2>

        <p>
          Create Notes, MCQs, Flashcards and Test Papers
          within seconds using AI.
        </p>

      </section>

      {/* ================= ABOUT ================= */}

      <section id="about" className="about-section">

        <div className="about-left">

          <p className="about-tag">
            ABOUT GIGANICS
          </p>

          <h2>
            Transforming Education with
            <span> Artificial Intelligence</span>
          </h2>

          <p className="about-text">
            Giganics is an AI-powered education platform built to help
            teachers create high-quality learning materials while helping
            students learn faster and smarter.

            From Smart Notes and MCQs to complete Test Papers,
            everything can be generated within seconds.
          </p>

          <div className="about-list">

            <div className="about-item">
              Smart Notes
            </div>

            <div className="about-item">
              Test Papers
            </div>

            <div className="about-item">
              MCQs Generator
            </div>

            <div className="about-item">
              Flashcards
            </div>

          </div>

        </div>

        <div className="about-right">

          <div className="ai-card">

            <h3>AI Powered</h3>

            <p>
              Helping Teachers & Students save hours every day.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}

export default LandingPage;