import "./FeaturesPage.css";
import { Link } from "react-router-dom";

import {
  FaBookOpen,
  FaFileAlt,
  FaBullseye,
  FaBrain,
  FaChalkboardTeacher,
  FaGraduationCap,
} from "react-icons/fa";

function FeaturesPage() {
  return (
    <div className="features-page">
      <div className="features-container">

        <Link to="/" className="back-btn">
          ← Back
        </Link>

        <p className="subtitle">
          AI Powered Education Platform
        </p>

        <h1 className="title">
          Powerful <span>AI Features</span>
        </h1>

        <p className="description">
          Everything teachers and students need to create notes,
          test papers, MCQs and much more using Artificial Intelligence.
        </p>

        <div className="features-grid">

          <div className="feature-card">
            <div className="icon">
              <FaBookOpen />
            </div>

            <h3>Smart Notes</h3>

            <p>
              Generate beautiful and organized notes within seconds.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">
              <FaFileAlt />
            </div>

            <h3>Test Papers</h3>

            <p>
              Create complete exam papers instantly.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">
              <FaBullseye />
            </div>

            <h3>MCQs Generator</h3>

            <p>
              Unlimited MCQs with answer keys.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">
              <FaBrain />
            </div>

            <h3>Flashcards</h3>

            <p>
              Learn faster with AI generated flashcards.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">
              <FaChalkboardTeacher />
            </div>

            <h3>Teacher Tools</h3>

            <p>
              Homework, classwork and quizzes in seconds.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon">
              <FaGraduationCap />
            </div>

            <h3>Student Learning</h3>

            <p>
              Personalized AI learning experience.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default FeaturesPage;