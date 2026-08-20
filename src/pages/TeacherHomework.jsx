import "./TeacherHomework.css";

import {
  FaArrowLeft,
  FaBookOpen,
  FaWandMagicSparkles,
  FaDownload,
  FaRotateRight,
  FaFileLines,
  FaGraduationCap,
  FaCrown,
  FaLock,
} from "react-icons/fa6";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const TEACHER_HOMEWORK_LIMIT = 3;
const FREE_MAX_FILES = 10;

const getToday = () =>
  new Date().toISOString().split("T")[0];

function TeacherHomework() {
  const navigate = useNavigate();

  // =========================================
  // FORM
  // =========================================

  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("English");
  const [questionCount, setQuestionCount] = useState("10");

  // =========================================
  // RESULT
  // =========================================

  const [generatedHomework, setGeneratedHomework] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================
  // PLAN
  // =========================================

  const [plan, setPlan] = useState("teacher_free");

  const isPremium =
    plan === "teacher_premium" ||
    plan === "teacher_pro";

  // =========================================
  // DAILY COUNT
  // =========================================

  const [homeworkCount, setHomeworkCount] =
    useState(0);

  // =========================================
  // LOAD PLAN + COUNT
  // =========================================

  useEffect(() => {
    const savedPlan =
      localStorage.getItem("plan");

    const savedRole =
      localStorage.getItem("role");

    if (
      savedRole === "teacher" &&
      (
        savedPlan === "teacher_premium" ||
        savedPlan === "teacher_pro"
      )
    ) {
      setPlan(savedPlan);
    } else {
      setPlan("teacher_free");
    }
  }, []);

  useEffect(() => {
    if (isPremium) {
      return;
    }

    const today = getToday();

    const savedDate =
      localStorage.getItem(
        "teacherHomeworkDate"
      );

    const savedCount =
      Number(
        localStorage.getItem(
          "teacherHomeworkCount"
        ) || "0"
      );

    if (savedDate !== today) {
      localStorage.setItem(
        "teacherHomeworkDate",
        today
      );

      localStorage.setItem(
        "teacherHomeworkCount",
        "0"
      );

      setHomeworkCount(0);
    } else {
      setHomeworkCount(savedCount);
    }
  }, [isPremium]);

  // =========================================
  // GET CURRENT COUNT
  // =========================================

  const getTodayHomeworkCount = () => {
    const today = getToday();

    const savedDate =
      localStorage.getItem(
        "teacherHomeworkDate"
      );

    if (savedDate !== today) {
      localStorage.setItem(
        "teacherHomeworkDate",
        today
      );

      localStorage.setItem(
        "teacherHomeworkCount",
        "0"
      );

      return 0;
    }

    return Number(
      localStorage.getItem(
        "teacherHomeworkCount"
      ) || "0"
    );
  };

  // =========================================
  // GENERATE HOMEWORK
  // =========================================

  const generateHomework = async () => {
    setError("");
    setSuccess("");

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    if (!className.trim()) {
      setError("Please enter the class.");
      return;
    }

    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    // -----------------------------------------
    // FREE LIMIT
    // -----------------------------------------

    const currentCount =
      getTodayHomeworkCount();

    if (
      !isPremium &&
      currentCount >=
        TEACHER_HOMEWORK_LIMIT
    ) {
      setError(
        "Teacher Free daily limit reached. You can generate more homework tomorrow."
      );
      return;
    }

    try {
      setLoading(true);
      setGeneratedHomework("");

      // ---------------------------------------
      // API KEY
      // ---------------------------------------

      const apiKey =
        import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error(
          "Gemini API key not found. Please check your .env file."
        );
      }

      const ai = new GoogleGenAI({
        apiKey,
      });

      // ---------------------------------------
      // PLAN INSTRUCTION
      // ---------------------------------------

      const premiumInstruction = isPremium
        ? `
TEACHER PREMIUM MODE:

Create highly polished, professional,
classroom-ready homework.

Use strong conceptual questions,
application-based practice,
age-appropriate difficulty,
and varied question styles.

Make the homework feel like a professional
teacher-created assignment.
`
        : `
TEACHER FREE MODE:

Create clear, useful,
classroom-ready homework.

Keep questions simple,
educational and appropriate
for the selected class.
`;

      // ---------------------------------------
      // PROMPT
      // ---------------------------------------

      const prompt = `
You are Giganics Teacher AI.

${premiumInstruction}

Create REAL STUDENT HOMEWORK / HOME ASSIGNMENT.

This is NOT a test paper.
This is NOT an exam.
This is NOT an MCQ paper.

The purpose is to give students practice
after teaching a lesson.

HOMEWORK DETAILS:

Subject: ${subject}
Class: ${className}
Topic: ${topic}
Language: ${language}
Number of Questions: ${questionCount}

IMPORTANT RULES:

1. Create exactly ${questionCount} numbered homework questions.
2. Questions must be directly related to "${topic}".
3. Questions must be appropriate for ${className}.
4. Make the homework feel like normal school textbook/exercise homework.
5. Prefer written practice, conceptual practice, examples, exercises and application questions.
6. Do NOT create an exam paper.
7. Do NOT create marks, total marks, time allowed, passing marks or exam instructions.
8. Do NOT use Section A, Section B or Section C exam structure.
9. Do NOT automatically create MCQs.
10. Do NOT automatically create True/False.
11. Do NOT automatically create Fill in the Blanks.
12. Use MCQs only if genuinely useful for the selected topic.
13. For Mathematics, Physics, Chemistry and similar subjects, include problems/exercises that students need to solve.
14. For English, Urdu and Sindhi, include writing, grammar, comprehension, vocabulary or translation practice where appropriate.
15. For Science subjects, include conceptual and practical/application questions.
16. For Social Studies, History and Geography, include short-answer and understanding questions.
17. Do not provide answers.
18. Do not provide an answer key.
19. Do not mention AI.
20. Do not add unnecessary teacher explanations.
21. Do NOT use $ signs for mathematical formulas.
22. Do NOT use LaTeX delimiters.
23. Write mathematical expressions in simple readable text.
24. Use Unicode symbols such as ×, ÷, √, ≤, ≥ and ² where appropriate.
25. Keep the homework clean and easy to read.
26. Do not use unnecessary decorative symbols.

FORMAT:

# HOMEWORK

**Subject:** ${subject}

**Class:** ${className}

**Topic:** ${topic}

**Student Name:** ______________________________

**Roll No:** ____________________

**Date:** ____________________

---

## Instructions

Write 2 or 3 short and simple instructions for students.

---

## Homework

Write exactly ${questionCount} useful homework questions.

Questions should progress from easier practice
to slightly more challenging/application questions
when appropriate.

At the end add:

**Teacher's Signature:** ______________________________

The entire homework must be written in ${language}.
`;

      // ---------------------------------------
      // GEMINI
      // ---------------------------------------

      const response =
        await ai.models.generateContent({
          model:
            import.meta.env
              .VITE_GEMINI_MODEL ||
            "gemini-3.5-flash",
          contents: prompt,
        });

      const text =
        typeof response.text === "function"
          ? response.text()
          : response.text;

      if (!text?.trim()) {
        throw new Error(
          "AI did not return any homework."
        );
      }

      // ---------------------------------------
      // SAVE RESULT
      // ---------------------------------------

      setGeneratedHomework(
        text.trim()
      );

      // ---------------------------------------
      // FREE COUNTER
      // ---------------------------------------

      if (!isPremium) {
        const newCount =
          currentCount + 1;

        const today = getToday();

        localStorage.setItem(
          "teacherHomeworkDate",
          today
        );

        localStorage.setItem(
          "teacherHomeworkCount",
          String(newCount)
        );

        setHomeworkCount(newCount);
      }

      // ---------------------------------------
      // SAVE TO MY FILES
      // ---------------------------------------

      saveHomeworkToFiles(
        text.trim()
      );

      setSuccess(
        "Homework generated successfully."
      );

    } catch (err) {
      console.error(
        "Teacher Homework Error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while generating homework."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // SAVE TO MY FILES
  // =========================================

  const saveHomeworkToFiles = (
    content
  ) => {
    try {
      const existingFiles =
        JSON.parse(
          localStorage.getItem(
            "giganics_files"
          ) || "[]"
        );

      // ---------------------------------------
      // FREE = MAX 10 FILES
      // PREMIUM = UNLIMITED
      // ---------------------------------------

      if (
        !isPremium &&
        existingFiles.length >=
          FREE_MAX_FILES
      ) {
        setSuccess(
          "Homework generated. Your Teacher Free My Files limit is full."
        );

        return;
      }

      const newFile = {
        id: Date.now(),

        type: "teacher_homework",

        title:
          `${subject} - ${topic} Homework`,

        subject,
        className,
        topic,
        language,

        questionCount,

        content,

        plan: isPremium
          ? "teacher_premium"
          : "teacher_free",

        createdAt:
          new Date().toISOString(),
      };

      localStorage.setItem(
        "giganics_files",
        JSON.stringify([
          newFile,
          ...existingFiles,
        ])
      );

    } catch (err) {
      console.error(
        "Could not save homework:",
        err
      );
    }
  };

  // =========================================
  // RESET
  // =========================================

  const resetHomework = () => {
    setSubject("");
    setClassName("");
    setTopic("");
    setLanguage("English");
    setQuestionCount("10");

    setGeneratedHomework("");
    setError("");
    setSuccess("");
  };

  // =========================================
  // PDF
  // =========================================

  const downloadPDF = async () => {

    // ---------------------------------------
    // PREMIUM ONLY
    // ---------------------------------------

    if (!isPremium) {
      setError(
        "PDF Download is available only on Teacher Premium. Upgrade your plan to unlock PDF downloads."
      );
      return;
    }

    const element =
      document.getElementById(
        "teacher-homework-paper"
      );

    if (
      !element ||
      !generatedHomework
    ) {
      setError(
        "Please generate homework first."
      );
      return;
    }

    try {
      setError("");

      const canvas =
        await html2canvas(
          element,
          {
            scale: 2,
            useCORS: true,
            backgroundColor:
              "#ffffff",
            logging: false,
          }
        );

      const imgData =
        canvas.toDataURL(
          "image/png"
        );

      const pdf =
        new jsPDF({
          orientation:
            "portrait",
          unit: "mm",
          format: "a4",
        });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;

      const usableWidth =
        pageWidth -
        margin * 2;

      const usableHeight =
        pageHeight -
        margin * 2;

      const imageHeight =
        (canvas.height *
          usableWidth) /
        canvas.width;

      let heightLeft =
        imageHeight;

      let position = margin;

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position,
        usableWidth,
        imageHeight
      );

      heightLeft -=
        usableHeight;

      while (
        heightLeft > 0
      ) {
        position =
          margin -
          (imageHeight -
            heightLeft);

        pdf.addPage();

        pdf.addImage(
          imgData,
          "PNG",
          margin,
          position,
          usableWidth,
          imageHeight
        );

        heightLeft -=
          usableHeight;
      }

      const safeSubject =
        subject
          .replace(
            /[^\w\s-]/g,
            ""
          )
          .trim() ||
        "Homework";

      const safeTopic =
        topic
          .replace(
            /[^\w\s-]/g,
            ""
          )
          .trim() ||
        "Assignment";

      pdf.save(
        `Giganics-${safeSubject}-${safeTopic}-Homework.pdf`
      );

    } catch (err) {
      console.error(
        "PDF Error:",
        err
      );

      setError(
        "PDF could not be generated. Please try again."
      );
    }
  };

  // =========================================
  // REMAINING
  // =========================================

  const remaining =
    isPremium
      ? Infinity
      : Math.max(
          0,
          TEACHER_HOMEWORK_LIMIT -
            homeworkCount
        );

  // =========================================
  // BACK
  // =========================================

  const handleBack = () => {
    navigate(
      isPremium
        ? "/teacher-premium-dashboard"
        : "/teacher-dashboard"
    );
  };

  // =========================================
  // RETURN
  // =========================================

  return (
    <div className="teacher-homework-page">

      {/* HEADER */}

      <header className="teacher-homework-header">

        <button
          className="teacher-homework-back"
          onClick={handleBack}
          type="button"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>

        <div className="teacher-homework-title">

          <div className="teacher-homework-title-icon">
            <FaBookOpen />
          </div>

          <div>
            <h1>
              Teacher Homework
            </h1>

            <p>
              Create real classroom homework with AI
            </p>
          </div>

        </div>

        <div
          className={`teacher-homework-plan ${
            isPremium
              ? "premium"
              : "free"
          }`}
        >

          {isPremium ? (
            <>
              <FaCrown />

              <span>
                Teacher Premium
              </span>

              <strong>
                UNLIMITED
              </strong>
            </>
          ) : (
            <>
              <FaGraduationCap />

              <span>
                Teacher Free
              </span>
            </>
          )}

        </div>

      </header>

      {/* MAIN */}

      <main className="teacher-homework-main">

        {/* GENERATOR */}

        <section className="teacher-homework-generator">

          <div className="teacher-homework-section-heading">

            <div>

              <h2>
                Create Homework
              </h2>

              <p>
                Prepare practice work for your students.
              </p>

            </div>

            <div className="teacher-homework-heading-icon">
              <FaWandMagicSparkles />
            </div>

          </div>

          {/* LIMIT */}

          <div className="teacher-homework-limit">

            <div>

              <span>
                {isPremium
                  ? "Premium Usage"
                  : "Daily Generations"}
              </span>

              <strong>
                {isPremium
                  ? "UNLIMITED"
                  : `${homeworkCount} / ${TEACHER_HOMEWORK_LIMIT}`}
              </strong>

            </div>

            <div>

              <span>
                {isPremium
                  ? "Remaining"
                  : "Remaining Today"}
              </span>

              <strong>
                {isPremium
                  ? "∞"
                  : remaining}
              </strong>

            </div>

          </div>

          {/* FORM */}

          <div className="teacher-homework-form">

            {/* SUBJECT */}

            <div className="teacher-homework-field">

              <label>
                Subject
              </label>

              <input
                type="text"
                placeholder="e.g. Mathematics"
                value={subject}
                onChange={(e) =>
                  setSubject(
                    e.target.value
                  )
                }
                disabled={loading}
              />

            </div>

            {/* CLASS */}

            <div className="teacher-homework-field">

              <label>
                Class
              </label>

              <input
                type="text"
                placeholder="e.g. Class 10"
                value={className}
                onChange={(e) =>
                  setClassName(
                    e.target.value
                  )
                }
                disabled={loading}
              />

            </div>

            {/* TOPIC */}

            <div className="teacher-homework-field teacher-homework-full">

              <label>
                Topic
              </label>

              <input
                type="text"
                placeholder="e.g. Quadratic Equations"
                value={topic}
                onChange={(e) =>
                  setTopic(
                    e.target.value
                  )
                }
                disabled={loading}
              />

            </div>

            {/* LANGUAGE */}

            <div className="teacher-homework-field">

              <label>
                Language
              </label>

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(
                    e.target.value
                  )
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

            {/* QUESTIONS */}

            <div className="teacher-homework-field">

              <label>
                Number of Questions
              </label>

              <select
                value={questionCount}
                onChange={(e) =>
                  setQuestionCount(
                    e.target.value
                  )
                }
                disabled={loading}
              >

                <option value="5">
                  5 Questions
                </option>

                <option value="10">
                  10 Questions
                </option>

                <option value="15">
                  15 Questions
                </option>

                <option value="20">
                  20 Questions
                </option>

                <option value="25">
                  25 Questions
                </option>

                <option value="30">
                  30 Questions
                </option>

                <option value="50">
                  50 Questions
                </option>

              </select>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="teacher-homework-error">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="teacher-homework-success">
              {success}
            </div>
          )}

          {/* ACTIONS */}

          <div className="teacher-homework-actions">

            <button
              className="teacher-homework-generate"
              onClick={generateHomework}
              disabled={
                loading ||
                (
                  !isPremium &&
                  homeworkCount >=
                    TEACHER_HOMEWORK_LIMIT
                )
              }
              type="button"
            >

              {loading ? (
                <>
                  <span className="teacher-homework-spinner"></span>
                  Generating Homework...
                </>
              ) : (
                <>
                  <FaWandMagicSparkles />
                  Generate Homework
                </>
              )}

            </button>

            <button
              className="teacher-homework-reset"
              onClick={resetHomework}
              disabled={loading}
              type="button"
            >

              <FaRotateRight />

              Reset

            </button>

          </div>

        </section>

        {/* WORKSPACE */}

        <section className="teacher-homework-workspace">

          <div className="teacher-homework-workspace-header">

            <div>

              <h2>
                Generated Homework
              </h2>

              <p>
                Your printable student homework
              </p>

            </div>

            {generatedHomework && (

              <button
                className={`teacher-homework-download ${
                  !isPremium
                    ? "locked"
                    : ""
                }`}
                onClick={
                  downloadPDF
                }
                type="button"
              >

                {isPremium ? (
                  <FaDownload />
                ) : (
                  <FaLock />
                )}

                {isPremium
                  ? "Download PDF"
                  : "PDF Locked"}

              </button>

            )}

          </div>

          {/* EMPTY */}

          {!generatedHomework &&
            !loading && (

              <div className="teacher-homework-empty">

                <div className="teacher-homework-empty-icon">
                  <FaFileLines />
                </div>

                <h3>
                  Your homework will appear here
                </h3>

                <p>
                  Fill in the lesson details
                  and generate homework
                  for your students.
                </p>

              </div>

            )}

          {/* LOADING */}

          {loading && (

            <div className="teacher-homework-loading">

              <div className="teacher-homework-loading-spinner"></div>

              <h3>
                Creating your homework...
              </h3>

              <p>
                Preparing student practice
                questions based on your topic.
              </p>

            </div>

          )}

          {/* RESULT */}

          {generatedHomework &&
            !loading && (

              <div
                id="teacher-homework-paper"
                className="teacher-homework-paper"
              >

                <ReactMarkdown>
                  {generatedHomework}
                </ReactMarkdown>

              </div>

            )}

        </section>

        {/* FREE UPGRADE */}

        {!isPremium && (

          <section className="teacher-homework-upgrade">

            <div>

              <span>
                TEACHER PREMIUM
              </span>

              <h2>
                Unlock Unlimited Homework
              </h2>

              <p>
                Generate unlimited homework,
                download PDFs and get unlimited
                My Files storage.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/subscription-plans?role=teacher"
                )
              }
            >
              Get Teacher Premium
            </button>

          </section>

        )}

      </main>

    </div>
  );
}

export default TeacherHomework;