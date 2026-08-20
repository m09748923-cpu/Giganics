import "./StudentPremiumDashboard.css";
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
  FaBolt,
  FaInfinity,
  FaBrain,
  FaChartBar,
  FaClipboardCheck,
  FaSignOutAlt,
} from "react-icons/fa";

import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function StudentPremiumDashboard() {
  const navigate = useNavigate();

  // =========================
  // PLAN PROTECTION
  // =========================

  useEffect(() => {
    const plan =
      localStorage.getItem("plan") || "student_premium";

    if (plan === "student_free") {
      navigate("/student-dashboard");
      return;
    }

    if (plan === "student_basic") {
      navigate("/student-basic-dashboard");
      return;
    }
  }, [navigate]);

  // =========================
  // NAVIGATION
  // =========================

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

  const openFlashcards = () => {
    navigate("/flashcards");
  };

  const openRevision = () => {
    navigate("/revision");
  };

  const openProgress = () => {
    navigate("/progress");
  };

  const openPDFDownload = () => {
    navigate("/pdf-download");
  };

  const openExamSimulator = () => {
    navigate("/exam-simulator");
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
    <div className="premium-dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="premium-sidebar">

        <div className="premium-logo">
          <span className="premium-logo-icon">G</span>
          <span>Giganics</span>
        </div>

        <ul>

          <li className="premium-active">
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

          <li onClick={openRevision}>
            <FaFileAlt />
            <span>Revision</span>
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


      {/* ================= MAIN ================= */}

      <main className="premium-main">

        {/* ================= TOPBAR ================= */}

        <header className="premium-topbar">

          <div className="premium-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search..."
            />

          </div>


          <div className="premium-right">

            <div className="premium-badge">
              <FaCrown />
              Premium
            </div>

            <FaBell className="premium-top-icon" />

            <div className="premium-profile">

              <FaUserCircle />

              <span>Student</span>

            </div>

          </div>

        </header>


        {/* ================= PREMIUM HERO ================= */}

        <section className="premium-hero">

          <div className="premium-hero-content">

            <div className="premium-label">
              <FaCrown />
              Giganics Premium
            </div>

            <h1>
              Unlock Your Full
              Learning Potential
            </h1>

            <p>
              Unlimited AI tools, advanced learning
              features and powerful progress insights.
            </p>

          </div>


          <div className="premium-hero-icon">

            <FaGraduationCap />

            <div className="premium-glow-icon">
              <FaCrown />
            </div>

          </div>

        </section>


        {/* ================= PREMIUM BENEFITS ================= */}

        <section className="premium-benefits">

          <div className="premium-section-heading">

            <span>
              Premium Benefits
            </span>

            <p>
              Everything unlocked for you
            </p>

          </div>


          <div className="premium-benefit-grid">

            <div className="premium-benefit">

              <div className="benefit-icon">
                <FaInfinity />
              </div>

              <div>
                <h3>Unlimited AI</h3>
                <p>Unlimited AI generations</p>
              </div>

            </div>


            <div className="premium-benefit">

              <div className="benefit-icon">
                <FaBolt />
              </div>

              <div>
                <h3>Priority AI</h3>
                <p>Faster AI processing</p>
              </div>

            </div>


            <div className="premium-benefit">

              <div className="benefit-icon">
                <FaBrain />
              </div>

              <div>
                <h3>Advanced Learning</h3>
                <p>Powerful study tools</p>
              </div>

            </div>


            <div className="premium-benefit">

              <div className="benefit-icon">
                <FaChartBar />
              </div>

              <div>
                <h3>Advanced Analytics</h3>
                <p>Detailed progress insights</p>
              </div>

            </div>

          </div>

        </section>


        {/* ================= PREMIUM TOOLS ================= */}

        <section className="premium-tools">

          <div className="premium-section-heading">

            <span>
              Premium Tools
            </span>

            <p>
              Your complete AI learning toolkit
            </p>

          </div>


          <div className="premium-tool-grid">

            <div
              className="premium-tool-card"
              onClick={openAINotes}
            >

              <FaBook />

              <h3>AI Notes</h3>

              <p>
                Unlimited AI Notes
              </p>

            </div>


            <div
              className="premium-tool-card"
              onClick={openHomework}
            >

              <FaClipboardList />

              <h3>Homework</h3>

              <p>
                Advanced AI assistance
              </p>

            </div>


            <div
              className="premium-tool-card"
              onClick={openMCQs}
            >

              <FaQuestionCircle />

              <h3>MCQs</h3>

              <p>
                Unlimited practice
              </p>

            </div>


            <div
              className="premium-tool-card"
              onClick={openFlashcards}
            >

              <FaLayerGroup />

              <h3>Flashcards</h3>

              <p>
                Unlimited flashcards
              </p>

            </div>


            <div
              className="premium-tool-card"
              onClick={openRevision}
            >

              <FaFileAlt />

              <h3>Revision</h3>

              <p>
                Advanced revision tools
              </p>

            </div>


            <div
              className="premium-tool-card"
              onClick={openProgress}
            >

              <FaChartLine />

              <h3>Progress</h3>

              <p>
                Advanced analytics
              </p>

            </div>


            <div
              className="premium-tool-card"
              onClick={openPDFDownload}
            >

              <FaDownload />

              <h3>PDF Downloads</h3>

              <p>
                Unlimited downloads
              </p>

            </div>


            <div
              className="premium-tool-card"
              onClick={openMyFiles}
            >

              <FaFolderOpen />

              <h3>My Files</h3>

              <p>
                Maximum storage
              </p>

            </div>


            {/* ================= AI EXAM SIMULATOR ================= */}

            <div
              className="premium-tool-card"
              onClick={openExamSimulator}
            >

              <FaClipboardCheck />

              <h3>AI Exam Simulator</h3>

              <p>
                Real exam practice with instant results
              </p>

            </div>

          </div>

        </section>


        {/* ================= MY PLAN ================= */}

        <section className="premium-plan-card">

          <div className="premium-plan-left">

            <div className="premium-plan-title">

              <FaCrown />

              <h2>
                Student Premium
              </h2>

            </div>

            <p>
              All premium features are unlocked.
            </p>

          </div>


          <div className="premium-plan-status">

            <FaCheckCircle />

            Current Plan

          </div>

        </section>

      </main>

    </div>
  );
}

export default StudentPremiumDashboard;