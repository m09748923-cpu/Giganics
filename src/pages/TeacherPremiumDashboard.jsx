import "./TeacherPremiumDashboard.css";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

import {
  FaCrown,
  FaHome,
  FaFileAlt,
  FaBook,
  FaQuestionCircle,
  FaClipboard,
  FaKey,
  FaDownload,
  FaHistory,
  FaCog,
  FaLayerGroup,
  FaFolderOpen,
  FaBars,
  FaTimes,
} from "react-icons/fa";

function TeacherPremiumDashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeTimer = useRef(null);

  /* =====================================================
     SIDEBAR CONTROL
  ===================================================== */

  const openSidebar = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    setSidebarOpen(true);
  };

  const closeSidebarDelayed = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    closeTimer.current = setTimeout(() => {
      setSidebarOpen(false);
    }, 600);
  };

  const closeSidebar = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    setSidebarOpen(false);
  };

  const goTo = (path) => {
    closeSidebar();
    navigate(path);
  };

  /* =====================================================
     CLEANUP + TEACHER ROLE
  ===================================================== */

  useEffect(() => {
    localStorage.setItem("role", "teacher");

    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
    };
  }, []);

  return (
    <div className="teacher-premium-dashboard">

      {/* =================================================
          SIDEBAR EDGE TRIGGER
      ================================================= */}

      <div
        className="premium-sidebar-trigger"
        onMouseEnter={openSidebar}
      >
        <div className="sidebar-edge-hint">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>


      {/* =================================================
          MOBILE MENU
      ================================================= */}

      <button
        className="premium-menu-btn"
        onClick={openSidebar}
        aria-label="Open menu"
      >
        <FaBars />
      </button>


      {/* =================================================
          OVERLAY
      ================================================= */}

      {sidebarOpen && (
        <div
          className="premium-sidebar-overlay"
          onClick={closeSidebar}
        />
      )}


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
        onMouseEnter={openSidebar}
        onMouseLeave={closeSidebarDelayed}
      >

        {/* CLOSE BUTTON */}

        <button
          className="premium-sidebar-close"
          onClick={closeSidebar}
          aria-label="Close menu"
        >
          <FaTimes />
        </button>


        {/* =================================================
            LOGO
        ================================================= */}

        <div
          className="premium-logo"
          onClick={() =>
            goTo("/teacher-premium-dashboard")
          }
        >

          <div className="logo-orb">
            <FaCrown />
          </div>

          <h2>Giganics</h2>

        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <ul>

          {/* DASHBOARD */}

          <li
            className="active"
            onClick={() =>
              goTo("/teacher-premium-dashboard")
            }
          >
            <FaHome />
            <span>Dashboard</span>
          </li>


          {/* EXAM PAPER */}

          <li
            onClick={() =>
              goTo("/teacher-test-paper")
            }
          >
            <FaFileAlt />
            <span>Exam Paper AI</span>
          </li>


          {/* AI NOTES */}

          <li
            onClick={() =>
              goTo("/teacher-ai-notes")
            }
          >
            <FaBook />
            <span>AI Notes</span>
          </li>


          {/* AI MCQS */}

          <li
            onClick={() =>
              goTo("/teacher-mcqs")
            }
          >
            <FaQuestionCircle />
            <span>AI MCQs</span>
          </li>


          {/* HOMEWORK */}

          <li
            onClick={() =>
              goTo("/teacher-homework")
            }
          >
            <FaClipboard />
            <span>Homework</span>
          </li>


          {/* CLASSWORK */}

          <li
            onClick={() =>
              goTo("/teacher-classwork")
            }
          >
            <FaLayerGroup />
            <span>Classwork</span>
          </li>


          {/* FLASHCARDS */}

          <li
            onClick={() =>
              goTo("/teacher-flashcards")
            }
          >
            <FaBook />
            <span>Flashcards</span>
          </li>


          {/* MY FILES */}

          <li
            onClick={() =>
              goTo("/my-files")
            }
          >
            <FaFolderOpen />
            <span>My Files</span>
          </li>


          {/* ANSWER KEYS */}

          <li
            onClick={() =>
              goTo("/teacher-answer-key")
            }
          >
            <FaKey />
            <span>Answer Keys</span>
          </li>


          {/* PDF */}

          <li
            onClick={() =>
              goTo("/pdf-download")
            }
          >
            <FaDownload />
            <span>PDF Export</span>
          </li>


          {/* SETTINGS */}

          <li
            onClick={closeSidebar}
          >
            <FaCog />
            <span>Settings</span>
          </li>

        </ul>

      </aside>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="premium-content">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="premium-hero">

          <div className="hero-grid"></div>


          {/* PARTICLES */}

          <div className="hero-particle particle-1"></div>
          <div className="hero-particle particle-2"></div>
          <div className="hero-particle particle-3"></div>
          <div className="hero-particle particle-4"></div>
          <div className="hero-particle particle-5"></div>


          {/* HERO CONTENT */}

          <div className="hero-content">

            <div className="ai-status">

              <span className="status-dot"></span>

              AI ENGINE ONLINE

            </div>


            <h1>
              Teacher <span>Premium</span>
            </h1>


            <h2>
              Your Intelligent AI Teaching Workspace
            </h2>


            <p>
              Create exam papers, notes, MCQs, homework
              and more with powerful AI teaching tools.
            </p>

          </div>


          {/* =================================================
              AI ORB
          ================================================= */}

          <div className="ai-orb">

            <div className="orb-glow"></div>


            <div className="orbit orbit-1">
              <span className="orbit-dot dot-1"></span>
            </div>


            <div className="orbit orbit-2">
              <span className="orbit-dot dot-2"></span>
            </div>


            <div className="orbit orbit-3">
              <span className="orbit-dot dot-3"></span>
            </div>


            <div className="orb-core">

              <div className="core-inner">
                G
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            TOOLS HEADING
        ================================================= */}

        <div className="tools-heading">

          <div>

            <h2>
              AI Teaching Tools
            </h2>

            <p>
              Powerful tools designed for modern teachers
            </p>

          </div>


          <div className="premium-badge">

            <FaCrown />

            PREMIUM

          </div>

        </div>


        {/* =================================================
            TOOL CARDS
        ================================================= */}

        <div className="premium-cards">


          {/* EXAM PAPER */}

          <div
            className="premium-card"
            onClick={() =>
              goTo("/teacher-test-paper")
            }
          >

            <div className="card-icon">
              <FaFileAlt />
            </div>

            <h3>
              AI Exam Paper Generator
            </h3>

            <p>
              Create board pattern papers instantly
            </p>

            <div className="card-line"></div>

          </div>


          {/* AI NOTES */}

          <div
            className="premium-card"
            onClick={() =>
              goTo("/teacher-ai-notes")
            }
          >

            <div className="card-icon">
              <FaBook />
            </div>

            <h3>
              AI Notes Generator
            </h3>

            <p>
              Generate complete chapter notes
            </p>

            <div className="card-line"></div>

          </div>


          {/* AI MCQS */}

          <div
            className="premium-card"
            onClick={() =>
              goTo("/teacher-mcqs")
            }
          >

            <div className="card-icon">
              <FaQuestionCircle />
            </div>

            <h3>
              AI MCQs Generator
            </h3>

            <p>
              Create unlimited MCQs with answers
            </p>

            <div className="card-line"></div>

          </div>


          {/* HOMEWORK */}

          <div
            className="premium-card"
            onClick={() =>
              goTo("/teacher-homework")
            }
          >

            <div className="card-icon">
              <FaClipboard />
            </div>

            <h3>
              Homework Generator
            </h3>

            <p>
              Generate smart homework tasks
            </p>

            <div className="card-line"></div>

          </div>


          {/* CLASSWORK */}

          <div
            className="premium-card"
            onClick={() =>
              goTo("/teacher-classwork")
            }
          >

            <div className="card-icon">
              <FaLayerGroup />
            </div>

            <h3>
              Classwork Generator
            </h3>

            <p>
              Create complete classroom activities
            </p>

            <div className="card-line"></div>

          </div>


          {/* FLASHCARDS */}

          <div
            className="premium-card"
            onClick={() =>
              goTo("/teacher-flashcards")
            }
          >

            <div className="card-icon">
              <FaBook />
            </div>

            <h3>
              AI Flashcards Generator
            </h3>

            <p>
              Create unlimited study flashcards
            </p>

            <div className="card-line"></div>

          </div>


          {/* MY FILES */}

          <div
            className="premium-card"
            onClick={() =>
              goTo("/my-files")
            }
          >

            <div className="card-icon">
              <FaFolderOpen />
            </div>

            <h3>
              My Files
            </h3>

            <p>
              Access and manage your saved files
            </p>

            <div className="card-line"></div>

          </div>


          {/* ANSWER KEYS */}

          <div
            className="premium-card"
            onClick={() =>
              goTo("/teacher-answer-key")
            }
          >

            <div className="card-icon">
              <FaKey />
            </div>

            <h3>
              Answer Key Generator
            </h3>

            <p>
              Automatically create answer keys
            </p>

            <div className="card-line"></div>

          </div>


          {/* PDF */}

          <div
            className="premium-card"
            onClick={() =>
              goTo("/pdf-download")
            }
          >

            <div className="card-icon">
              <FaDownload />
            </div>

            <h3>
              PDF Export
            </h3>

            <p>
              Download your work without watermark
            </p>

            <div className="card-line"></div>

          </div>

        </div>


        {/* =================================================
            RECENT ACTIVITY
        ================================================= */}

        <div className="recent-box">

          <div className="recent-icon">
            <FaHistory />
          </div>


          <div>

            <h3>
              Recent Activity
            </h3>

            <p>
              No activity yet
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}

export default TeacherPremiumDashboard;