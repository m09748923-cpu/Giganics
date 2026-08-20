import "./MCQs.css";
import {
  FaArrowLeft,
  FaQuestionCircle,
  FaMagic,
  FaDownload,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

function MCQs() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [mcqs, setMcqs] = useState("");
  const [loading, setLoading] = useState(false);
  const [mcqsCount, setMcqsCount] = useState(0);

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
  // DAILY MCQ COUNT
  // =========================

  useEffect(() => {
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
      if (plan === "teacher_free") {
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

    if (!mcqs) {
      alert(
        "Please generate MCQs first."
      );

      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(
      "Giganics AI MCQs",
      15,
      20
    );

    doc.setFontSize(11);

    // Remove Markdown formatting
    const cleanText = mcqs
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
      "AI-MCQs";

    doc.save(
      `${safeFileName}-MCQs.pdf`
    );
  };

  // =========================
  // GENERATE MCQs
  // =========================

  const generateMCQs = async () => {
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const savedDate =
      localStorage.getItem(
        "mcqsDate"
      );

    let currentCount =
      Number(
        localStorage.getItem(
          "mcqsCount"
        )
      ) || 0;

    // =========================
    // RESET DAILY COUNT
    // =========================

    if (savedDate !== today) {
      localStorage.setItem(
        "mcqsDate",
        today
      );

      localStorage.setItem(
        "mcqsCount",
        "0"
      );

      currentCount = 0;

      setMcqsCount(0);
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
      plan === "teacher_free"
    ) {
      dailyLimit = 5;
      planName = "Teacher Free";
    }

    if (
      plan === "student_free"
    ) {
      dailyLimit = 10;
      planName = "Student Free";
    }

    // =========================
    // CHECK DAILY LIMIT
    // =========================

    if (
      currentCount >=
      dailyLimit
    ) {
      alert(
        `You have reached your ${planName} limit of ${dailyLimit} MCQ generations per day.`
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
      setMcqs("");

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
You are an AI MCQ generator for students.

Generate exactly 10 multiple-choice questions about this topic:

${topic}

Rules:
- Each question must have exactly 4 options.
- Label options as A, B, C, and D.
- Clearly mention the correct answer.
- Give a short explanation for the correct answer.
- Keep the questions suitable for students.
- Use Markdown formatting.
- Make the questions varied and useful for learning.

Format every question like this:

### Question 1
Question text

**A.** Option
**B.** Option
**C.** Option
**D.** Option

**Correct Answer:** B

**Explanation:** Short explanation.

Continue until Question 10.
            `,
          }
        );

      const generatedMCQs =
        response.text ||
        "No MCQs were generated.";

      setMcqs(
        generatedMCQs
      );

      // =========================
      // UPDATE DAILY COUNT
      // =========================

      const newCount =
        currentCount + 1;

      localStorage.setItem(
        "mcqsCount",
        newCount.toString()
      );

      localStorage.setItem(
        "mcqsDate",
        today
      );

      setMcqsCount(
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
        maxFiles = 10;
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
            `${topic} MCQs`,

          type:
            "MCQs",

          date:
            "Today",

          content:
            generatedMCQs,
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
        "MCQ generation error:",
        error
      );

      setMcqs(
        "Failed to generate MCQs. Please check your API key and try again."
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
    <div className="mcqs-page">

      {/* =========================
          BACK
      ========================= */}

      <button
        className="mcqs-back"
        onClick={handleBack}
      >
        <FaArrowLeft />
        Back
      </button>

      {/* =========================
          HEADER
      ========================= */}

      <div className="mcqs-header">

        <div className="mcqs-icon">
          <FaQuestionCircle />
        </div>

        <div>
          <h1>
            AI MCQs
          </h1>

          <p>
            Generate smart multiple-choice
            questions with AI.
          </p>
        </div>

      </div>

      {/* =========================
          GENERATOR
      ========================= */}

      <div className="mcqs-card">

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
          className="mcqs-generate"
          onClick={
            generateMCQs
          }
          disabled={loading}
        >
          <FaMagic />

          {loading
            ? "Generating..."
            : "Generate MCQs"}
        </button>

      </div>

      {/* =========================
          RESULT
      ========================= */}

      {mcqs && (
        <div className="mcqs-result">

          <h2>
            Generated MCQs
          </h2>

          <div className="mcqs-answer">

            <ReactMarkdown>
              {mcqs}
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

export default MCQs;