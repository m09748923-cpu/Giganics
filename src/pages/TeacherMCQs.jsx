import "./TeacherMCQs.css";

import {
  FaArrowLeft,
  FaQuestionCircle,
  FaMagic,
  FaLock,
  FaClipboardList,
  FaCrown,
  FaDownload,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";

function TeacherMCQs() {
  const navigate = useNavigate();

  // ==========================================
  // FORM STATES
  // ==========================================

  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("English");
  const [numberOfMCQs, setNumberOfMCQs] = useState("10");
  const [difficulty, setDifficulty] = useState("Medium");

  // ==========================================
  // RESULT STATES
  // ==========================================

  const [mcqs, setMcqs] = useState("");
  const [loading, setLoading] = useState(false);
  const [mcqsCount, setMcqsCount] = useState(0);

  // ==========================================
  // PLAN
  // ==========================================

  const [plan, setPlan] = useState("teacher_free");

  const DAILY_LIMIT = 5;
  const FREE_MAX_FILES = 10;

  const isPremium =
    plan === "teacher_premium" ||
    plan === "teacher_pro";

  // ==========================================
  // LOAD PLAN + RETURN DESTINATION
  // ==========================================

  useEffect(() => {
    const savedPlan =
      localStorage.getItem("plan");

    const savedRole =
      localStorage.getItem("role");

    /*
      Teacher Premium can use:
      teacher_premium
      teacher_pro
    */

    const premiumPlan =
      savedPlan === "teacher_premium" ||
      savedPlan === "teacher_pro";

    /*
      IMPORTANT FIX:

      If Teacher Premium opens MCQs,
      remember that Premium Dashboard
      is the correct Back destination.

      This prevents MCQs from accidentally
      sending Premium users to Teacher Free.
    */

    const savedReturnPath =
      sessionStorage.getItem(
        "teacherMCQsReturnPath"
      );

    if (
      savedRole === "teacher" &&
      premiumPlan
    ) {
      setPlan(savedPlan);

      sessionStorage.setItem(
        "teacherMCQsReturnPath",
        "/teacher-premium-dashboard"
      );
    } else if (
      savedReturnPath ===
      "/teacher-premium-dashboard"
    ) {
      /*
        Keep Premium state if the user
        arrived from the Premium dashboard.
      */

      setPlan(
        premiumPlan
          ? savedPlan
          : "teacher_premium"
      );
    } else {
      setPlan("teacher_free");

      sessionStorage.setItem(
        "teacherMCQsReturnPath",
        "/teacher-dashboard"
      );
    }
  }, []);

  // ==========================================
  // DAILY LIMIT
  // ==========================================

  useEffect(() => {
    /*
      Premium users don't need the daily
      limit counter.
    */

    if (isPremium) {
      return;
    }

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const savedDate =
      localStorage.getItem("mcqsDate");

    const savedCount =
      Number(
        localStorage.getItem("mcqsCount")
      ) || 0;

    if (savedDate === today) {
      setMcqsCount(savedCount);
    } else {
      localStorage.setItem(
        "mcqsDate",
        today
      );

      localStorage.setItem(
        "mcqsCount",
        "0"
      );

      setMcqsCount(0);
    }
  }, [isPremium]);

  // ==========================================
  // BACK
  // ==========================================

  const handleBack = () => {
    const returnPath =
      sessionStorage.getItem(
        "teacherMCQsReturnPath"
      );

    /*
      If MCQs was opened from Premium,
      return to Premium dashboard.

      Otherwise return to Free dashboard.
    */

    if (
      returnPath ===
      "/teacher-premium-dashboard"
    ) {
      navigate(
        "/teacher-premium-dashboard"
      );
      return;
    }

    if (isPremium) {
      navigate(
        "/teacher-premium-dashboard"
      );
      return;
    }

    navigate(
      "/teacher-dashboard"
    );
  };

  // ==========================================
  // GENERATE MCQs
  // ==========================================

  const generateMCQs = async () => {

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    let currentCount =
      Number(
        localStorage.getItem(
          "mcqsCount"
        )
      ) || 0;

    const savedDate =
      localStorage.getItem(
        "mcqsDate"
      );

    // ========================================
    // FREE DAILY COUNTER
    // ========================================

    if (!isPremium) {

      if (savedDate !== today) {

        currentCount = 0;

        localStorage.setItem(
          "mcqsDate",
          today
        );

        localStorage.setItem(
          "mcqsCount",
          "0"
        );

        setMcqsCount(0);
      }

      if (currentCount >= DAILY_LIMIT) {

        alert(
          `Teacher Free limit reached. You can generate ${DAILY_LIMIT} MCQ papers per day.`
        );

        return;
      }
    }

    // ========================================
    // VALIDATION
    // ========================================

    if (!subject) {
      alert("Please select a subject.");
      return;
    }

    if (!className) {
      alert("Please select a class.");
      return;
    }

    if (!topic.trim()) {
      alert("Please enter a topic.");
      return;
    }

    try {

      setLoading(true);
      setMcqs("");

      const apiKey =
        import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error(
          "Gemini API key is missing."
        );
      }

      const ai =
        new GoogleGenAI({
          apiKey,
        });

      // ======================================
      // PREMIUM ENHANCEMENT
      // ======================================

      const premiumInstruction = isPremium
        ? `
Premium Teacher Mode is enabled.

Create high-quality professional MCQs.
Focus on conceptual understanding,
application-based questions,
varied difficulty,
and avoid repetitive question patterns.
`
        : `
Teacher Free Mode is enabled.
Keep questions clear, simple,
and suitable for classroom use.
`;

      // ======================================
      // PROMPT
      // ======================================

      const prompt = `
You are Giganics Teacher AI.

${premiumInstruction}

Create a professional school MCQ worksheet.

Subject: ${subject}
Class: ${className}
Topic: ${topic}
Language: ${language}
Number of MCQs: ${numberOfMCQs}
Difficulty: ${difficulty}

Rules:

- Generate exactly ${numberOfMCQs} questions.
- Every question must have exactly 4 options.
- Options must be A, B, C and D.
- Only one answer can be correct.
- Questions must be suitable for Class ${className}.
- Questions must be related to ${subject}.
- Questions must specifically cover ${topic}.
- Avoid duplicate questions.
- Questions should test understanding.
- Keep explanations short.
- Use simple teacher-friendly language.
- Write everything in ${language}.
- Do not add an introduction.
- Do not add a conclusion.

Use this format:

## Question 1

Question text

**A.** Option A

**B.** Option B

**C.** Option C

**D.** Option D

**Correct Answer:** B

**Explanation:** Short explanation.

Continue until all ${numberOfMCQs} questions are complete.
`;

      // ======================================
      // GEMINI
      // ======================================

      const response =
        await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

      const generated =
        response.text?.trim();

      if (!generated) {
        throw new Error(
          "No MCQs generated."
        );
      }

      setMcqs(generated);

      // ======================================
      // UPDATE FREE DAILY COUNT
      // ======================================

      if (!isPremium) {

        const newCount =
          currentCount + 1;

        localStorage.setItem(
          "mcqsCount",
          String(newCount)
        );

        localStorage.setItem(
          "mcqsDate",
          today
        );

        setMcqsCount(newCount);
      }

      // ======================================
      // SAVE TO MY FILES
      // ======================================

      const savedFiles =
        JSON.parse(
          localStorage.getItem(
            "giganics_files"
          )
        ) || [];

      /*
        Teacher Free:
        maximum 10 files.

        Teacher Premium:
        unlimited files.
      */

      if (
        isPremium ||
        savedFiles.length < FREE_MAX_FILES
      ) {

        const newFile = {

          id: Date.now(),

          title:
            `${subject} - ${topic} MCQs`,

          type: "MCQs",

          date:
            new Date()
              .toLocaleDateString(),

          content: generated,

          subject,
          className,
          topic,
          language,
          numberOfMCQs,
          difficulty,

          plan: isPremium
            ? "teacher_premium"
            : "teacher_free",
        };

        localStorage.setItem(
          "giganics_files",
          JSON.stringify([
            newFile,
            ...savedFiles,
          ])
        );

      } else {

        alert(
          `Teacher Free My Files limit is ${FREE_MAX_FILES} files.`
        );
      }

    } catch (error) {

      console.error(
        "Teacher MCQs Error:",
        error
      );

      alert(
        "MCQs generate nahi ho sake. Gemini API connection check karo."
      );

    } finally {

      setLoading(false);

    }
  };

  // ==========================================
  // PDF
  // ==========================================

  const handlePDF = () => {

    if (!isPremium) {

      alert(
        "PDF Download is available on Teacher Premium."
      );

      return;
    }

    /*
      Actual PDF generation will be connected
      in the next PDF functionality step.
    */

    navigate("/pdf-download");
  };

  // ==========================================
  // RETURN
  // ==========================================

  return (

    <div className="teacher-mcqs-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="teacher-mcqs-header">

        <button
          className="teacher-mcqs-back"
          onClick={handleBack}
        >
          <FaArrowLeft />
          Back
        </button>

        <div className="teacher-mcqs-heading">

          <div className="teacher-mcqs-icon">
            <FaQuestionCircle />
          </div>

          <div>

            <h1>
              Teacher MCQs
            </h1>

            <p>
              Create professional MCQ worksheets
              for your students.
            </p>

          </div>

        </div>

        {/* PLAN BADGE */}

        <div
          className={
            isPremium
              ? "teacher-premium-badge"
              : "teacher-free-badge"
          }
        >

          {isPremium && <FaCrown />}

          {isPremium
            ? "Teacher Premium"
            : "Teacher Free"}

        </div>

      </header>


      {/* ======================================
          MAIN
      ====================================== */}

      <main className="teacher-mcqs-container">


        {/* ====================================
            GENERATOR CARD
        ==================================== */}

        <section className="teacher-mcqs-generator">

          <div className="generator-title">

            <div className="generator-icon">
              <FaClipboardList />
            </div>

            <div>

              <h2>
                Create MCQ Paper
              </h2>

              <p>
                Set the details of your worksheet.
              </p>

            </div>

          </div>


          <div className="teacher-mcqs-form">


            {/* SUBJECT */}

            <div className="mcq-field">

              <label>
                Subject
              </label>

              <select
                value={subject}
                onChange={(e) =>
                  setSubject(e.target.value)
                }
                disabled={loading}
              >

                <option value="">
                  Select Subject
                </option>

                <option>
                  Mathematics
                </option>

                <option>
                  Physics
                </option>

                <option>
                  Chemistry
                </option>

                <option>
                  Biology
                </option>

                <option>
                  Computer Science
                </option>

                <option>
                  English
                </option>

                <option>
                  Urdu
                </option>

                <option>
                  Islamiat
                </option>

                <option>
                  Pakistan Studies
                </option>

                <option>
                  General Science
                </option>

                <option>
                  Social Studies
                </option>

                <option>
                  General Knowledge
                </option>

              </select>

            </div>


            {/* CLASS */}

            <div className="mcq-field">

              <label>
                Class
              </label>

              <select
                value={className}
                onChange={(e) =>
                  setClassName(e.target.value)
                }
                disabled={loading}
              >

                <option value="">
                  Select Class
                </option>

                {Array.from(
                  { length: 12 },
                  (_, i) => (

                    <option
                      key={i + 1}
                      value={i + 1}
                    >
                      Class {i + 1}
                    </option>

                  )
                )}

              </select>

            </div>


            {/* TOPIC */}

            <div className="mcq-field full">

              <label>
                Topic
              </label>

              <input
                type="text"
                value={topic}
                onChange={(e) =>
                  setTopic(e.target.value)
                }
                placeholder="Enter the topic, e.g. Photosynthesis"
                disabled={loading}
              />

            </div>


            {/* LANGUAGE */}

            <div className="mcq-field">

              <label>
                Language
              </label>

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value)
                }
                disabled={loading}
              >

                <option value="English">
                  English
                </option>

                <option value="Urdu">
                  Urdu
                </option>

                <option value="Sindhi">
                  Sindhi
                </option>

              </select>

            </div>


            {/* NUMBER */}

            <div className="mcq-field">

              <label>
                Number of MCQs
              </label>

              <select
                value={numberOfMCQs}
                onChange={(e) =>
                  setNumberOfMCQs(e.target.value)
                }
                disabled={loading}
              >

                <option value="5">
                  5 MCQs
                </option>

                <option value="10">
                  10 MCQs
                </option>

                <option value="15">
                  15 MCQs
                </option>

                <option value="20">
                  20 MCQs
                </option>

              </select>

            </div>


            {/* DIFFICULTY */}

            <div className="mcq-field">

              <label>
                Difficulty
              </label>

              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value)
                }
                disabled={loading}
              >

                <option value="Easy">
                  Easy
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Hard">
                  Hard
                </option>

              </select>

            </div>

          </div>


          {/* ==================================
              BOTTOM
          ================================== */}

          <div className="generator-bottom">


            {/* USAGE */}

            <div className="usage">

              <span>
                {isPremium
                  ? "Premium Usage"
                  : "Daily Usage"}
              </span>

              <strong>
                {isPremium
                  ? "UNLIMITED"
                  : `${mcqsCount} / ${DAILY_LIMIT}`}
              </strong>

            </div>


            {/* GENERATE */}

            <button
              className="generate-button"
              onClick={generateMCQs}
              disabled={
                loading ||
                (
                  !isPremium &&
                  mcqsCount >= DAILY_LIMIT
                )
              }
            >

              <FaMagic />

              {loading
                ? "Generating..."
                : (
                  !isPremium &&
                  mcqsCount >= DAILY_LIMIT
                )
                ? "Daily Limit Reached"
                : "Generate MCQs"}

            </button>

          </div>

        </section>


        {/* ====================================
            RESULT
        ==================================== */}

        {mcqs && (

          <section className="teacher-mcqs-result">


            <div className="result-header">

              <div>

                <span>
                  GENERATED WORKSHEET
                </span>

                <h2>
                  {subject} — {topic}
                </h2>

                <p>
                  Class {className} · {language} ·{" "}
                  {difficulty} · {numberOfMCQs} MCQs
                </p>

              </div>


              {/* PDF */}

              <button
                className="pdf-button"
                onClick={handlePDF}
              >

                {isPremium
                  ? <FaDownload />
                  : <FaLock />
                }

                PDF

                <small>
                  Premium
                </small>

              </button>

            </div>


            {/* =================================
                PAPER
            ================================= */}

            <div className="mcq-paper">

              <div className="paper-header">

                <div>

                  <h3>
                    Giganics
                  </h3>

                  <span>
                    Teacher MCQ Worksheet
                  </span>

                </div>


                <div className="paper-details">

                  <span>
                    Subject: {subject}
                  </span>

                  <span>
                    Class: {className}
                  </span>

                </div>

              </div>


              <div className="paper-title">

                <h2>
                  {topic}
                </h2>

                <span>
                  {numberOfMCQs} Questions
                </span>

              </div>


              <div className="mcq-content">

                <ReactMarkdown>
                  {mcqs}
                </ReactMarkdown>

              </div>

            </div>

          </section>

        )}


        {/* ======================================
            TEACHER FREE UPGRADE
        ====================================== */}

        {!isPremium && (

          <section className="teacher-mcqs-upgrade">

            <div className="upgrade-content">

              <div className="upgrade-icon">
                <FaMagic />
              </div>

              <div>

                <span className="upgrade-label">
                  TEACHER PREMIUM
                </span>

                <h2>
                  Unlock Unlimited MCQs
                </h2>

                <p>
                  Generate unlimited MCQ papers,
                  download PDFs, and unlock more
                  powerful teacher tools.
                </p>

              </div>

            </div>


            <button
              className="upgrade-button"
              onClick={() => {
                localStorage.setItem(
                  "role",
                  "teacher"
                );

                sessionStorage.setItem(
                  "teacherMCQsReturnPath",
                  "/teacher-dashboard"
                );

                navigate(
                  "/subscription-plans?role=teacher"
                );
              }}
            >
              Get Teacher Premium
            </button>

          </section>

        )}

      </main>

    </div>
  );
}

export default TeacherMCQs;