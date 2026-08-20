import "./Flashcards.css";
import {
  FaArrowLeft,
  FaLayerGroup,
  FaMagic,
  FaDownload,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

function Flashcards() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [flashcards, setFlashcards] = useState("");
  const [loading, setLoading] = useState(false);
  const [flashcardsCount, setFlashcardsCount] = useState(0);

  // =========================
  // GET CURRENT PLAN
  // =========================

  const getPlan = () => {
    return (
      localStorage.getItem("plan") ||
      "student_free"
    );
  };

  // =========================
  // DAILY FLASHCARD COUNT
  // =========================

  useEffect(() => {
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const savedDate =
      localStorage.getItem(
        "flashcardsDate"
      );

    const savedCount =
      Number(
        localStorage.getItem(
          "flashcardsCount"
        )
      ) || 0;

    if (savedDate === today) {
      setFlashcardsCount(
        savedCount
      );
    } else {
      localStorage.setItem(
        "flashcardsDate",
        today
      );

      localStorage.setItem(
        "flashcardsCount",
        "0"
      );

      setFlashcardsCount(0);
    }
  }, []);

  // =========================
  // DOWNLOAD PDF
  // =========================

  const downloadPDF = () => {
    const plan = getPlan();

    // =========================
    // PDF ACCESS
    // =========================

    const pdfAllowedPlans = [
      "teacher_premium",
      "student_basic",
      "student_premium",
    ];

    if (
      !pdfAllowedPlans.includes(plan)
    ) {
      if (
        plan === "teacher_free"
      ) {
        alert(
          "PDF Download is available only on Teacher Premium."
        );
      } else {
        alert(
          "PDF Download is available only on Student Basic and Student Premium."
        );
      }

      return;
    }

    if (!flashcards) {
      alert(
        "Please generate flashcards first."
      );

      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text(
      "Giganics AI Flashcards",
      15,
      20
    );

    doc.setFontSize(11);

    // Remove Markdown formatting
    const cleanText =
      flashcards
        .replace(
          /^#{1,6}\s?/gm,
          ""
        )
        .replace(
          /\*\*(.*?)\*\*/g,
          "$1"
        )
        .replace(
          /\*(.*?)\*/g,
          "$1"
        )
        .replace(
          /^---$/gm,
          ""
        )
        .replace(
          /`(.*?)`/g,
          "$1"
        );

    const lines =
      doc.splitTextToSize(
        cleanText,
        180
      );

    let y = 32;

    lines.forEach((line) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }

      doc.text(
        line,
        15,
        y
      );

      y += 6;
    });

    const safeFileName =
      topic
        .trim()
        .replace(
          /[\\/:*?"<>|]/g,
          ""
        )
        .replace(
          /\s+/g,
          "-"
        ) ||
      "AI-Flashcards";

    doc.save(
      `${safeFileName}-Flashcards.pdf`
    );
  };

  // =========================
  // GENERATE FLASHCARDS
  // =========================

  const generateFlashcards =
    async () => {
      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      const savedDate =
        localStorage.getItem(
          "flashcardsDate"
        );

      let currentCount =
        Number(
          localStorage.getItem(
            "flashcardsCount"
          )
        ) || 0;

      // =========================
      // RESET DAILY COUNT
      // =========================

      if (
        savedDate !== today
      ) {
        localStorage.setItem(
          "flashcardsDate",
          today
        );

        localStorage.setItem(
          "flashcardsCount",
          "0"
        );

        currentCount = 0;

        setFlashcardsCount(0);
      }

      // =========================
      // GET PLAN
      // =========================

      const plan = getPlan();

      // =========================
      // PLAN LIMIT
      // =========================

      let dailyLimit = Infinity;
      let planName = "Premium";

      if (
        plan ===
        "teacher_free"
      ) {
        dailyLimit = 5;
        planName =
          "Teacher Free";
      }

      if (
        plan ===
        "student_free"
      ) {
        dailyLimit = 5;
        planName =
          "Student Free";
      }

      // =========================
      // CHECK DAILY LIMIT
      // =========================

      if (
        currentCount >=
        dailyLimit
      ) {
        alert(
          `You have reached your ${planName} limit of ${dailyLimit} Flashcard generations per day.`
        );

        return;
      }

      // =========================
      // CHECK TOPIC
      // =========================

      if (!topic.trim()) {
        alert(
          "Please enter a topic."
        );

        return;
      }

      try {
        setLoading(true);
        setFlashcards("");

        // =========================
        // AI
        // =========================

        const ai =
          new GoogleGenAI({
            apiKey:
              import.meta.env
                .VITE_GEMINI_API_KEY,
          });

        const response =
          await ai.models.generateContent(
            {
              model:
                "gemini-3.5-flash",

              contents: `
You are an AI flashcard generator for students.

Create exactly 10 useful flashcards about this topic:

${topic}

Rules:
- Generate exactly 10 flashcards.
- Each flashcard must have a Question and Answer.
- Keep questions clear and suitable for students.
- Answers should be short but informative.
- Cover different important points of the topic.
- Use Markdown formatting.
- Do not introduce yourself.
- Do not mention Gemini, Google, or any AI model.

Format every flashcard like this:

### Flashcard 1

**Question:** Question here

**Answer:** Answer here

Continue until Flashcard 10.
              `,
            }
          );

        const generatedFlashcards =
          response.text ||
          "No flashcards were generated.";

        setFlashcards(
          generatedFlashcards
        );

        // =========================
        // UPDATE DAILY COUNT
        // =========================

        const newCount =
          currentCount + 1;

        localStorage.setItem(
          "flashcardsCount",
          newCount.toString()
        );

        localStorage.setItem(
          "flashcardsDate",
          today
        );

        setFlashcardsCount(
          newCount
        );

        // =========================
        // SAVE TO MY FILES
        // =========================

        const savedFiles =
          JSON.parse(
            localStorage.getItem(
              "giganics_files"
            )
          ) || [];

        // =========================
        // FILE LIMIT
        // =========================

        let maxFiles = Infinity;
        let storagePlanName =
          "Premium";

        if (
          plan ===
          "teacher_free"
        ) {
          maxFiles = 20;
          storagePlanName =
            "Teacher Free";
        }

        if (
          plan ===
          "student_free"
        ) {
          maxFiles = 10;
          storagePlanName =
            "Student Free";
        }

        if (
          plan ===
          "student_basic"
        ) {
          maxFiles = 500;
          storagePlanName =
            "Student Basic";
        }

        // =========================
        // CHECK FILE LIMIT
        // =========================

        if (
          savedFiles.length >=
          maxFiles
        ) {
          alert(
            `Your ${storagePlanName} plan has reached the maximum limit of ${maxFiles} files.`
          );
        } else {
          const newFile = {
            id: Date.now(),

            title:
              `${topic} Flashcards`,

            type:
              "Flashcards",

            date:
              "Today",

            content:
              generatedFlashcards,
          };

          const updatedFiles = [
            newFile,
            ...savedFiles,
          ];

          localStorage.setItem(
            "giganics_files",
            JSON.stringify(
              updatedFiles
            )
          );
        }

      } catch (error) {
        console.error(
          "Flashcard generation error:",
          error
        );

        setFlashcards(
          "Failed to generate flashcards. Please check your API key and try again."
        );

      } finally {
        setLoading(false);
      }
    };

  // =========================
  // BACK TO DASHBOARD
  // =========================

  const handleBack = () => {
    const plan = getPlan();

    if (
      plan ===
      "teacher_free"
    ) {
      navigate(
        "/teacher-dashboard"
      );
    } else if (
      plan ===
      "teacher_premium"
    ) {
      navigate(
        "/teacher-premium-dashboard"
      );
    } else if (
      plan ===
      "student_basic"
    ) {
      navigate(
        "/student-basic-dashboard"
      );
    } else if (
      plan ===
      "student_premium"
    ) {
      navigate(
        "/student-premium-dashboard"
      );
    } else {
      navigate(
        "/student-dashboard"
      );
    }
  };

  return (
    <div className="flashcards-page">

      {/* =========================
          BACK
      ========================= */}

      <button
        className="flashcards-back"
        onClick={
          handleBack
        }
      >
        <FaArrowLeft />
        Back
      </button>

      {/* =========================
          HEADER
      ========================= */}

      <div className="flashcards-header">

        <div className="flashcards-icon">
          <FaLayerGroup />
        </div>

        <div>

          <h1>
            AI Flashcards
          </h1>

          <p>
            Create smart flashcards
            with AI for faster
            revision.
          </p>

        </div>

      </div>

      {/* =========================
          GENERATOR
      ========================= */}

      <div className="flashcards-card">

        <label>
          Topic
        </label>

        <input
          type="text"
          value={topic}
          onChange={(e) =>
            setTopic(
              e.target.value
            )
          }
          placeholder="Enter a topic..."
          disabled={loading}
        />

        <button
          className="flashcards-generate"
          onClick={
            generateFlashcards
          }
          disabled={loading}
        >
          <FaMagic />

          {loading
            ? "Generating..."
            : "Generate Flashcards"}
        </button>

      </div>

      {/* =========================
          RESULT
      ========================= */}

      {flashcards && (
        <div className="flashcards-result">

          <h2>
            Generated Flashcards
          </h2>

          <div className="flashcards-answer">

            <ReactMarkdown>
              {flashcards}
            </ReactMarkdown>

          </div>

          {/* =========================
              DOWNLOAD PDF
          ========================= */}

          <button
            className="download-pdf-btn"
            onClick={
              downloadPDF
            }
          >
            <FaDownload />

            Download PDF
          </button>

        </div>
      )}

    </div>
  );
}

export default Flashcards;