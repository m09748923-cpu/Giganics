import "./TeacherDashboard.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  FaHome,
  FaBook,
  FaClipboardList,
  FaFileAlt,
  FaQuestionCircle,
  FaLayerGroup,
  FaCog,
  FaRegStickyNote,
  FaBell,
  FaSearch,
  FaUserCircle,
  FaFolderOpen,
  FaCrown,
} from "react-icons/fa";

function TeacherDashboard() {
  const navigate = useNavigate();

  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [plan, setPlan] = useState("teacher_free");

  // =========================================
  // TEACHER FREE LIMITS
  // =========================================

  const teacherFreeLimits = {
    notes: 5,
    mcqs: 5,
    homework: 3,
    classwork: 3,
    testPapers: 2,
    flashcards: 5,
    myFiles: 10,
  };

  // =========================================
  // TEACHER ROLE + PLAN
  // =========================================

  useEffect(() => {
    localStorage.setItem("role", "teacher");

    const savedPlan =
      localStorage.getItem("plan");

    const validTeacherPlan =
      savedPlan === "teacher_premium" ||
      savedPlan === "teacher_pro"
        ? savedPlan
        : "teacher_free";

    setPlan(validTeacherPlan);

    const popupClosed =
      localStorage.getItem("upgradePopupClosed");

    if (
      validTeacherPlan === "teacher_free" &&
      !popupClosed
    ) {
      setShowUpgradePopup(true);
    }
  }, []);

  // =========================================
  // CLOSE POPUP
  // =========================================

  const closePopup = () => {
    localStorage.setItem(
      "upgradePopupClosed",
      "true"
    );

    setShowUpgradePopup(false);
  };

  // =========================================
  // TEACHER SUBSCRIPTION
  // =========================================

  const openTeacherPlans = () => {
    localStorage.setItem("role", "teacher");

    navigate(
      "/subscription-plans?role=teacher"
    );
  };

  // =========================================
  // PLAN CHECK
  // =========================================

  const isPremium =
    plan === "teacher_premium" ||
    plan === "teacher_pro";

  // =========================================
  // TEACHER NAVIGATION
  // =========================================

  const openTeacherNotes = () => {
    navigate("/teacher-ai-notes");
  };

  const openTeacherHomework = () => {
    navigate("/teacher-homework");
  };

  const openTeacherClasswork = () => {
    navigate("/teacher-classwork");
  };

  const openTeacherTestPapers = () => {
    navigate("/teacher-test-paper");
  };

  const openTeacherMCQs = () => {
    navigate("/teacher-mcqs");
  };

  const openTeacherFlashcards = () => {
    navigate("/teacher-flashcards");
  };

  const openTeacherFiles = () => {
    navigate("/my-files");
  };

  return (
    <div className="dashboard">

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside className="sidebar">

        <div className="logo">

          <div className="logo-icon">
            G
          </div>

          <span className="logo-text">
            Giganics
          </span>

        </div>

        <ul className="menu">

          {/* DASHBOARD */}

          <li>
            <FaHome />
            <span>Dashboard</span>
          </li>

          {/* NOTES */}

          <li onClick={openTeacherNotes}>
            <FaBook />
            <span>Notes</span>
          </li>

          {/* HOMEWORK */}

          <li onClick={openTeacherHomework}>
            <FaClipboardList />
            <span>Homework</span>
          </li>

          {/* CLASSWORK */}

          <li onClick={openTeacherClasswork}>
            <FaRegStickyNote />
            <span>Classwork</span>
          </li>

          {/* TEST PAPERS */}

          <li onClick={openTeacherTestPapers}>
            <FaFileAlt />
            <span>Test Papers</span>
          </li>

          {/* MCQs */}

          <li onClick={openTeacherMCQs}>
            <FaQuestionCircle />
            <span>MCQs</span>
          </li>

          {/* FLASHCARDS */}

          <li onClick={openTeacherFlashcards}>
            <FaLayerGroup />
            <span>Flashcards</span>
          </li>

          {/* MY FILES */}

          <li onClick={openTeacherFiles}>
            <FaFolderOpen />
            <span>My Files</span>
          </li>

          {/* SETTINGS */}

          <li>
            <FaCog />
            <span>Settings</span>
          </li>

        </ul>

      </aside>

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="main-content">

        {/* =========================================
            TOPBAR
        ========================================= */}

        <header className="topbar">

          {/* SEARCH */}

          <div className="search-box">

            <FaSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search..."
            />

          </div>

          {/* TOPBAR RIGHT */}

          <div className="topbar-right">

            {/* UPGRADE */}

            <button
              className="upgrade-btn"
              onClick={openTeacherPlans}
            >
              <FaCrown />

              <span>
                {isPremium
                  ? "Premium"
                  : "Upgrade"}
              </span>

            </button>

            {/* NOTIFICATION */}

            <button className="notification">
              <FaBell />
            </button>

            {/* PROFILE */}

            <div className="profile">

              <FaUserCircle
                className="profile-icon"
              />

              <span>
                Teacher
              </span>

            </div>

          </div>

        </header>

        {/* =========================================
            HERO
        ========================================= */}

        <section className="hero">

          <div className="hero-plan">

            <FaCrown />

            <span>
              {isPremium
                ? "Teacher Premium"
                : "Teacher Free"}
            </span>

          </div>

          <h2>
            Welcome to Giganics
          </h2>

          <p>
            Create Notes, Homework, Classwork,
            MCQs, Flashcards and Test Papers
            for your students using AI.
          </p>

        </section>

        {/* =========================================
            CARDS
        ========================================= */}

        <section className="cards">

          {/* NOTES */}

          <div
            className="card"
            onClick={openTeacherNotes}
          >

            <FaBook className="card-icon" />

            <h3>
              Notes
            </h3>

            <p>
              {isPremium
                ? "Unlimited AI Notes"
                : `Generate Notes • ${teacherFreeLimits.notes}/day`}
            </p>

          </div>

          {/* HOMEWORK */}

          <div
            className="card"
            onClick={openTeacherHomework}
          >

            <FaClipboardList
              className="card-icon"
            />

            <h3>
              Homework
            </h3>

            <p>
              {isPremium
                ? "Unlimited Homework"
                : `Generate Homework • ${teacherFreeLimits.homework}/day`}
            </p>

          </div>

          {/* CLASSWORK */}

          <div
            className="card"
            onClick={openTeacherClasswork}
          >

            <FaRegStickyNote
              className="card-icon"
            />

            <h3>
              Classwork
            </h3>

            <p>
              {isPremium
                ? "Unlimited Classwork"
                : `Generate Classwork • ${teacherFreeLimits.classwork}/day`}
            </p>

          </div>

          {/* TEST PAPERS */}

          <div
            className="card"
            onClick={openTeacherTestPapers}
          >

            <FaFileAlt
              className="card-icon"
            />

            <h3>
              Test Papers
            </h3>

            <p>
              {isPremium
                ? "Unlimited Test Papers"
                : `Generate Test Papers • ${teacherFreeLimits.testPapers}/day`}
            </p>

          </div>

          {/* MCQs */}

          <div
            className="card"
            onClick={openTeacherMCQs}
          >

            <FaQuestionCircle
              className="card-icon"
            />

            <h3>
              MCQs
            </h3>

            <p>
              {isPremium
                ? "Unlimited AI MCQs"
                : `Generate MCQs • ${teacherFreeLimits.mcqs}/day`}
            </p>

          </div>

          {/* FLASHCARDS */}

          <div
            className="card"
            onClick={openTeacherFlashcards}
          >

            <FaLayerGroup
              className="card-icon"
            />

            <h3>
              Flashcards
            </h3>

            <p>
              {isPremium
                ? "Unlimited Flashcards"
                : `Generate Flashcards • ${teacherFreeLimits.flashcards}/day`}
            </p>

          </div>

        </section>

      </main>

      {/* =========================================
          UPGRADE POPUP
      ========================================= */}

      {showUpgradePopup && (

        <div className="upgrade-popup-overlay">

          <div className="upgrade-popup">

            {/* CLOSE */}

            <button
              className="popup-close"
              onClick={closePopup}
            >
              ×
            </button>

            {/* ICON */}

            <div className="popup-icon">
              <FaCrown />
            </div>

            {/* TITLE */}

            <h2>
              Teacher Free Plan
            </h2>

            {/* DESCRIPTION */}

            <p>
              You are currently using the
              Teacher Free Plan. Upgrade to
              unlock unlimited AI teaching
              tools and remove Free plan limits.
            </p>

            {/* BUTTONS */}

            <div className="popup-buttons">

              <button
                className="popup-upgrade-btn"
                onClick={openTeacherPlans}
              >
                Upgrade Now
              </button>

              <button
                className="popup-later-btn"
                onClick={closePopup}
              >
                Maybe Later
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default TeacherDashboard;