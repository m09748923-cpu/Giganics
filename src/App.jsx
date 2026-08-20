import { BrowserRouter, Routes, Route } from "react-router-dom";

// =========================
// GENERAL PAGES
// =========================

import LandingPage from "./pages/LandingPage";
import FeaturesPage from "./pages/FeaturesPage";
import MyFiles from "./pages/MyFiles";
import Flashcards from "./pages/Flashcards";
import MCQs from "./pages/MCQs";
import Revision from "./pages/Revision";
import Progress from "./pages/Progress";
import PDFDownload from "./pages/PDFDownload";
import ExamSimulator from "./ExamSimulator/ExamSimulator";

// =========================
// AUTH
// =========================

import SignUp from "./auth/SignUp";
import SignIn from "./auth/SignIn";
import ForgotPassword from "./auth/ForgotPassword";

// =========================
// SUBSCRIPTION
// =========================

import SubscriptionPlans from "./pages/SubscriptionPlans";

// =========================
// STUDENT DASHBOARDS
// =========================

import StudentDashboard from "./pages/StudentDashboard";
import StudentBasicDashboard from "./pages/StudentBasicDashboard";
import StudentPremiumDashboard from "./pages/StudentPremiumDashboard";

import AINotes from "./pages/AINotes";
import Homework from "./pages/Homework";

// =========================
// TEACHER DASHBOARDS
// =========================

import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherPremiumDashboard from "./pages/TeacherPremiumDashboard";

// =========================
// TEACHER AI PAGES
// =========================

import TeacherAINotes from "./pages/TeacherAINotes";
import TeacherHomework from "./pages/TeacherHomework";
import TeacherClasswork from "./pages/TeacherClasswork";
import TeacherTestPaper from "./pages/TeacherTestPaper";
import TeacherMCQs from "./pages/TeacherMCQs";
import TeacherFlashcards from "./pages/TeacherFlashcards";
import TeacherAnswerKey from "./pages/TeacherAnswerKey";


function App() {
  return (
    <BrowserRouter basename="/Giganics">

      <Routes>

        {/* ==================================================
            GENERAL
        ================================================== */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/features"
          element={<FeaturesPage />}
        />

        <Route
          path="/my-files"
          element={<MyFiles />}
        />

        <Route
          path="/pdf-download"
          element={<PDFDownload />}
        />

        <Route
          path="/exam-simulator"
          element={<ExamSimulator />}
        />


        {/* ==================================================
            AUTHENTICATION
        ================================================== */}

        <Route
          path="/signup"
          element={<SignUp />}
        />

        <Route
          path="/signin"
          element={<SignIn />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        {/* ==================================================
            SUBSCRIPTION
        ================================================== */}

        <Route
          path="/subscription-plans"
          element={<SubscriptionPlans />}
        />


        {/* ==================================================
            STUDENT
        ================================================== */}

        <Route
          path="/student-dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/student-basic-dashboard"
          element={<StudentBasicDashboard />}
        />

        <Route
          path="/student-premium-dashboard"
          element={<StudentPremiumDashboard />}
        />


        {/* ==================================================
            STUDENT AI TOOLS
        ================================================== */}

        <Route
          path="/ai-notes"
          element={<AINotes />}
        />

        <Route
          path="/homework"
          element={<Homework />}
        />

        <Route
          path="/mcqs"
          element={<MCQs />}
        />

        <Route
          path="/flashcards"
          element={<Flashcards />}
        />

        <Route
          path="/revision"
          element={<Revision />}
        />

        <Route
          path="/progress"
          element={<Progress />}
        />


        {/* ==================================================
            TEACHER FREE DASHBOARD
        ================================================== */}

        <Route
          path="/teacher-dashboard"
          element={<TeacherDashboard />}
        />


        {/* ==================================================
            TEACHER PREMIUM DASHBOARD
        ================================================== */}

        <Route
          path="/teacher-premium-dashboard"
          element={<TeacherPremiumDashboard />}
        />


        {/* ==================================================
            TEACHER AI TOOLS
        ================================================== */}

        {/* AI NOTES */}

        <Route
          path="/teacher-ai-notes"
          element={<TeacherAINotes />}
        />


        {/* HOMEWORK */}

        <Route
          path="/teacher-homework"
          element={<TeacherHomework />}
        />


        {/* CLASSWORK */}

        <Route
          path="/teacher-classwork"
          element={<TeacherClasswork />}
        />


        {/* TEST PAPER */}

        <Route
          path="/teacher-test-paper"
          element={<TeacherTestPaper />}
        />


        {/* MCQs */}

        <Route
          path="/teacher-mcqs"
          element={<TeacherMCQs />}
        />


        {/* FLASHCARDS */}

        <Route
          path="/teacher-flashcards"
          element={<TeacherFlashcards />}
        />


        {/* ANSWER KEY */}

        <Route
          path="/teacher-answer-key"
          element={<TeacherAnswerKey />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;