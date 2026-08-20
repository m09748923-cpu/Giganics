import "./StudentDashboard.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

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
  FaSignOutAlt,
} from "react-icons/fa";

import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function StudentDashboard() {
  const navigate = useNavigate();

  const [showUpgradePopup, setShowUpgradePopup] = useState(false);

  const [currentPlan, setCurrentPlan] = useState(
    localStorage.getItem("plan") || "student_free"
  );

  // =====================================================
  // STUDENT ROLE + PLAN CHECK
  // =====================================================

  useEffect(() => {
    // IMPORTANT:
    // This page is ONLY for students.
    // Make sure old teacher role does not control this page.
    localStorage.setItem("role", "student");

    const savedPlan = localStorage.getItem("plan");

    // Agar teacher ka purana plan saved hai,
    // usko student_free mein reset karo.
    const studentPlans = [
      "student_free",
      "student_basic",
      "student_premium",
    ];

    if (!studentPlans.includes(savedPlan)) {
      localStorage.setItem("plan", "student_free");
      setCurrentPlan("student_free");
    } else {
      setCurrentPlan(savedPlan);
    }

    // Student Basic
    if (savedPlan === "student_basic") {
      navigate("/student-basic-dashboard", { replace: true });
      return;
    }

    // Student Premium
    if (savedPlan === "student_premium") {
      navigate("/student-premium-dashboard", { replace: true });
      return;
    }

    // Student Free
    const popupClosed = localStorage.getItem(
      "studentUpgradePopupClosed"
    );

    if (!popupClosed) {
      setShowUpgradePopup(true);
    }
  }, [navigate]);

  // =====================================================
  // NAVIGATION FUNCTIONS
  // =====================================================

  const openPlans = () => {
    // Make sure subscription page knows this is a student
    localStorage.setItem("role", "student");

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

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      await signOut(auth);

      localStorage.removeItem("role");
      localStorage.removeItem("plan");

      navigate("/signin", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // =====================================================
  // CLOSE UPGRADE POPUP
  // =====================================================

  const closeUpgradePopup = () => {
    localStorage.setItem(
      "studentUpgradePopupClosed",
      "true"
    );

    setShowUpgradePopup(false);
  };

  return (
    <div className="student-dashboard">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

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

          <li onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Log Out</span>
          </li>

        </ul>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="student-main">

        {/* =====================================================
            TOP BAR
        ===================================================== */}

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
              Upgrade
            </button>

            <FaBell className="top-icon" />

            <div className="student-profile">

              <FaUserCircle />

              <span>Student</span>

            </div>

          </div>

        </header>

        {/* =====================================================
            UPGRADE POPUP
        ===================================================== */}

        {showUpgradePopup && (

          <div className="student-popup-overlay">

            <div className="student-popup">

              <button
                className="popup-close"
                onClick={closeUpgradePopup}
              >
                ×
              </button>

              <h2>Student Free Plan</h2>

              <p>
                Upgrade to unlock unlimited AI Notes,
                Practice MCQs,
                Flashcards,
                Revision Sheets
                and many more premium features.
              </p>

              <div className="popup-buttons">

                <button
                  className="popup-upgrade-btn"
                  onClick={openPlans}
                >
                  Upgrade Now
                </button>

                <button
                  className="popup-later-btn"
                  onClick={closeUpgradePopup}
                >
                  Maybe Later
                </button>

              </div>

            </div>

          </div>

        )}

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="student-hero">

          <div>

            <h1>Welcome Back</h1>

            <p>
              Learn smarter with AI.
              Generate Notes,
              Practice MCQs,
              Flashcards,
              Homework
              and much more.
            </p>

          </div>

          <FaGraduationCap className="hero-icon" />

        </section>

        {/* =====================================================
            FEATURE CARDS
        ===================================================== */}

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

            <span>10 per day</span>

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

            <span>3 per day</span>

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

            <span>10 per day</span>

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

            <span>5 per day</span>

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

            <span>2 per day</span>

          </div>

        </section>

        {/* =====================================================
            MY PLAN
        ===================================================== */}

        <section className="student-plan-card">

          <div className="student-plan-left">

            <div className="plan-title">

              <FaCrown />

              <h2>My Plan</h2>

            </div>

            <p className="plan-name">

              {currentPlan === "student_free" &&
                "Student Free"}

              {currentPlan === "student_basic" &&
                "Student Basic"}

              {currentPlan === "student_premium" &&
                "Student Premium"}

            </p>

            <p className="plan-description">

              {currentPlan === "student_free" &&
                "You are currently using the free plan."}

              {currentPlan === "student_basic" &&
                "Enjoy unlimited AI learning tools."}

              {currentPlan === "student_premium" &&
                "You have access to every premium feature."}

            </p>

          </div>

          <div className="student-plan-right">

            {currentPlan === "student_free" ? (

              <button
                className="student-upgrade-btn"
                onClick={openPlans}
              >
                <FaCrown />
                Upgrade
              </button>

            ) : (

              <button className="current-plan-btn">

                <FaCheckCircle />

                Current Plan

              </button>

            )}

          </div>

        </section>

      </main>

    </div>
  );
}

export default StudentDashboard;