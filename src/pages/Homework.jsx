import "./Homework.css";
import {
  FaArrowLeft,
  FaBookOpen,
  FaWandMagicSparkles,
  FaDownload,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import jsPDF from "jspdf";

function Homework() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [homework, setHomework] = useState("");
  const [loading, setLoading] = useState(false);
  const [homeworkCount, setHomeworkCount] = useState(0);

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
  // DAILY HOMEWORK COUNT
  // =========================

  useEffect(() => {
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const savedDate =
      localStorage.getItem(
        "homeworkDate"
      );

    const savedCount =
      Number(
        localStorage.getItem(
          "homeworkCount"
        )
      ) || 0;

    if (savedDate === today) {
      setHomeworkCount(savedCount);
    } else {
      localStorage.setItem(
        "homeworkDate",
        today
      );

      localStorage.setItem(
        "homeworkCount",
        "0"
      );

      setHomeworkCount(0);
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

    if (!homework) {
      alert(
        "Please solve homework first."
      );

      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text(
      "Giganics Homework Solution",
      15,
      20
    );

    doc.setFontSize(11);

    // Remove Markdown formatting
    const cleanText = homework
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
      )
      .replace(
        /\$\$(.*?)\$\$/gs,
        "$1"
      )
      .replace(
        /\$(.*?)\$/g,
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

    doc.save(
      "Giganics-Homework-Solution.pdf"
    );
  };

  // =========================
  // GENERATE HOMEWORK
  // =========================

  const generateHomework = async () => {
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const savedDate =
      localStorage.getItem(
        "homeworkDate"
      );

    let currentCount =
      Number(
        localStorage.getItem(
          "homeworkCount"
        )
      ) || 0;

    // =========================
    // RESET DAILY COUNT
    // =========================

    if (savedDate !== today) {
      localStorage.setItem(
        "homeworkDate",
        today
      );

      localStorage.setItem(
        "homeworkCount",
        "0"
      );

      currentCount = 0;

      setHomeworkCount(0);
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
      dailyLimit = 3;
      planName = "Teacher Free";
    }

    if (
      plan === "student_free"
    ) {
      dailyLimit = 3;
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
        `You have reached your ${planName} limit of ${dailyLimit} Homework solutions per day.`
      );

      return;
    }

    // =========================
    // CHECK QUESTION
    // =========================

    if (!question.trim()) {
      alert(
        "Please enter your homework question."
      );

      return;
    }

    try {
      setLoading(true);
      setHomework("");

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
You are an AI homework solver for students.

Solve the following homework question clearly and correctly.

Rules:
- Explain the answer in simple student-friendly language.
- Show important steps when needed.
- Do not make the answer unnecessarily complicated.
- If it is a math question, show the calculation steps.
- If it is a science question, explain the concept clearly.
- If it is an English question, provide the correct answer and explanation.
- Use Markdown headings, bullet points, numbered steps, and bold text where useful.
- For mathematical equations, use LaTeX.
- Do not use unnecessary decorative symbols.

Homework Question:
${question}
            `,
          }
        );

      const generatedHomework =
        response.text ||
        "No answer was generated.";

      setHomework(
        generatedHomework
      );

      // =========================
      // UPDATE DAILY COUNT
      // =========================

      const newCount =
        currentCount + 1;

      localStorage.setItem(
        "homeworkCount",
        newCount.toString()
      );

      localStorage.setItem(
        "homeworkDate",
        today
      );

      setHomeworkCount(
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
            "Homework Solution",

          type:
            "Homework",

          date:
            "Today",

          content:
            generatedHomework,
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
        "Homework generation error:",
        error
      );

      setHomework(
        "Failed to generate homework solution. Please check your API key and try again."
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
    <div className="homework-page">

      {/* =========================
          BACK
      ========================= */}

      <button
        className="homework-back"
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

      <div className="homework-header">

        <div className="homework-icon">
          <FaBookOpen />
        </div>

        <div>

          <h1>
            Homework Solver
          </h1>

          <p>
            Enter your homework question
            and get a clear AI-powered
            solution.
          </p>

        </div>

      </div>

      {/* =========================
          GENERATOR
      ========================= */}

      <div className="homework-card">

        <label>
          Homework Question
        </label>

        <textarea
          value={question}
          onChange={(e) =>
            setQuestion(
              e.target.value
            )
          }
          placeholder="Write your homework question here..."
          disabled={loading}
        />

        <button
          className="homework-generate"
          onClick={
            generateHomework
          }
          disabled={loading}
        >
          <FaWandMagicSparkles />

          {loading
            ? "Solving..."
            : "Solve Homework"}
        </button>

      </div>

      {/* =========================
          RESULT
      ========================= */}

      {homework && (
        <div className="homework-result">

          <h2>
            Solution
          </h2>

          <div className="homework-answer">

            <ReactMarkdown
              remarkPlugins={[
                remarkMath,
              ]}
              rehypePlugins={[
                rehypeKatex,
              ]}
            >
              {homework}
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

export default Homework;