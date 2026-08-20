import "./Revision.css";
import {
  FaArrowLeft,
  FaFileAlt,
  FaMagic,
  FaDownload,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";

function Revision() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [revision, setRevision] = useState("");
  const [loading, setLoading] = useState(false);
  const [revisionCount, setRevisionCount] = useState(0);

  // =========================
  // DAILY REVISION COUNT
  // =========================

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const savedDate = localStorage.getItem("revisionDate");
    const savedCount =
      Number(localStorage.getItem("revisionCount")) || 0;

    if (savedDate === today) {
      setRevisionCount(savedCount);
    } else {
      localStorage.setItem("revisionDate", today);
      localStorage.setItem("revisionCount", "0");
      setRevisionCount(0);
    }
  }, []);

  // =========================
  // DOWNLOAD PDF
  // =========================

  const downloadPDF = () => {
    const plan =
      localStorage.getItem("plan") || "student_free";

    if (
      plan !== "student_basic" &&
      plan !== "student_premium"
    ) {
      alert(
        "PDF Download is available only on Student Basic and Student Premium plans."
      );
      return;
    }

    if (!revision) {
      alert("Please generate a revision sheet first.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Giganics AI Revision Sheet", 15, 20);

    doc.setFontSize(11);

    // Remove Markdown formatting
    const cleanText = revision
      .replace(/^#{1,6}\s?/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/^---$/gm, "")
      .replace(/`(.*?)`/g, "$1");

    const lines = doc.splitTextToSize(cleanText, 180);

    let y = 32;

    lines.forEach((line) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }

      doc.text(line, 15, y);
      y += 6;
    });

    doc.save(`${topic}-Revision.pdf`);
  };

  // =========================
  // GENERATE REVISION
  // =========================

  const generateRevision = async () => {
    const today = new Date().toISOString().split("T")[0];
    const savedDate = localStorage.getItem("revisionDate");

    if (savedDate !== today) {
      localStorage.setItem("revisionDate", today);
      localStorage.setItem("revisionCount", "0");
      setRevisionCount(0);
    }

    const currentCount =
      savedDate === today
        ? Number(localStorage.getItem("revisionCount")) || 0
        : 0;

    const plan =
      localStorage.getItem("plan") || "student_free";

    // Student Free limit
    if (plan === "student_free" && currentCount >= 2) {
      alert(
        "You have reached your Student Free limit of 2 Revision Sheets per day."
      );
      return;
    }

    if (!topic.trim()) {
      alert("Please enter a topic.");
      return;
    }

    try {
      setLoading(true);
      setRevision("");

      const ai = new GoogleGenAI({
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `
You are an AI revision sheet generator for students.

Create a clear and useful revision sheet about this topic:

${topic}

Rules:
- Include the most important concepts.
- Include key definitions.
- Include important facts.
- Include formulas if the topic requires them.
- Include important points students should remember.
- Keep it concise and easy to revise.
- Use headings and bullet points.
- Use Markdown formatting.
- Make it suitable for school students.

Format:

# Revision Sheet

## Topic Overview

## Key Concepts

## Important Definitions

## Important Facts

## Formulas
Only include this section if relevant.

## Quick Remember

Keep the revision sheet focused and useful for exam preparation.
        `,
      });

      const generatedRevision =
        response.text || "No revision sheet was generated.";

      setRevision(generatedRevision);

      // =========================
      // SAVE GENERATION COUNT
      // =========================

      const newCount = currentCount + 1;

      localStorage.setItem(
        "revisionCount",
        newCount.toString()
      );

      localStorage.setItem(
        "revisionDate",
        today
      );

      setRevisionCount(newCount);

      // =========================
      // SAVE TO MY FILES
      // =========================

      const savedFiles =
        JSON.parse(
          localStorage.getItem("giganics_files")
        ) || [];

      const currentPlan =
        localStorage.getItem("plan") ||
        "student_free";

      if (
        currentPlan === "student_basic" &&
        savedFiles.length >= 500
      ) {
        alert(
          "Your Student Basic plan has reached the maximum limit of 500 files."
        );
      } else {
        const newFile = {
          id: Date.now(),
          title: `${topic} Revision`,
          type: "Revision",
          date: "Today",
          content: generatedRevision,
        };

        const updatedFiles = [
          newFile,
          ...savedFiles,
        ];

        localStorage.setItem(
          "giganics_files",
          JSON.stringify(updatedFiles)
        );
      }

    } catch (error) {
      console.error(
        "Revision generation error:",
        error
      );

      setRevision(
        "Failed to generate revision sheet. Please check your API key and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="revision-page">

      {/* BACK */}

      <button
        className="revision-back"
        onClick={() => {
          const plan =
            localStorage.getItem("plan") ||
            "student_free";

          if (plan === "student_basic") {
            navigate("/student-basic-dashboard");
          } else if (plan === "student_premium") {
            navigate("/student-premium-dashboard");
          } else {
            navigate("/student-dashboard");
          }
        }}
      >
        <FaArrowLeft />
        Back
      </button>

      {/* HEADER */}

      <div className="revision-header">

        <div className="revision-icon">
          <FaFileAlt />
        </div>

        <div>
          <h1>AI Revision Sheets</h1>

          <p>
            Create quick and smart revision sheets with AI.
          </p>
        </div>

      </div>

      {/* GENERATOR */}

      <div className="revision-card">

        <label>Topic</label>

        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic..."
          disabled={loading}
        />

        <button
          className="revision-generate"
          onClick={generateRevision}
          disabled={loading}
        >
          <FaMagic />

          {loading
            ? "Generating..."
            : "Generate Revision Sheet"}
        </button>

      </div>

      {/* RESULT */}

      {revision && (
        <div className="revision-result">

          <h2>Generated Revision Sheet</h2>

          <div className="revision-answer">
            <ReactMarkdown>
              {revision}
            </ReactMarkdown>
          </div>

          {/* DOWNLOAD PDF */}

          <button
            className="download-pdf-btn"
            onClick={downloadPDF}
          >
            <FaDownload />
            Download PDF
          </button>

        </div>
      )}

    </div>
  );
}

export default Revision;