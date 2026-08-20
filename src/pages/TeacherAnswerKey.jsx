import {
  FaArrowLeft,
  FaKey,
  FaWandMagicSparkles,
  FaDownload,
  FaRotateRight,
  FaCrown,
  FaLock,
  FaFileLines,
  FaCopy,
} from "react-icons/fa6";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const DAILY_LIMIT = 3;
const FREE_MAX_FILES = 10;

const getToday = () =>
  new Date().toISOString().split("T")[0];

function TeacherAnswerKey() {
  const navigate = useNavigate();

  // =========================================
  // FORM
  // =========================================

  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("English");
  const [questions, setQuestions] = useState("");

  // =========================================
  // RESULT
  // =========================================

  const [answerKey, setAnswerKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

  const [count, setCount] = useState(0);

  // =========================================
  // LOAD PLAN
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

  // =========================================
  // LOAD DAILY COUNT
  // =========================================

  useEffect(() => {
    if (isPremium) {
      setCount(0);
      return;
    }

    const today = getToday();

    const savedDate =
      localStorage.getItem(
        "teacherAnswerKeyDate"
      );

    const savedCount =
      Number(
        localStorage.getItem(
          "teacherAnswerKeyCount"
        ) || "0"
      );

    if (savedDate !== today) {
      localStorage.setItem(
        "teacherAnswerKeyDate",
        today
      );

      localStorage.setItem(
        "teacherAnswerKeyCount",
        "0"
      );

      setCount(0);
    } else {
      setCount(savedCount);
    }
  }, [isPremium]);

  // =========================================
  // GET TODAY COUNT
  // =========================================

  const getTodayCount = () => {
    const today = getToday();

    const savedDate =
      localStorage.getItem(
        "teacherAnswerKeyDate"
      );

    if (savedDate !== today) {
      localStorage.setItem(
        "teacherAnswerKeyDate",
        today
      );

      localStorage.setItem(
        "teacherAnswerKeyCount",
        "0"
      );

      return 0;
    }

    return Number(
      localStorage.getItem(
        "teacherAnswerKeyCount"
      ) || "0"
    );
  };

  // =========================================
  // GENERATE ANSWER KEY
  // =========================================

  const generateAnswerKey = async () => {
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

    if (!questions.trim()) {
      setError(
        "Please paste or enter the questions first."
      );
      return;
    }

    // -----------------------------------------
    // FREE LIMIT
    // -----------------------------------------

    const currentCount =
      getTodayCount();

    if (
      !isPremium &&
      currentCount >= DAILY_LIMIT
    ) {
      setError(
        "Teacher Free daily Answer Key limit reached. You can generate more tomorrow."
      );
      return;
    }

    try {
      setLoading(true);
      setAnswerKey("");

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

Create a highly accurate,
professional teacher answer key.

Give clear and complete answers.
For Mathematics, Physics, Chemistry
and similar subjects, show useful working
steps where appropriate.

For descriptive questions, provide
teacher-quality model answers.

For language subjects, provide correct
grammar, vocabulary, translation,
comprehension and writing answers where
applicable.

Make the answer key classroom-ready.
`
        : `
TEACHER FREE MODE:

Create a clear and useful answer key.

Keep answers accurate,
simple and appropriate for the selected class.

For calculation-based questions,
show the important solving steps.
`;

      // ---------------------------------------
      // PROMPT
      // ---------------------------------------

      const prompt = `
You are Giganics Teacher AI.

${premiumInstruction}

Create a REAL TEACHER ANSWER KEY.

The user has provided a set of questions.
Your job is to answer those questions.

This is NOT:
- a new question paper
- homework
- classwork
- an exam paper
- an MCQ generator
- a marking scheme

DETAILS:

Subject: ${subject}
Class: ${className}
Topic: ${topic}
Language: ${language}

QUESTIONS:

${questions}

IMPORTANT RULES:

1. Answer every question provided by the teacher.
2. Keep the original question numbering.
3. Do not skip any question.
4. Do not create new questions.
5. Do not change the meaning of the questions.
6. Answers must be accurate.
7. Answers must be appropriate for ${className}.
8. Everything must be written in ${language}.
9. For Mathematics, Physics, Chemistry and similar subjects, show solving steps where useful.
10. For numerical questions, include the final answer clearly.
11. For English, Urdu and Sindhi, provide grammatically correct answers.
12. For translation questions, provide the correct translation.
13. For Science, provide scientifically accurate explanations.
14. For History, Geography and Social Studies, provide concise but complete answers.
15. Do not invent information that is not required.
16. Do not add marks.
17. Do not add total marks.
18. Do not add passing marks.
19. Do not add time allowed.
20. Do not create Section A, Section B or Section C.
21. Do not mention AI.
22. Do not mention Giganics inside the actual answers.
23. Do not use unnecessary decorative symbols.
24. Do not use emojis.
25. Do not use LaTeX.
26. Do not use $ signs for mathematical formulas.
27. Use simple readable mathematical expressions.
28. Use Unicode symbols such as ×, ÷, √, ≤, ≥ and ² where appropriate.
29. Keep the answer key clean and easy for a teacher to check.
30. Do not include explanations about how you generated the answer key.

FORMAT:

# ANSWER KEY

**Subject:** ${subject}

**Class:** ${className}

**Topic:** ${topic}

---

## Answers

For every question use this format:

### Question 1
**Answer:**  
Write the correct answer.

### Question 2
**Answer:**  
Write the correct answer.

Continue until every provided question has been answered.

For calculation questions:

### Question X
**Solution:**  
Show the important working steps.

**Answer:**  
Write the final answer clearly.

The entire answer key must be written in ${language}.
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
          "AI did not return an answer key."
        );
      }

      const cleanText =
        text
          .replace(
            /^```markdown\s*/i,
            ""
          )
          .replace(
            /^```\s*/i,
            ""
          )
          .replace(
            /\s*```$/i,
            ""
          )
          .trim();

      // ---------------------------------------
      // SAVE RESULT
      // ---------------------------------------

      setAnswerKey(cleanText);

      // ---------------------------------------
      // FREE COUNTER
      // ---------------------------------------

      if (!isPremium) {
        const newCount =
          currentCount + 1;

        localStorage.setItem(
          "teacherAnswerKeyDate",
          getToday()
        );

        localStorage.setItem(
          "teacherAnswerKeyCount",
          String(newCount)
        );

        setCount(newCount);
      }

      // ---------------------------------------
      // SAVE TO MY FILES
      // ---------------------------------------

      saveToTeacherFiles(cleanText);

      setSuccess(
        "Answer Key generated successfully."
      );

    } catch (err) {
      console.error(
        "Teacher Answer Key Error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while generating the Answer Key."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // SAVE TO TEACHER FILES
  // =========================================

  const saveToTeacherFiles = (
    content
  ) => {
    try {
      const existingFiles =
        JSON.parse(
          localStorage.getItem(
            "giganics_teacher_files"
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
          "Answer Key generated. Your Teacher Free My Files limit is full."
        );

        return;
      }

      const newFile = {
        id:
          "teacher-answer-key-" +
          Date.now(),

        title:
          `${subject} - ${topic} Answer Key`,

        type: "Answer Key",

        content,

        subject,
        className,
        topic,
        language,

        plan: isPremium
          ? "teacher_premium"
          : "teacher_free",

        date:
          new Date().toLocaleDateString(),

        createdAt:
          new Date().toISOString(),

        role: "teacher",
      };

      localStorage.setItem(
        "giganics_teacher_files",
        JSON.stringify([
          newFile,
          ...existingFiles,
        ])
      );

    } catch (err) {
      console.error(
        "Teacher Answer Key Save Error:",
        err
      );
    }
  };

  // =========================================
  // COPY ANSWER KEY
  // =========================================

  const copyAnswerKey = async () => {
    if (!answerKey) return;

    try {
      await navigator.clipboard.writeText(
        answerKey
      );

      setSuccess(
        "Answer Key copied to clipboard."
      );

      setTimeout(() => {
        setSuccess("");
      }, 2500);

    } catch (err) {
      console.error(
        "Copy Error:",
        err
      );

      setError(
        "Could not copy the Answer Key."
      );
    }
  };

  // =========================================
  // RESET
  // =========================================

  const resetAnswerKey = () => {
    setSubject("");
    setClassName("");
    setTopic("");
    setLanguage("English");
    setQuestions("");

    setAnswerKey("");
    setError("");
    setSuccess("");
  };

  // =========================================
  // PDF DOWNLOAD
  // PREMIUM ONLY
  // =========================================

  const downloadPDF = async () => {
    if (!isPremium) {
      setError(
        "PDF Download is available only on Teacher Premium. Upgrade your plan to unlock PDF downloads."
      );
      return;
    }

    const element =
      document.getElementById(
        "teacher-answer-key-paper"
      );

    if (
      !element ||
      !answerKey
    ) {
      setError(
        "Please generate an Answer Key first."
      );
      return;
    }

    try {
      setDownloading(true);
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

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

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
        "Subject";

      const safeTopic =
        topic
          .replace(
            /[^\w\s-]/g,
            ""
          )
          .trim() ||
        "Topic";

      pdf.save(
        `Giganics-${safeSubject}-${safeTopic}-Answer-Key.pdf`
      );

    } catch (err) {
      console.error(
        "Answer Key PDF Error:",
        err
      );

      setError(
        "PDF could not be generated. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  };

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
  // REMAINING
  // =========================================

  const remaining =
    isPremium
      ? "∞"
      : Math.max(
          0,
          DAILY_LIMIT - count
        );

  // =========================================
  // JSX
  // =========================================

  return (
    <div className="teacher-answer-key-page">

      {/* HEADER */}

      <header className="teacher-answer-key-header">

        <button
          className="teacher-answer-key-back"
          onClick={handleBack}
          type="button"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>

        <div className="teacher-answer-key-title">

          <div className="teacher-answer-key-title-icon">
            <FaKey />
          </div>

          <div>
            <h1>
              Teacher Answer Key
            </h1>

            <p>
              Generate accurate answer keys with AI
            </p>
          </div>

        </div>

        <div
          className={`teacher-answer-key-plan ${
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
              <FaLock />

              <span>
                Teacher Free
              </span>
            </>
          )}

        </div>

      </header>

      {/* MAIN */}

      <main className="teacher-answer-key-main">

        {/* GENERATOR */}

        <section className="teacher-answer-key-generator">

          <div className="teacher-answer-key-heading">

            <div>
              <h2>
                Create Answer Key
              </h2>

              <p>
                Paste your questions and generate accurate answers.
              </p>
            </div>

            <FaWandMagicSparkles />

          </div>

          {/* USAGE */}

          <div className="teacher-answer-key-limit">

            <div>
              <span>
                {isPremium
                  ? "Premium Usage"
                  : "Daily Generations"}
              </span>

              <strong>
                {isPremium
                  ? "UNLIMITED"
                  : `${count} / ${DAILY_LIMIT}`}
              </strong>
            </div>

            <div>
              <span>
                {isPremium
                  ? "Remaining"
                  : "Remaining Today"}
              </span>

              <strong>
                {remaining}
              </strong>
            </div>

          </div>

          {/* FORM */}

          <div className="teacher-answer-key-form">

            <div className="teacher-answer-key-field">

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

            <div className="teacher-answer-key-field">

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

            <div className="teacher-answer-key-field">

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

            <div className="teacher-answer-key-field">

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

            <div className="teacher-answer-key-field teacher-answer-key-full">

              <label>
                Questions
              </label>

              <textarea
                placeholder={`Paste your questions here...

Example:

1. What is photosynthesis?

2. Define chlorophyll.

3. Explain the process of photosynthesis.

4. What are the requirements for photosynthesis?`}
                value={questions}
                onChange={(e) =>
                  setQuestions(
                    e.target.value
                  )
                }
                disabled={loading}
              />

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="teacher-answer-key-error">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="teacher-answer-key-success">
              {success}
            </div>
          )}

          {/* ACTIONS */}

          <div className="teacher-answer-key-actions">

            <button
              className="teacher-answer-key-generate"
              onClick={
                generateAnswerKey
              }
              disabled={
                loading ||
                (
                  !isPremium &&
                  count >= DAILY_LIMIT
                )
              }
              type="button"
            >

              {loading ? (
                <>
                  <span className="teacher-answer-key-spinner"></span>
                  Generating Answer Key...
                </>
              ) : (
                <>
                  <FaWandMagicSparkles />
                  Generate Answer Key
                </>
              )}

            </button>

            <button
              className="teacher-answer-key-reset"
              onClick={
                resetAnswerKey
              }
              disabled={loading}
              type="button"
            >
              <FaRotateRight />
              Reset
            </button>

          </div>

        </section>

        {/* WORKSPACE */}

        <section className="teacher-answer-key-workspace">

          <div className="teacher-answer-key-workspace-header">

            <div>
              <h2>
                Generated Answer Key
              </h2>

              <p>
                Teacher-ready answers for your questions
              </p>
            </div>

            {answerKey && (
              <div className="teacher-answer-key-workspace-actions">

                <button
                  className="teacher-answer-key-copy"
                  onClick={
                    copyAnswerKey
                  }
                  type="button"
                >
                  <FaCopy />
                  Copy
                </button>

                <button
                  className={`teacher-answer-key-download ${
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
                    ? downloading
                      ? "Creating PDF..."
                      : "Download PDF"
                    : "PDF Locked"}

                </button>

              </div>
            )}

          </div>

          {/* EMPTY */}

          {!answerKey &&
            !loading && (

              <div className="teacher-answer-key-empty">

                <div className="teacher-answer-key-empty-icon">
                  <FaFileLines />
                </div>

                <h3>
                  Your Answer Key will appear here
                </h3>

                <p>
                  Enter the question paper details
                  and paste the questions to generate
                  a complete teacher answer key.
                </p>

              </div>

            )}

          {/* LOADING */}

          {loading && (

            <div className="teacher-answer-key-loading">

              <div className="teacher-answer-key-loading-spinner"></div>

              <h3>
                Creating your Answer Key...
              </h3>

              <p>
                Solving and preparing accurate
                teacher answers.
              </p>

            </div>

          )}

          {/* RESULT */}

          {answerKey &&
            !loading && (

              <div
                id="teacher-answer-key-paper"
                className="teacher-answer-key-paper"
              >

                <div className="teacher-answer-key-paper-header">

                  <div className="teacher-answer-key-brand">
                    GIGANICS
                  </div>

                  <div className="teacher-answer-key-label">
                    ANSWER KEY
                  </div>

                  <h1>
                    {subject} — {topic}
                  </h1>

                  <div className="teacher-answer-key-meta">

                    <span>
                      Subject: {subject}
                    </span>

                    <span>
                      Class: {className}
                    </span>

                    <span>
                      Topic: {topic}
                    </span>

                  </div>

                </div>

                <div className="teacher-answer-key-content">

                  <ReactMarkdown>
                    {answerKey}
                  </ReactMarkdown>

                </div>

                <div className="teacher-answer-key-paper-footer">

                  <span>
                    Giganics
                  </span>

                  <span>
                    Teacher Answer Key
                  </span>

                </div>

                {!isPremium && (
                  <div className="teacher-answer-key-watermark">
                    GIGANICS
                  </div>
                )}

              </div>

            )}

        </section>

        {/* FREE UPGRADE */}

        {!isPremium && (

          <section className="teacher-answer-key-upgrade">

            <div>

              <span>
                TEACHER PREMIUM
              </span>

              <h2>
                Unlock Unlimited Answer Keys
              </h2>

              <p>
                Generate unlimited answer keys,
                download PDFs and get unlimited
                Teacher My Files storage.
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

      {/* PAGE CSS */}

      <style>{`

        .teacher-answer-key-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top right,
              rgba(79, 70, 229, 0.16),
              transparent 35%
            ),
            #070b14;
          color: #f8fafc;
          padding-bottom: 50px;
        }

        .teacher-answer-key-header {
          height: 82px;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background: rgba(10,15,27,0.82);
          backdrop-filter: blur(18px);
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .teacher-answer-key-back {
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: #e5e7eb;
          padding: 10px 16px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 9px;
          cursor: pointer;
          font-weight: 600;
        }

        .teacher-answer-key-title {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .teacher-answer-key-title-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(
            135deg,
            #4f46e5,
            #7c3aed
          );
          font-size: 19px;
        }

        .teacher-answer-key-title h1 {
          margin: 0;
          font-size: 20px;
        }

        .teacher-answer-key-title p {
          margin: 4px 0 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .teacher-answer-key-plan {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
        }

        .teacher-answer-key-plan.free {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: #cbd5e1;
        }

        .teacher-answer-key-plan.premium {
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.28);
          color: #fbbf24;
        }

        .teacher-answer-key-plan strong {
          font-size: 10px;
          padding: 4px 7px;
          border-radius: 5px;
          background: rgba(245,158,11,0.14);
        }

        .teacher-answer-key-main {
          width: min(1250px, calc(100% - 40px));
          margin: 30px auto;
          display: grid;
          gap: 22px;
        }

        .teacher-answer-key-generator,
        .teacher-answer-key-workspace {
          background: rgba(15,23,42,0.72);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 26px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }

        .teacher-answer-key-heading,
        .teacher-answer-key-workspace-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .teacher-answer-key-heading h2,
        .teacher-answer-key-workspace-header h2 {
          margin: 0;
          font-size: 21px;
        }

        .teacher-answer-key-heading p,
        .teacher-answer-key-workspace-header p {
          margin: 6px 0 0;
          color: #94a3b8;
          font-size: 14px;
        }

        .teacher-answer-key-heading > svg {
          font-size: 26px;
          color: #818cf8;
        }

        .teacher-answer-key-limit {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin: 22px 0;
        }

        .teacher-answer-key-limit > div {
          padding: 15px 17px;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .teacher-answer-key-limit span {
          color: #94a3b8;
          font-size: 13px;
        }

        .teacher-answer-key-limit strong {
          color: #f8fafc;
          font-size: 14px;
        }

        .teacher-answer-key-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 17px;
        }

        .teacher-answer-key-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .teacher-answer-key-full {
          grid-column: 1 / -1;
        }

        .teacher-answer-key-field label {
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 700;
        }

        .teacher-answer-key-field input,
        .teacher-answer-key-field select,
        .teacher-answer-key-field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(2,6,23,0.75);
          color: #f8fafc;
          border-radius: 11px;
          padding: 13px 14px;
          outline: none;
          font-size: 14px;
          font-family: inherit;
          transition: 0.2s;
        }

        .teacher-answer-key-field input:focus,
        .teacher-answer-key-field select:focus,
        .teacher-answer-key-field textarea:focus {
          border-color: rgba(129,140,248,0.7);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .teacher-answer-key-field textarea {
          min-height: 240px;
          resize: vertical;
          line-height: 1.6;
        }

        .teacher-answer-key-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .teacher-answer-key-generate,
        .teacher-answer-key-reset,
        .teacher-answer-key-download,
        .teacher-answer-key-copy,
        .teacher-answer-key-upgrade button {
          border: 0;
          border-radius: 11px;
          padding: 12px 17px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          cursor: pointer;
          font-weight: 700;
          font-family: inherit;
          transition: 0.2s;
        }

        .teacher-answer-key-generate {
          flex: 1;
          background: linear-gradient(
            135deg,
            #4f46e5,
            #7c3aed
          );
          color: white;
        }

        .teacher-answer-key-generate:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(79,70,229,0.25);
        }

        .teacher-answer-key-reset {
          background: rgba(255,255,255,0.06);
          color: #cbd5e1;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .teacher-answer-key-generate:disabled,
        .teacher-answer-key-reset:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .teacher-answer-key-error,
        .teacher-answer-key-success {
          margin-top: 16px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13px;
        }

        .teacher-answer-key-error {
          background: rgba(239,68,68,0.09);
          border: 1px solid rgba(239,68,68,0.2);
          color: #fca5a5;
        }

        .teacher-answer-key-success {
          background: rgba(34,197,94,0.09);
          border: 1px solid rgba(34,197,94,0.2);
          color: #86efac;
        }

        .teacher-answer-key-workspace-actions {
          display: flex;
          gap: 9px;
        }

        .teacher-answer-key-copy {
          background: rgba(255,255,255,0.06);
          color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .teacher-answer-key-download {
          background: #f8fafc;
          color: #0f172a;
        }

        .teacher-answer-key-download.locked {
          background: rgba(255,255,255,0.06);
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.08);
        }

        .teacher-answer-key-empty,
        .teacher-answer-key-loading {
          min-height: 390px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #94a3b8;
        }

        .teacher-answer-key-empty-icon {
          width: 65px;
          height: 65px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99,102,241,0.1);
          color: #818cf8;
          font-size: 25px;
          margin-bottom: 18px;
        }

        .teacher-answer-key-empty h3,
        .teacher-answer-key-loading h3 {
          color: #e2e8f0;
          margin: 0 0 8px;
        }

        .teacher-answer-key-empty p,
        .teacher-answer-key-loading p {
          max-width: 480px;
          line-height: 1.6;
          margin: 0;
        }

        .teacher-answer-key-loading-spinner,
        .teacher-answer-key-spinner {
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.12);
          border-top-color: #818cf8;
          animation: teacherAnswerSpin 0.8s linear infinite;
        }

        .teacher-answer-key-loading-spinner {
          width: 45px;
          height: 45px;
          margin-bottom: 20px;
        }

        .teacher-answer-key-spinner {
          width: 17px;
          height: 17px;
        }

        @keyframes teacherAnswerSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .teacher-answer-key-paper {
          margin-top: 22px;
          background: white;
          color: #111827;
          border-radius: 8px;
          padding: 45px;
          min-height: 700px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 15px 50px rgba(0,0,0,0.25);
        }

        .teacher-answer-key-paper-header {
          text-align: center;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 22px;
          margin-bottom: 25px;
        }

        .teacher-answer-key-brand {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 3px;
          color: #4f46e5;
        }

        .teacher-answer-key-label {
          display: inline-block;
          margin-top: 10px;
          padding: 5px 10px;
          border-radius: 5px;
          background: #eef2ff;
          color: #4338ca;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .teacher-answer-key-paper-header h1 {
          margin: 15px 0 12px;
          font-size: 25px;
        }

        .teacher-answer-key-meta {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 18px;
          font-size: 12px;
          color: #6b7280;
        }

        .teacher-answer-key-content {
          position: relative;
          z-index: 2;
          line-height: 1.65;
          font-size: 14px;
        }

        .teacher-answer-key-content h1 {
          font-size: 22px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 10px;
        }

        .teacher-answer-key-content h2 {
          font-size: 18px;
          margin-top: 25px;
        }

        .teacher-answer-key-content h3 {
          font-size: 15px;
          margin-top: 20px;
          color: #312e81;
        }

        .teacher-answer-key-content p {
          margin: 8px 0;
        }

        .teacher-answer-key-content strong {
          color: #111827;
        }

        .teacher-answer-key-paper-footer {
          margin-top: 40px;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #6b7280;
          position: relative;
          z-index: 2;
        }

        .teacher-answer-key-watermark {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) rotate(-25deg);
          font-size: 75px;
          font-weight: 900;
          letter-spacing: 8px;
          color: rgba(79,70,229,0.055);
          pointer-events: none;
          z-index: 1;
          white-space: nowrap;
        }

        .teacher-answer-key-upgrade {
          padding: 24px 27px;
          border-radius: 18px;
          border: 1px solid rgba(245,158,11,0.2);
          background: linear-gradient(
            135deg,
            rgba(245,158,11,0.08),
            rgba(124,58,237,0.08)
          );
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .teacher-answer-key-upgrade span {
          font-size: 11px;
          color: #fbbf24;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .teacher-answer-key-upgrade h2 {
          margin: 6px 0;
          font-size: 20px;
        }

        .teacher-answer-key-upgrade p {
          margin: 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .teacher-answer-key-upgrade button {
          background: linear-gradient(
            135deg,
            #f59e0b,
            #d97706
          );
          color: white;
          white-space: nowrap;
        }

        @media (max-width: 850px) {

          .teacher-answer-key-header {
            padding: 0 15px;
          }

          .teacher-answer-key-title p {
            display: none;
          }

          .teacher-answer-key-plan span {
            display: none;
          }

          .teacher-answer-key-main {
            width: min(100% - 24px, 1250px);
            margin-top: 18px;
          }

          .teacher-answer-key-generator,
          .teacher-answer-key-workspace {
            padding: 18px;
          }

          .teacher-answer-key-form {
            grid-template-columns: 1fr;
          }

          .teacher-answer-key-full {
            grid-column: auto;
          }

          .teacher-answer-key-limit {
            grid-template-columns: 1fr;
          }

          .teacher-answer-key-workspace-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .teacher-answer-key-workspace-actions {
            width: 100%;
          }

          .teacher-answer-key-copy,
          .teacher-answer-key-download {
            flex: 1;
          }

          .teacher-answer-key-paper {
            padding: 25px;
          }

          .teacher-answer-key-upgrade {
            flex-direction: column;
            align-items: flex-start;
          }

          .teacher-answer-key-upgrade button {
            width: 100%;
          }
        }

      `}</style>

    </div>
  );
}

export default TeacherAnswerKey;