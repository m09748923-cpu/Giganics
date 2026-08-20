import "./TeacherTestPaper.css";

import {
  FaArrowLeft,
  FaFileLines,
  FaWandMagicSparkles,
  FaDownload,
  FaCrown,
  FaLock,
  FaRotate,
} from "react-icons/fa6";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

function TeacherTestPaper() {
  const navigate = useNavigate();

  // =========================================
  // FORM STATES
  // =========================================

  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [topic, setTopic] = useState("");

  const [term, setTerm] = useState("1st Term");

  const [testDate, setTestDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [totalMarks, setTotalMarks] = useState("50");

  const [duration, setDuration] =
    useState("45 Minutes");

  const [questionType, setQuestionType] =
    useState("Mixed");

  const [language, setLanguage] =
    useState("English");

  const [instructions, setInstructions] =
    useState("");

  // =========================================
  // GENERATED PAPER
  // =========================================

  const [testPaper, setTestPaper] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // =========================================
  // PLAN + LIMIT
  // =========================================

  const [plan, setPlan] =
    useState("teacher_free");

  const [testPaperCount, setTestPaperCount] =
    useState(0);

  const FREE_LIMIT = 2;

  // =========================================
  // LOAD PLAN + DAILY COUNT
  // =========================================

  useEffect(() => {
    const savedPlan =
      localStorage.getItem("plan") ||
      "teacher_free";

    setPlan(savedPlan);

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const savedDate =
      localStorage.getItem(
        "teacherTestPaperDate"
      );

    let count = Number(
      localStorage.getItem(
        "teacherTestPaperCount"
      ) || 0
    );

    if (savedDate !== today) {
      localStorage.setItem(
        "teacherTestPaperDate",
        today
      );

      localStorage.setItem(
        "teacherTestPaperCount",
        "0"
      );

      count = 0;
    }

    setTestPaperCount(count);
  }, []);

  const isPremium =
    plan === "teacher_premium";

  // =========================================
  // GENERATE TEST PAPER
  // =========================================

  const generateTestPaper = async () => {
    setError("");

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    if (!subject.trim()) {
      setError(
        "Please enter the subject."
      );
      return;
    }

    if (!className.trim()) {
      setError(
        "Please enter the class."
      );
      return;
    }

    if (!topic.trim()) {
      setError(
        "Please enter the topic or chapters."
      );
      return;
    }

    if (!testDate) {
      setError(
        "Please select the test date."
      );
      return;
    }

    if (
      !isPremium &&
      testPaperCount >= FREE_LIMIT
    ) {
      setError(
        "Teacher Free daily limit reached. Upgrade to Teacher Premium for more test papers."
      );
      return;
    }

    // -----------------------------------------
    // API KEY
    // -----------------------------------------

    const apiKey =
      import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      setError(
        "Gemini API key is missing. Please check your .env file."
      );
      return;
    }

    try {
      setLoading(true);

      setTestPaper("");

      // ---------------------------------------
      // GEMINI
      // ---------------------------------------

      const ai = new GoogleGenAI({
        apiKey,
      });

      // ---------------------------------------
      // PROMPT
      // ---------------------------------------

      const prompt = `
You are a professional school teacher and test-paper creator for Giganics.

Create a complete, realistic school test paper.

This must be an actual printable TEST PAPER.
Do NOT create study notes.
Do NOT create an explanation.
Do NOT create an answer key.

TEST INFORMATION:

Subject: ${subject}

Class: ${className}

Topic / Chapters:
${topic}

Term:
${term}

Test Date:
${testDate}

Total Marks:
${totalMarks}

Duration:
${duration}

Question Type:
${questionType}

Language:
${language}

Teacher Special Instructions:
${instructions || "None"}

IMPORTANT REQUIREMENTS:

1. Start with a professional test paper heading.

2. Include:

GIGANICS

TEST PAPER

Subject
Class
Term
Date
Time
Total Marks

3. Create questions suitable for ${className}.

4. Questions must be based only on:

${topic}

5. The total marks MUST equal exactly:

${totalMarks}

6. If Question Type is:

Mixed:
Create MCQs, Short Questions and Long Questions.

MCQs Only:
Create only multiple-choice questions.

Short Questions:
Create only short-answer questions.

Long Questions:
Create only long-answer questions.

7. For MCQs:
Give four options:
A
B
C
D

Do NOT show the correct answer.

8. Do NOT create an answer key.

9. Do NOT provide solutions.

10. Number all questions clearly.

11. Divide the paper into clear sections where appropriate.

12. Show marks for every question or section.

13. Keep the difficulty appropriate for the class.

14. Make the paper suitable for printing.

15. Use clean Markdown formatting.

16. If language is Urdu, write naturally in Urdu.

17. If language is Sindhi, write naturally in Sindhi.

18. If language is English, use clear school-level English.

19. Do not mention AI.

20. Do not add unnecessary introduction.

21. Do not add an unnecessary conclusion.

22. Output ONLY the final test paper.

Make sure the marks distribution is mathematically correct and adds up to exactly ${totalMarks}.
`;

      // ---------------------------------------
      // GENERATE
      // ---------------------------------------

      const response =
        await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

      const generatedText =
        response?.text ||
        response?.candidates?.[0]?.content?.parts
          ?.map(
            (part) =>
              part.text || ""
          )
          .join("") ||
        "";

      if (!generatedText.trim()) {
        throw new Error(
          "No test paper was generated."
        );
      }

      // ---------------------------------------
      // SHOW PAPER
      // ---------------------------------------

      setTestPaper(
        generatedText
      );

      // ---------------------------------------
      // UPDATE DAILY LIMIT
      // ---------------------------------------

      if (!isPremium) {
        const newCount =
          testPaperCount + 1;

        const today =
          new Date()
            .toISOString()
            .split("T")[0];

        localStorage.setItem(
          "teacherTestPaperDate",
          today
        );

        localStorage.setItem(
          "teacherTestPaperCount",
          String(newCount)
        );

        setTestPaperCount(
          newCount
        );
      }

      // ---------------------------------------
      // SAVE FILE
      // ---------------------------------------

      saveToMyFiles(
        generatedText
      );
    } catch (err) {
      console.error(
        "Teacher Test Paper Error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while generating the test paper."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // SAVE TO MY FILES
  // =========================================

  const saveToMyFiles = (
    generatedPaper
  ) => {
    try {
      const existingFiles =
        JSON.parse(
          localStorage.getItem(
            "giganics_files"
          ) || "[]"
        );

      const newFile = {
        id: Date.now(),

        type: "Test Paper",

        title:
          `${subject} - ${topic} Test Paper`,

        subject,

        className,

        topic,

        term,

        testDate,

        totalMarks,

        duration,

        questionType,

        language,

        instructions,

        content:
          generatedPaper,

        createdAt:
          new Date().toISOString(),
      };

      const updatedFiles = [
        newFile,
        ...existingFiles,
      ];

      localStorage.setItem(
        "giganics_files",
        JSON.stringify(
          updatedFiles
        )
      );
    } catch (err) {
      console.error(
        "Test paper save error:",
        err
      );
    }
  };

  // =========================================
  // DOWNLOAD PDF
  // =========================================

  const downloadPDF = () => {
    if (!testPaper.trim()) {
      return;
    }

    const pdf = new jsPDF(
      "p",
      "mm",
      "a4"
    );

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const margin = 16;

    const usableWidth =
      pageWidth -
      margin * 2;

    let y = 18;

    // -----------------------------------------
    // HEADER
    // -----------------------------------------

    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(18);

    pdf.text(
      "GIGANICS",
      pageWidth / 2,
      y,
      {
        align: "center",
      }
    );

    y += 8;

    pdf.setFontSize(14);

    pdf.text(
      "TEST PAPER",
      pageWidth / 2,
      y,
      {
        align: "center",
      }
    );

    y += 10;

    // -----------------------------------------
    // INFORMATION
    // -----------------------------------------

    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(10);

    pdf.text(
      `Subject: ${subject}`,
      margin,
      y
    );

    pdf.text(
      `Class: ${className}`,
      pageWidth / 2,
      y
    );

    y += 6;

    pdf.text(
      `Term: ${term}`,
      margin,
      y
    );

    pdf.text(
      `Date: ${testDate}`,
      pageWidth / 2,
      y
    );

    y += 6;

    pdf.text(
      `Time: ${duration}`,
      margin,
      y
    );

    pdf.text(
      `Total Marks: ${totalMarks}`,
      pageWidth / 2,
      y
    );

    y += 9;

    // -----------------------------------------
    // DIVIDER
    // -----------------------------------------

    pdf.line(
      margin,
      y,
      pageWidth - margin,
      y
    );

    y += 8;

    // -----------------------------------------
    // CLEAN MARKDOWN
    // -----------------------------------------

    const plainText =
      testPaper
        .replace(
          /#{1,6}\s?/g,
          ""
        )
        .replace(
          /\*\*/g,
          ""
        )
        .replace(
          /\*/g,
          ""
        )
        .replace(
          /`/g,
          ""
        )
        .replace(
          /\|/g,
          " "
        );

    const lines =
      pdf.splitTextToSize(
        plainText,
        usableWidth
      );

    pdf.setFontSize(11);

    // -----------------------------------------
    // PAPER CONTENT
    // -----------------------------------------

    lines.forEach(
      (line) => {
        if (
          y >
          pageHeight - 18
        ) {
          pdf.addPage();

          y = 18;
        }

        pdf.text(
          line,
          margin,
          y
        );

        y += 6;
      }
    );

    // -----------------------------------------
    // FILE NAME
    // -----------------------------------------

    const safeSubject =
      subject.replace(
        /[^a-z0-9]/gi,
        "-"
      );

    const safeTopic =
      topic.replace(
        /[^a-z0-9]/gi,
        "-"
      );

    pdf.save(
      `Giganics-${safeSubject}-${safeTopic}-Test-Paper.pdf`
    );
  };

  // =========================================
  // RESET
  // =========================================

  const resetGenerator = () => {
    setSubject("");

    setClassName("");

    setTopic("");

    setTerm(
      "1st Term"
    );

    setTestDate(
      new Date()
        .toISOString()
        .split("T")[0]
    );

    setTotalMarks(
      "50"
    );

    setDuration(
      "45 Minutes"
    );

    setQuestionType(
      "Mixed"
    );

    setLanguage(
      "English"
    );

    setInstructions("");

    setTestPaper("");

    setError("");
  };

  // =========================================
  // RETURN
  // =========================================

  return (
    <div className="teacher-ai-notes-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="teacher-ai-header">

        <button
          className="teacher-back-button"
          onClick={() =>
            navigate(-1)
          }
        >
          <FaArrowLeft />

          <span>
            Back
          </span>
        </button>

        <div className="teacher-ai-header-title">

          <FaFileLines />

          <div>

            <h1>
              Teacher Test Paper
            </h1>

            <p>
              Create professional test papers for your students
            </p>

          </div>

        </div>

        <div
          className={`teacher-plan-badge ${
            isPremium
              ? "premium"
              : "free"
          }`}
        >

          {isPremium ? (
            <FaCrown />
          ) : (
            <FaFileLines />
          )}

          <span>
            {isPremium
              ? "Teacher Premium"
              : "Teacher Free"}
          </span>

        </div>

      </header>

      {/* =====================================
          MAIN
      ===================================== */}

      <main className="teacher-ai-main">

        {/* ===================================
            GENERATOR PANEL
        =================================== */}

        <section className="teacher-generator-panel">

          <div className="generator-heading">

            <div className="generator-icon">
              <FaWandMagicSparkles />
            </div>

            <div>

              <h2>
                Create Test Paper
              </h2>

              <p>
                Enter the test details and generate a printable paper.
              </p>

            </div>

            <div className="generator-limit">

              {isPremium ? (
                <>
                  <FaCrown />

                  <span>
                    Premium Generation
                  </span>
                </>
              ) : (
                <span>
                  Daily:{" "}
                  {testPaperCount}
                  /{FREE_LIMIT}
                </span>
              )}

            </div>

          </div>

          {/* =================================
              FORM FIELDS
          ================================= */}

          <div className="generator-fields">

            {/* SUBJECT */}

            <div className="teacher-field">

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
              />

            </div>

            {/* CLASS */}

            <div className="teacher-field">

              <label>
                Class
              </label>

              <input
                type="text"
                placeholder="e.g. Class 8"
                value={className}
                onChange={(e) =>
                  setClassName(
                    e.target.value
                  )
                }
              />

            </div>

            {/* TOPIC */}

            <div className="teacher-field topic-field">

              <label>
                Topic / Chapters
              </label>

              <input
                type="text"
                placeholder="e.g. Algebra, Linear Equations"
                value={topic}
                onChange={(e) =>
                  setTopic(
                    e.target.value
                  )
                }
              />

            </div>

            {/* TERM */}

            <div className="teacher-field">

              <label>
                Term
              </label>

              <select
                value={term}
                onChange={(e) =>
                  setTerm(
                    e.target.value
                  )
                }
              >

                <option value="1st Term">
                  1st Term
                </option>

                <option value="2nd Term">
                  2nd Term
                </option>

                <option value="3rd Term">
                  3rd Term
                </option>

                <option value="Final Term">
                  Final Term
                </option>

              </select>

            </div>

            {/* DATE */}

            <div className="teacher-field">

              <label>
                Test Date
              </label>

              <input
                type="date"
                value={testDate}
                onChange={(e) =>
                  setTestDate(
                    e.target.value
                  )
                }
              />

            </div>

            {/* MARKS */}

            <div className="teacher-field">

              <label>
                Total Marks
              </label>

              <select
                value={totalMarks}
                onChange={(e) =>
                  setTotalMarks(
                    e.target.value
                  )
                }
              >

                <option value="25">
                  25 Marks
                </option>

                <option value="30">
                  30 Marks
                </option>

                <option value="40">
                  40 Marks
                </option>

                <option value="50">
                  50 Marks
                </option>

                <option value="75">
                  75 Marks
                </option>

                <option value="100">
                  100 Marks
                </option>

              </select>

            </div>

            {/* DURATION */}

            <div className="teacher-field">

              <label>
                Duration
              </label>

              <select
                value={duration}
                onChange={(e) =>
                  setDuration(
                    e.target.value
                  )
                }
              >

                <option value="30 Minutes">
                  30 Minutes
                </option>

                <option value="45 Minutes">
                  45 Minutes
                </option>

                <option value="1 Hour">
                  1 Hour
                </option>

                <option value="1 Hour 30 Minutes">
                  1 Hour 30 Minutes
                </option>

                <option value="2 Hours">
                  2 Hours
                </option>

              </select>

            </div>

            {/* QUESTION TYPE */}

            <div className="teacher-field">

              <label>
                Question Type
              </label>

              <select
                value={questionType}
                onChange={(e) =>
                  setQuestionType(
                    e.target.value
                  )
                }
              >

                <option value="Mixed">
                  Mixed
                </option>

                <option value="MCQs Only">
                  MCQs Only
                </option>

                <option value="Short Questions">
                  Short Questions
                </option>

                <option value="Long Questions">
                  Long Questions
                </option>

              </select>

            </div>

            {/* LANGUAGE */}

            <div className="teacher-field">

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

            {/* SPECIAL INSTRUCTIONS */}

            <div className="teacher-field topic-field">

              <label>
                Special Instructions
              </label>

              <textarea
                placeholder="Optional instructions for the test paper..."
                value={instructions}
                onChange={(e) =>
                  setInstructions(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="teacher-ai-error">
              {error}
            </div>
          )}

          {/* ACTIONS */}

          <div className="generator-actions">

            <button
              className="generate-notes-button"
              onClick={
                generateTestPaper
              }
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="loading-spinner" />

                  Creating Test Paper...
                </>
              ) : (
                <>
                  <FaWandMagicSparkles />

                  Generate Test Paper
                </>
              )}

            </button>

            <button
              className="reset-notes-button"
              onClick={
                resetGenerator
              }
              disabled={loading}
            >

              <FaRotate />

              Reset

            </button>

          </div>

        </section>

        {/* ===================================
            GENERATED PAPER WORKSPACE
        =================================== */}

        <section className="teacher-notes-workspace">

          <div className="workspace-header">

            <div className="workspace-title">

              <div className="workspace-title-icon">
                <FaFileLines />
              </div>

              <div>

                <h2>
                  Generated Test Paper
                </h2>

                <p>
                  Your printable classroom test paper
                </p>

              </div>

            </div>

            <div className="workspace-actions">

              <button
                className="workspace-download"
                onClick={
                  downloadPDF
                }
                disabled={
                  !testPaper.trim()
                }
              >

                <FaDownload />

                Download PDF

              </button>

            </div>

          </div>

          <div className="notes-workspace-content">

            {!testPaper &&
              !loading && (
                <div className="empty-notes-state">

                  <div className="empty-notes-icon">
                    <FaFileLines />
                  </div>

                  <h3>
                    Your test paper will appear here
                  </h3>

                  <p>
                    Enter the test details above
                    and generate your paper.
                  </p>

                </div>
              )}

            {loading && (
              <div className="generating-state">

                <div className="large-spinner" />

                <h3>
                  Creating your test paper...
                </h3>

                <p>
                  Giganics AI is preparing your classroom test.
                </p>

              </div>
            )}

            {testPaper &&
              !loading && (
                <article className="generated-notes">

                  <ReactMarkdown>
                    {testPaper}
                  </ReactMarkdown>

                </article>
              )}

          </div>

        </section>

        {/* ===================================
            FREE PLAN UPGRADE
        =================================== */}

        {!isPremium && (
          <section className="teacher-upgrade-card">

            <div className="upgrade-lock">
              <FaLock />
            </div>

            <div className="upgrade-content">

              <h3>
                Need more test papers?
              </h3>

              <p>
                Teacher Premium gives you more
                generation access and advanced
                teacher tools.
              </p>

            </div>

            <button
              className="upgrade-button"
              onClick={() =>
                navigate(
                  "/subscription-plans?role=teacher"
                )
              }
            >

              <FaCrown />

              View Premium

            </button>

          </section>
        )}

      </main>

    </div>
  );
}

export default TeacherTestPaper;