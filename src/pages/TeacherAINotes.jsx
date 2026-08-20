import "./TeacherAINotes.css";

import {
  FaArrowLeft,
  FaBookOpen,
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

function TeacherAINotes() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("English");

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [plan, setPlan] = useState("teacher_free");
  const [notesCount, setNotesCount] = useState(0);

  const FREE_LIMIT = 10;

  useEffect(() => {
    const savedPlan =
      localStorage.getItem("plan") || "teacher_free";

    setPlan(savedPlan);

    const today = new Date().toISOString().split("T")[0];

    const savedDate = localStorage.getItem(
      "teacherAiNotesDate"
    );

    let count = Number(
      localStorage.getItem("teacherAiNotesCount") || 0
    );

    if (savedDate !== today) {
      localStorage.setItem("teacherAiNotesDate", today);
      localStorage.setItem("teacherAiNotesCount", "0");
      count = 0;
    }

    setNotesCount(count);
  }, []);

  const isPremium = plan === "teacher_premium";

  const generateNotes = async () => {
    setError("");

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

    if (!isPremium && notesCount >= FREE_LIMIT) {
      setError(
        "Teacher Free daily limit reached. Upgrade to Teacher Premium for more generation."
      );
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      setError(
        "Gemini API key is missing. Please check your .env file."
      );
      return;
    }

    try {
      setLoading(true);
      setNotes("");

      const ai = new GoogleGenAI({
        apiKey,
      });

      const prompt = `
You are an expert teacher assistant for Giganics.

Create high-quality classroom notes for a teacher.

Subject: ${subject}
Class: ${className}
Topic: ${topic}
Language: ${language}

Requirements:

- Start with a clear title.
- Explain the topic in a teacher-friendly way.
- Use clear headings and subheadings.
- Include important definitions.
- Include key points.
- Include examples where useful.
- Keep the content educational and accurate.
- Make the notes easy to teach from.
- Do not mention that you are an AI.
- Do not add unnecessary introduction or conclusion.
- Use Markdown formatting.
- If the language is Urdu, write naturally in Urdu.
- If the language is Sindhi, write naturally in Sindhi.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const generatedText =
        response?.text ||
        response?.candidates?.[0]?.content?.parts
          ?.map((part) => part.text || "")
          .join("") ||
        "";

      if (!generatedText.trim()) {
        throw new Error("No notes were generated.");
      }

      setNotes(generatedText);

      const today = new Date().toISOString().split("T")[0];

      if (!isPremium) {
        const newCount = notesCount + 1;

        localStorage.setItem(
          "teacherAiNotesDate",
          today
        );

        localStorage.setItem(
          "teacherAiNotesCount",
          String(newCount)
        );

        setNotesCount(newCount);
      }

      saveToMyFiles(generatedText);
    } catch (err) {
      console.error("Teacher AI Notes Error:", err);

      setError(
        err?.message ||
          "Something went wrong while generating notes."
      );
    } finally {
      setLoading(false);
    }
  };

  const saveToMyFiles = (generatedNotes) => {
    try {
      const existingFiles = JSON.parse(
        localStorage.getItem("giganics_files") || "[]"
      );

      const newFile = {
        id: Date.now(),
        type: "AI Notes",
        title: `${subject} - ${topic}`,
        subject,
        className,
        topic,
        language,
        content: generatedNotes,
        createdAt: new Date().toISOString(),
      };

      const updatedFiles = [
        newFile,
        ...existingFiles,
      ];

      localStorage.setItem(
        "giganics_files",
        JSON.stringify(updatedFiles)
      );
    } catch (err) {
      console.error("File save error:", err);
    }
  };

  const downloadPDF = () => {
    if (!notes.trim()) return;

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 18;
    const usableWidth = pageWidth - margin * 2;

    let y = 20;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);

    pdf.text(
      `${subject} - ${topic}`,
      margin,
      y
    );

    y += 10;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    pdf.text(
      `Class: ${className}`,
      margin,
      y
    );

    y += 7;

    pdf.text(
      `Language: ${language}`,
      margin,
      y
    );

    y += 10;

    pdf.setFontSize(11);

    const plainText = notes
      .replace(/#{1,6}\s?/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "");

    const lines = pdf.splitTextToSize(
      plainText,
      usableWidth
    );

    lines.forEach((line) => {
      if (y > pageHeight - 18) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(line, margin, y);
      y += 6;
    });

    pdf.save(
      `Giganics-${subject}-${topic}-Notes.pdf`
    );
  };

  const resetGenerator = () => {
    setSubject("");
    setClassName("");
    setTopic("");
    setLanguage("English");
    setNotes("");
    setError("");
  };

  return (
    <div className="teacher-ai-notes-page">

      {/* ================= HEADER ================= */}

      <header className="teacher-ai-header">

        <button
          className="teacher-back-button"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>

        <div className="teacher-ai-header-title">
          <FaBookOpen />

          <div>
            <h1>Teacher AI Notes</h1>
            <p>AI-powered classroom notes generator</p>
          </div>
        </div>

        <div
          className={`teacher-plan-badge ${
            isPremium ? "premium" : "free"
          }`}
        >
          {isPremium ? <FaCrown /> : <FaBookOpen />}
          <span>
            {isPremium
              ? "Teacher Premium"
              : "Teacher Free"}
          </span>
        </div>

      </header>

      {/* ================= MAIN ================= */}

      <main className="teacher-ai-main">

        {/* ================= GENERATOR ================= */}

        <section className="teacher-generator-panel">

          <div className="generator-heading">
            <div className="generator-icon">
              <FaWandMagicSparkles />
            </div>

            <div>
              <h2>Generate Teaching Notes</h2>
              <p>
                Create structured notes for your classroom
                in seconds.
              </p>
            </div>

            <div className="generator-limit">

              {isPremium ? (
                <>
                  <FaCrown />
                  <span>Premium Generation</span>
                </>
              ) : (
                <>
                  <span>
                    Daily: {notesCount}/{FREE_LIMIT}
                  </span>
                </>
              )}

            </div>
          </div>

          <div className="generator-fields">

            {/* SUBJECT */}

            <div className="teacher-field">
              <label>Subject</label>

              <input
                type="text"
                placeholder="e.g. Mathematics"
                value={subject}
                onChange={(e) =>
                  setSubject(e.target.value)
                }
              />
            </div>

            {/* CLASS */}

            <div className="teacher-field">
              <label>Class</label>

              <input
                type="text"
                placeholder="e.g. Class 8"
                value={className}
                onChange={(e) =>
                  setClassName(e.target.value)
                }
              />
            </div>

            {/* TOPIC */}

            <div className="teacher-field topic-field">
              <label>Topic</label>

              <input
                type="text"
                placeholder="e.g. Photosynthesis"
                value={topic}
                onChange={(e) =>
                  setTopic(e.target.value)
                }
              />
            </div>

            {/* LANGUAGE */}

            <div className="teacher-field">
              <label>Language</label>

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

          </div>

          {error && (
            <div className="teacher-ai-error">
              {error}
            </div>
          )}

          <div className="generator-actions">

            <button
              className="generate-notes-button"
              onClick={generateNotes}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" />
                  Generating Notes...
                </>
              ) : (
                <>
                  <FaWandMagicSparkles />
                  Generate Notes
                </>
              )}
            </button>

            <button
              className="reset-notes-button"
              onClick={resetGenerator}
              disabled={loading}
            >
              <FaRotate />
              Reset
            </button>

          </div>

        </section>

        {/* ================= WORKSPACE ================= */}

        <section className="teacher-notes-workspace">

          <div className="workspace-header">

            <div className="workspace-title">

              <div className="workspace-title-icon">
                <FaBookOpen />
              </div>

              <div>
                <h2>Generated Notes</h2>
                <p>
                  Your AI-generated teaching material
                </p>
              </div>

            </div>

            <div className="workspace-actions">

              <button
                className="workspace-download"
                onClick={downloadPDF}
                disabled={!notes.trim()}
              >
                <FaDownload />
                Download PDF
              </button>

            </div>

          </div>

          <div className="notes-workspace-content">

            {!notes && !loading && (
              <div className="empty-notes-state">

                <div className="empty-notes-icon">
                  <FaBookOpen />
                </div>

                <h3>Your notes will appear here</h3>

                <p>
                  Enter the subject, class and topic
                  above, then generate your classroom
                  notes.
                </p>

              </div>
            )}

            {loading && (
              <div className="generating-state">

                <div className="large-spinner" />

                <h3>Creating your notes...</h3>

                <p>
                  Giganics AI is preparing structured
                  classroom material.
                </p>

              </div>
            )}

            {notes && !loading && (
              <article className="generated-notes">

                <ReactMarkdown>
                  {notes}
                </ReactMarkdown>

              </article>
            )}

          </div>

        </section>

        {/* ================= FREE PLAN NOTICE ================= */}

        {!isPremium && (
          <section className="teacher-upgrade-card">

            <div className="upgrade-lock">
              <FaLock />
            </div>

            <div className="upgrade-content">

              <h3>
                Need more AI generations?
              </h3>

              <p>
                Teacher Premium gives you a higher
                generation allowance and more powerful
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

export default TeacherAINotes;