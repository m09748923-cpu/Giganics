import "./StudentDashboard.css";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import {
  FaHome,
  FaBook,
  FaClipboardList,
  FaFileAlt,
  FaQuestionCircle,
  FaLayerGroup,
  FaFolderOpen,
  FaBell,
  FaSearch,
  FaUserCircle,
  FaCrown,
  FaGraduationCap,
  FaChartLine,
  FaCheckCircle,
  FaDownload,
  FaSignOutAlt,
} from "react-icons/fa";

import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function StudentBasicDashboard() {
  const navigate = useNavigate();

  const currentPlan =
    localStorage.getItem("plan") || "student_basic";

  // =========================
  // CHECK CURRENT PLAN
  // =========================

  useEffect(() => {
    const plan =
      localStorage.getItem("plan") || "student_basic";

    if (plan === "student_free") {
      navigate("/student-dashboard");
      return;
    }

    if (plan === "student_premium") {
      navigate("/student-premium-dashboard");
      return;
    }
  }, [navigate]);

  // =========================
  // NAVIGATION FUNCTIONS
  // =========================

  const openPlans = () => {
    navigate("/subscription-plans?role=student");
  };

  const openMyFiles = () => {
    navigate("/my-files");
  };

  const openAINotes = () => {
    navigate("/ai-notes");
  };

  const openHomework = () => {
    navigate("/homework");
  };

  const openMCQs = () => {
    navigate("/mcqs");
  };

  const openRevision = () => {
    navigate("/revision");
  };

  const openProgress = () => {
    navigate("/progress");
  };

  const openFlashcards = () => {
    navigate("/flashcards");
  };

  const openPDFDownload = () => {
    navigate("/pdf-download");
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      await signOut(auth);

      localStorage.removeItem("role");
      localStorage.removeItem("plan");

      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="student-dashboard">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="student-sidebar">

        <div className="student-logo">
          <span className="logo-icon">G</span>
          <span>Giganics</span>
        </div>

        <ul>

          <li className="active">
            <FaHome />
            <span>Dashboard</span>
          </li>

          <li onClick={openAINotes}>
            <FaBook />
            <span>AI Notes</span>
          </li>

          <li onClick={openHomework}>
            <FaClipboardList />
            <span>Homework</span>
          </li>

          <li onClick={openMCQs}>
            <FaQuestionCircle />
            <span>MCQs</span>
          </li>

          <li onClick={openFlashcards}>
            <FaLayerGroup />
            <span>Flashcards</span>
          </li>

          <li onClick={openProgress}>
            <FaChartLine />
            <span>Progress</span>
          </li>

          <li onClick={openMyFiles}>
            <FaFolderOpen />
            <span>My Files</span>
          </li>

          {/* =========================
              LOG OUT
          ========================= */}

          <li onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Log Out</span>
          </li>

        </ul>

      </aside>


      {/* =========================
          MAIN
      ========================= */}

      <main className="student-main">

        {/* =========================
            TOP BAR
        ========================= */}

        <header className="student-topbar">

          <div className="student-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search..."
            />

          </div>


          <div className="student-right">

            <button
              className="student-upgrade-btn"
              onClick={openPlans}
            >
              <FaCrown />
              Upgrade to Premium
            </button>

            <FaBell className="top-icon" />

            <div className="student-profile">

              <FaUserCircle />

              <span>Student</span>

            </div>

          </div>

        </header>


        {/* =========================
            HERO
        ========================= */}

        <section className="student-hero">

          <div>

            <h1>Welcome Back</h1>

            <p>
              Learn smarter with Giganics Basic.
              Create unlimited AI Notes,
              practice unlimited MCQs,
              use unlimited Flashcards,
              complete Homework,
              create Revision Sheets
              and download your work as PDF.
            </p>

          </div>

          <FaGraduationCap className="hero-icon" />

        </section>


        {/* =========================
            FEATURE CARDS
        ========================= */}

        <section className="student-cards">

          <div
            className="student-card"
            onClick={openAINotes}
          >
            <FaBook />

            <h3>AI Notes</h3>

            <p>
              Create smart AI Notes.
            </p>

            <span>Unlimited</span>

          </div>


          <div
            className="student-card"
            onClick={openHomework}
          >
            <FaClipboardList />

            <h3>Homework</h3>

            <p>
              Complete homework with AI help.
            </p>

            <span>Unlimited</span>

          </div>


          <div
            className="student-card"
            onClick={openMCQs}
          >
            <FaQuestionCircle />

            <h3>MCQs</h3>

            <p>
              Practice questions with AI.
            </p>

            <span>Unlimited</span>

          </div>


          <div
            className="student-card"
            onClick={openFlashcards}
          >
            <FaLayerGroup />

            <h3>Flashcards</h3>

            <p>
              Revise quickly with flashcards.
            </p>

            <span>Unlimited</span>

          </div>


          <div
            className="student-card"
            onClick={openProgress}
          >
            <FaChartLine />

            <h3>Progress</h3>

            <p>
              Track your learning journey.
            </p>

            <span>Advanced Tracking</span>

          </div>


          <div
            className="student-card"
            onClick={openRevision}
          >
            <FaFileAlt />

            <h3>Revision</h3>

            <p>
              Quick revision sheets.
            </p>

            <span>Unlimited</span>

          </div>


          <div
            className="student-card"
            onClick={openPDFDownload}
          >
            <FaDownload />

            <h3>PDF Download</h3>

            <p>
              Download your study material as PDF.
            </p>

            <span>Available</span>

          </div>

        </section>


        {/* =========================
            MY PLAN
        ========================= */}

        <section className="student-plan-card">

          <div className="student-plan-left">

            <div className="plan-title">

              <FaCrown />

              <h2>My Plan</h2>

            </div>


            <p className="plan-name">

              {currentPlan === "student_basic"
                ? "Student Basic"
                : "Student Basic"}

            </p>


            <p className="plan-description">

              Enjoy unlimited AI learning tools,
              faster AI generation and PDF downloads.

            </p>

          </div>


          <div className="student-plan-right">

            <button className="current-plan-btn">

              <FaCheckCircle />

              Current Plan

            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default StudentBasicDashboard;