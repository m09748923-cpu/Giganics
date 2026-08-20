import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";

import {
  FaArrowLeft,
  FaLayerGroup,
  FaBook,
  FaGraduationCap,
  FaLightbulb,
  FaLanguage,
  FaPlus,
  FaMinus,
  FaRedo,
  FaPrint,
  FaSyncAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaLock,
} from "react-icons/fa";

import "./TeacherFlashcards.css";

const DAILY_LIMIT = 5;

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

const getInitialCount = () => {
  const savedDate = localStorage.getItem("teacherFlashcardsDate");
  const savedCount = Number(
    localStorage.getItem("teacherFlashcardsCount") || 0
  );

  if (savedDate !== getToday()) {
    localStorage.setItem("teacherFlashcardsDate", getToday());
    localStorage.setItem("teacherFlashcardsCount", "0");
    return 0;
  }

  return savedCount;
};

const parseAIResponse = (text) => {
  try {
    let clean = text.trim();

    clean = clean.replace(/```json/gi, "");
    clean = clean.replace(/```/g, "");
    clean = clean.trim();

    const start = clean.indexOf("[");
    const end = clean.lastIndexOf("]");

    if (start !== -1 && end !== -1) {
      clean = clean.substring(start, end + 1);
    }

    const parsed = JSON.parse(clean);

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid flashcard format.");
    }

    return parsed
      .map((item) => ({
        question: String(item.question || "").trim(),
        answer: String(item.answer || "").trim(),
      }))
      .filter((item) => item.question && item.answer);
  } catch (error) {
    console.error("Flashcard parsing error:", error);
    return [];
  }
};

export default function TeacherFlashcards() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("English");

  const [numberOfCards, setNumberOfCards] = useState(8);

  const [flashcards, setFlashcards] = useState([]);
  const [activeCard, setActiveCard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [dailyCount, setDailyCount] = useState(getInitialCount());

  // =========================================
  // TEACHER PLAN
  // =========================================

  const plan = localStorage.getItem("plan") || "teacher_free";

  const isPremium =
    plan === "teacher_pro" ||
    plan === "teacher_premium";

  useEffect(() => {
    const savedDate = localStorage.getItem("teacherFlashcardsDate");

    if (savedDate !== getToday()) {
      localStorage.setItem("teacherFlashcardsDate", getToday());
      localStorage.setItem("teacherFlashcardsCount", "0");
      setDailyCount(0);
    }
  }, []);

  const remaining = Math.max(DAILY_LIMIT - dailyCount, 0);

  const updateDailyCount = () => {
    const newCount = dailyCount + 1;

    localStorage.setItem("teacherFlashcardsDate", getToday());
    localStorage.setItem(
      "teacherFlashcardsCount",
      String(newCount)
    );

    setDailyCount(newCount);
  };

  // =========================================
  // CARD COUNT
  // =========================================

  const increaseCards = () => {
    setNumberOfCards((prev) => Math.min(prev + 1, 20));
  };

  const decreaseCards = () => {
    setNumberOfCards((prev) => Math.max(prev - 1, 4));
  };

  // =========================================
  // GENERATE FLASHCARDS
  // =========================================

  const generateFlashcards = async () => {
    setError("");
    setSuccess("");

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

    if (dailyCount >= DAILY_LIMIT) {
      setError(
        "Teacher Free daily limit reached. You can generate more flashcards tomorrow."
      );
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      setError(
        "Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file."
      );
      return;
    }

    try {
      setLoading(true);

      const ai = new GoogleGenAI({
        apiKey,
      });

      const prompt = `
You are an expert school teacher creating educational flashcards.

Create exactly ${numberOfCards} flashcards.

Subject: ${subject}
Class: ${className}
Topic: ${topic}
Language: ${language}

Requirements:
1. Flashcards must be suitable for the specified class.
2. Keep questions clear and educational.
3. Answers must be accurate and concise.
4. Do not create overly difficult university-level content.
5. Avoid duplicate questions.
6. Use the requested language.
7. Return ONLY valid JSON.
8. Do not use markdown.
9. Do not add explanations outside the JSON.

Return exactly this format:

[
  {
    "question": "Question here",
    "answer": "Answer here"
  }
]
`;

      const response = await ai.models.generateContent({
        model:
          import.meta.env.VITE_GEMINI_MODEL ||
          "gemini-3.5-flash",
        contents: prompt,
      });

      const text =
        typeof response.text === "function"
          ? response.text()
          : response.text || "";

      const generatedCards = parseAIResponse(text);

      if (!generatedCards.length) {
        throw new Error(
          "AI returned an invalid response. Please try generating again."
        );
      }

      setFlashcards(generatedCards);
      setActiveCard(0);
      setFlipped(false);

      updateDailyCount();

      setSuccess(
        `${generatedCards.length} flashcards generated successfully.`
      );
    } catch (err) {
      console.error("Teacher Flashcards Error:", err);

      let message =
        "Something went wrong while generating flashcards.";

      if (err?.message) {
        message = err.message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // RESET
  // =========================================

  const resetPage = () => {
    setSubject("");
    setClassName("");
    setTopic("");
    setLanguage("English");
    setNumberOfCards(8);

    setFlashcards([]);
    setActiveCard(0);
    setFlipped(false);

    setError("");
    setSuccess("");
  };

  // =========================================
  // NAVIGATION
  // =========================================

  const previousCard = () => {
    if (!flashcards.length) return;

    setActiveCard((prev) => {
      return prev === 0
        ? flashcards.length - 1
        : prev - 1;
    });

    setFlipped(false);
  };

  const nextCard = () => {
    if (!flashcards.length) return;

    setActiveCard((prev) => {
      return prev === flashcards.length - 1
        ? 0
        : prev + 1;
    });

    setFlipped(false);
  };

  // =========================================
  // PRINT / PDF
  // =========================================

  const printFlashcards = () => {
    // Extra security check
    if (!isPremium) {
      setError(
        "PDF Download is available only on Teacher Pro."
      );
      return;
    }

    if (!flashcards.length) return;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setError(
        "Please allow pop-ups to print your flashcards."
      );
      return;
    }

    const cardsHTML = flashcards
      .map(
        (card, index) => `
          <div class="print-card">

            <div class="print-number">
              Flashcard ${index + 1}
            </div>

            <div class="print-section">
              <div class="print-label">
                QUESTION
              </div>

              <div class="print-question">
                ${escapeHTML(card.question)}
              </div>
            </div>

            <div class="print-divider"></div>

            <div class="print-section">
              <div class="print-label">
                ANSWER
              </div>

              <div class="print-answer">
                ${escapeHTML(card.answer)}
              </div>
            </div>

          </div>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>

        <head>

          <title>
            Teacher Free Flashcards
          </title>

          <style>

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 30px;
              font-family: Arial, sans-serif;
              background: white;
              color: #111827;
            }

            .header {
              margin-bottom: 30px;
              border-bottom: 2px solid #111827;
              padding-bottom: 18px;
            }

            .title {
              font-size: 28px;
              font-weight: 800;
              margin-bottom: 8px;
            }

            .meta {
              font-size: 14px;
              color: #4b5563;
            }

            .print-card {
              border: 1px solid #d1d5db;
              border-radius: 14px;
              padding: 24px;
              margin-bottom: 22px;
              page-break-inside: avoid;
            }

            .print-number {
              font-size: 13px;
              font-weight: 700;
              color: #6b7280;
              margin-bottom: 18px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .print-label {
              font-size: 11px;
              font-weight: 800;
              color: #6b7280;
              margin-bottom: 8px;
              letter-spacing: 1px;
            }

            .print-question,
            .print-answer {
              font-size: 18px;
              line-height: 1.6;
            }

            .print-answer {
              font-weight: 600;
            }

            .print-divider {
              height: 1px;
              background: #e5e7eb;
              margin: 20px 0;
            }

            @media print {

              body {
                padding: 15px;
              }

              .print-card {
                break-inside: avoid;
              }

            }

          </style>

        </head>

        <body>

          <div class="header">

            <div class="title">
              Teacher Pro — Flashcards
            </div>

            <div class="meta">

              Subject:
              ${escapeHTML(subject)}

              &nbsp; | &nbsp;

              Class:
              ${escapeHTML(className)}

              &nbsp; | &nbsp;

              Topic:
              ${escapeHTML(topic)}

              &nbsp; | &nbsp;

              Language:
              ${escapeHTML(language)}

            </div>

          </div>

          ${cardsHTML}

        </body>

      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="teacher-flashcards-page">

      {/* HEADER */}

      <header className="teacher-flashcards-header">

        <button
          className="teacher-flashcards-back"
          onClick={() => navigate(-1)}
          type="button"
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>

        <div className="teacher-flashcards-title-area">

          <div className="teacher-flashcards-title-icon">
            <FaLayerGroup />
          </div>

          <div>

            <h1>
              Flashcards
            </h1>

            <p>
              Teacher Free
            </p>

          </div>

        </div>

        <div className="teacher-flashcards-limit">

          <span>
            Daily
          </span>

          <strong>
            {dailyCount}/{DAILY_LIMIT}
          </strong>

        </div>

      </header>

      {/* MAIN */}

      <main className="teacher-flashcards-content">

        {/* GENERATOR */}

        <section className="teacher-flashcards-generator">

          <div className="teacher-flashcards-section-heading">

            <div>

              <h2>
                Create Flashcards
              </h2>

              <p>
                Generate classroom-ready flashcards with AI.
              </p>

            </div>

            <div className="teacher-flashcards-remaining">

              {remaining} generation
              {remaining !== 1 ? "s" : ""}
              {" "}remaining

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="teacher-flashcards-alert error">

              <FaExclamationTriangle />

              <span>
                {error}
              </span>

            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="teacher-flashcards-alert success">

              <FaCheckCircle />

              <span>
                {success}
              </span>

            </div>
          )}

          {/* FORM */}

          <div className="teacher-flashcards-form">

            <div className="teacher-flashcards-field">

              <label>
                <FaBook />
                Subject
              </label>

              <input
                type="text"
                value={subject}
                onChange={(e) =>
                  setSubject(e.target.value)
                }
                placeholder="e.g. Biology"
              />

            </div>

            <div className="teacher-flashcards-field">

              <label>
                <FaGraduationCap />
                Class
              </label>

              <input
                type="text"
                value={className}
                onChange={(e) =>
                  setClassName(e.target.value)
                }
                placeholder="e.g. Class 10"
              />

            </div>

            <div className="teacher-flashcards-field teacher-flashcards-wide">

              <label>
                <FaLightbulb />
                Topic
              </label>

              <input
                type="text"
                value={topic}
                onChange={(e) =>
                  setTopic(e.target.value)
                }
                placeholder="e.g. Human Digestive System"
              />

            </div>

            <div className="teacher-flashcards-field">

              <label>
                <FaLanguage />
                Language
              </label>

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value)
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

            <div className="teacher-flashcards-field">

              <label>
                <FaLayerGroup />
                Number of Cards
              </label>

              <div className="teacher-flashcards-number-control">

                <button
                  type="button"
                  onClick={decreaseCards}
                  disabled={numberOfCards <= 4}
                >
                  <FaMinus />
                </button>

                <span>
                  {numberOfCards}
                </span>

                <button
                  type="button"
                  onClick={increaseCards}
                  disabled={numberOfCards >= 20}
                >
                  <FaPlus />
                </button>

              </div>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="teacher-flashcards-actions">

            <button
              type="button"
              className="teacher-flashcards-generate"
              onClick={generateFlashcards}
              disabled={
                loading ||
                dailyCount >= DAILY_LIMIT
              }
            >

              {loading ? (
                <>
                  <FaSyncAlt className="teacher-flashcards-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FaLayerGroup />
                  Generate Flashcards
                </>
              )}

            </button>

            <button
              type="button"
              className="teacher-flashcards-reset"
              onClick={resetPage}
              disabled={loading}
            >
              <FaRedo />
              Reset
            </button>

          </div>

        </section>

        {/* WORKSPACE */}

        <section className="teacher-flashcards-workspace">

          <div className="teacher-flashcards-workspace-header">

            <div>

              <h2>
                Generated Flashcards
              </h2>

              <p>

                {flashcards.length
                  ? `${flashcards.length} flashcards ready`
                  : "Your generated flashcards will appear here."}

              </p>

            </div>

            {/* PDF BUTTON */}

            {flashcards.length > 0 && (

              <button
                type="button"
                className={`teacher-flashcards-print ${
                  !isPremium ? "locked" : ""
                }`}
                onClick={() => {

                  if (!isPremium) {

                    setError(
                      "PDF Download is available only on Teacher Pro. Upgrade your plan to unlock PDF downloads."
                    );

                    return;
                  }

                  printFlashcards();

                }}
              >

                {isPremium ? (
                  <>
                    <FaPrint />
                    Print / PDF
                  </>
                ) : (
                  <>
                    <FaLock />
                    PDF Locked
                  </>
                )}

              </button>

            )}

          </div>

          {/* EMPTY */}

          {flashcards.length === 0 ? (

            <div className="teacher-flashcards-empty">

              <div className="teacher-flashcards-empty-icon">
                <FaLayerGroup />
              </div>

              <h3>
                No Flashcards Yet
              </h3>

              <p>
                Enter your subject, class and topic above,
                then generate flashcards for your students.
              </p>

            </div>

          ) : (

            <div className="teacher-flashcards-viewer">

              {/* FLASHCARD */}

              <div
                className={`teacher-flashcard ${
                  flipped ? "is-flipped" : ""
                }`}
                onClick={() =>
                  setFlipped((prev) => !prev)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {

                  if (
                    e.key === "Enter" ||
                    e.key === " "
                  ) {
                    setFlipped((prev) => !prev);
                  }

                }}
              >

                <div className="teacher-flashcard-inner">

                  {/* FRONT */}

                  <div className="teacher-flashcard-front">

                    <div className="teacher-flashcard-badge">
                      QUESTION
                    </div>

                    <div className="teacher-flashcard-content">
                      {flashcards[activeCard]?.question}
                    </div>

                    <div className="teacher-flashcard-hint">
                      Click to reveal answer
                    </div>

                  </div>

                  {/* BACK */}

                  <div className="teacher-flashcard-back">

                    <div className="teacher-flashcard-badge">
                      ANSWER
                    </div>

                    <div className="teacher-flashcard-content">
                      {flashcards[activeCard]?.answer}
                    </div>

                    <div className="teacher-flashcard-hint">
                      Click to see question
                    </div>

                  </div>

                </div>

              </div>

              {/* NAVIGATION */}

              <div className="teacher-flashcards-navigation">

                <button
                  type="button"
                  onClick={previousCard}
                  aria-label="Previous flashcard"
                >
                  <FaChevronLeft />
                </button>

                <div className="teacher-flashcards-counter">

                  <strong>
                    {activeCard + 1}
                  </strong>

                  <span>
                    /
                  </span>

                  <span>
                    {flashcards.length}
                  </span>

                </div>

                <button
                  type="button"
                  onClick={nextCard}
                  aria-label="Next flashcard"
                >
                  <FaChevronRight />
                </button>

              </div>

              {/* MINI CARDS */}

              <div className="teacher-flashcards-card-list">

                {flashcards.map((card, index) => (

                  <button
                    type="button"
                    key={`${index}-${card.question}`}
                    className={`teacher-flashcards-mini-card ${
                      index === activeCard
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {

                      setActiveCard(index);
                      setFlipped(false);

                    }}
                  >

                    <span>
                      Card {index + 1}
                    </span>

                    <strong>
                      {card.question}
                    </strong>

                  </button>

                ))}

              </div>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}