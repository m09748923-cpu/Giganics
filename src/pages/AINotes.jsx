import "./AINotes.css";
import {
  FaBookOpen,
  FaArrowLeft,
  FaDownload,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function AINotes() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [notesCount, setNotesCount] = useState(0);
  const [downloading, setDownloading] = useState(false);

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
  // DAILY AI NOTES COUNT
  // =========================

  useEffect(() => {
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const savedDate =
      localStorage.getItem(
        "aiNotesDate"
      );

    const savedCount =
      Number(
        localStorage.getItem(
          "aiNotesCount"
        )
      ) || 0;

    if (savedDate === today) {
      setNotesCount(savedCount);
    } else {
      localStorage.setItem(
        "aiNotesDate",
        today
      );

      localStorage.setItem(
        "aiNotesCount",
        "0"
      );

      setNotesCount(0);
    }
  }, []);

  // =========================
  // DOWNLOAD PDF
  // =========================

  const downloadPDF = async () => {
    const plan = getPlan();

    // =========================
    // PDF PLAN CHECK
    // =========================

    const pdfAllowedPlans = [
      "teacher_premium",
      "student_basic",
      "student_premium",
    ];

    if (!pdfAllowedPlans.includes(plan)) {
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

    if (!notes) {
      alert(
        "Please generate notes first."
      );

      return;
    }

    const originalElement =
      document.getElementById(
        "notes-pdf-content"
      );

    if (!originalElement) {
      alert(
        "Notes content could not be found."
      );

      return;
    }

    let pdfElement = null;

    try {
      setDownloading(true);

      const isUrdu =
        /[\u0600-\u06FF]/.test(notes);

      pdfElement =
        originalElement.cloneNode(true);

      pdfElement.id =
        "giganics-pdf-render";

      pdfElement.style.position =
        "fixed";

      pdfElement.style.left = "0";
      pdfElement.style.top = "0";

      pdfElement.style.width =
        "794px";

      pdfElement.style.maxWidth =
        "794px";

      pdfElement.style.minHeight =
        "100px";

      pdfElement.style.padding =
        "45px";

      pdfElement.style.margin =
        "0";

      pdfElement.style.boxSizing =
        "border-box";

      pdfElement.style.background =
        "#ffffff";

      pdfElement.style.color =
        "#111111";

      pdfElement.style.opacity =
        "1";

      pdfElement.style.visibility =
        "visible";

      pdfElement.style.pointerEvents =
        "none";

      pdfElement.style.zIndex =
        "-9999";

      pdfElement.style.direction =
        isUrdu ? "rtl" : "ltr";

      pdfElement.style.textAlign =
        isUrdu ? "right" : "left";

      pdfElement.style.unicodeBidi =
        "plaintext";

      pdfElement.style.fontSize =
        "18px";

      pdfElement.style.lineHeight =
        "1.8";

      const allElements =
        pdfElement.querySelectorAll("*");

      allElements.forEach((el) => {
        el.style.color =
          "#111111";

        el.style.backgroundColor =
          "transparent";

        el.style.borderColor =
          "#cccccc";

        el.style.direction =
          isUrdu ? "rtl" : "ltr";

        el.style.unicodeBidi =
          "plaintext";

        el.style.textAlign =
          isUrdu ? "right" : "left";
      });

      pdfElement
        .querySelectorAll(
          "h1, h2, h3, h4, h5, h6"
        )
        .forEach((heading) => {
          heading.style.color =
            "#111111";

          heading.style.fontWeight =
            "700";

          heading.style.lineHeight =
            "1.5";

          heading.style.marginTop =
            "24px";

          heading.style.marginBottom =
            "12px";

          heading.style.direction =
            isUrdu ? "rtl" : "ltr";

          heading.style.textAlign =
            isUrdu ? "right" : "left";
        });

      pdfElement
        .querySelectorAll("p")
        .forEach((p) => {
          p.style.color =
            "#222222";

          p.style.margin =
            "12px 0";

          p.style.lineHeight =
            "1.9";

          p.style.direction =
            isUrdu ? "rtl" : "ltr";

          p.style.textAlign =
            isUrdu ? "right" : "left";
        });

      pdfElement
        .querySelectorAll("ul, ol")
        .forEach((list) => {
          list.style.color =
            "#222222";

          list.style.lineHeight =
            "1.9";

          list.style.direction =
            isUrdu ? "rtl" : "ltr";

          list.style.textAlign =
            isUrdu ? "right" : "left";

          list.style.paddingRight =
            isUrdu ? "30px" : "0";

          list.style.paddingLeft =
            isUrdu ? "0" : "30px";
        });

      pdfElement
        .querySelectorAll("li")
        .forEach((li) => {
          li.style.color =
            "#222222";

          li.style.marginBottom =
            "8px";

          li.style.direction =
            isUrdu ? "rtl" : "ltr";

          li.style.textAlign =
            isUrdu ? "right" : "left";
        });

      pdfElement
        .querySelectorAll("strong")
        .forEach((strong) => {
          strong.style.color =
            "#111111";

          strong.style.fontWeight =
            "700";
        });

      pdfElement
        .querySelectorAll("hr")
        .forEach((hr) => {
          hr.style.border =
            "none";

          hr.style.borderTop =
            "1px solid #cccccc";

          hr.style.margin =
            "25px 0";
        });

      document.body.appendChild(
        pdfElement
      );

      if (document.fonts) {
        await document.fonts.ready;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      const canvas =
        await html2canvas(
          pdfElement,
          {
            scale: 2,
            useCORS: true,
            backgroundColor:
              "#ffffff",
            logging: false,
            allowTaint: false,
            imageTimeout: 0,
            scrollX: 0,
            scrollY: 0,
            width:
              pdfElement.scrollWidth,
            height:
              pdfElement.scrollHeight,
            windowWidth:
              pdfElement.scrollWidth,
            windowHeight:
              pdfElement.scrollHeight,
          }
        );

      if (pdfElement) {
        document.body.removeChild(
          pdfElement
        );

        pdfElement = null;
      }

      if (
        !canvas ||
        canvas.width === 0 ||
        canvas.height === 0
      ) {
        throw new Error(
          "PDF canvas is empty."
        );
      }

      const imgData =
        canvas.toDataURL(
          "image/png",
          1.0
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

      const printableWidth =
        pageWidth -
        margin * 2;

      const printableHeight =
        pageHeight -
        margin * 2;

      const imageHeight =
        (canvas.height *
          printableWidth) /
        canvas.width;

      let heightLeft =
        imageHeight;

      let position =
        margin;

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position,
        printableWidth,
        imageHeight,
        undefined,
        "FAST"
      );

      heightLeft -=
        printableHeight;

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
          printableWidth,
          imageHeight,
          undefined,
          "FAST"
        );

        heightLeft -=
          printableHeight;
      }

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
        "AI-Notes";

      pdf.save(
        `${safeFileName}-Notes.pdf`
      );

    } catch (error) {
      console.error(
        "PDF download error:",
        error
      );

      if (pdfElement) {
        pdfElement.remove();
      }

      const temporaryElement =
        document.getElementById(
          "giganics-pdf-render"
        );

      if (temporaryElement) {
        temporaryElement.remove();
      }

      alert(
        "Failed to create PDF. Please try again."
      );

    } finally {
      setDownloading(false);
    }
  };

  // =========================
  // GENERATE NOTES
  // =========================

  const generateNotes = async () => {
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const savedDate =
      localStorage.getItem(
        "aiNotesDate"
      );

    let currentCount =
      Number(
        localStorage.getItem(
          "aiNotesCount"
        )
      ) || 0;

    // =========================
    // RESET DAILY COUNT
    // =========================

    if (savedDate !== today) {
      localStorage.setItem(
        "aiNotesDate",
        today
      );

      localStorage.setItem(
        "aiNotesCount",
        "0"
      );

      currentCount = 0;

      setNotesCount(0);
    }

    // =========================
    // GET PLAN
    // =========================

    const plan = getPlan();

    // =========================
    // DAILY LIMIT
    // =========================

    let dailyLimit = Infinity;
    let planName = "Premium";

    if (plan === "teacher_free") {
      dailyLimit = 5;
      planName = "Teacher Free";
    }

    if (plan === "student_free") {
      dailyLimit = 10;
      planName = "Student Free";
    }

    // =========================
    // CHECK DAILY LIMIT
    // =========================

    if (
      currentCount >= dailyLimit
    ) {
      alert(
        `You have reached your ${planName} limit of ${dailyLimit} AI Notes per day.`
      );

      return;
    }

    // =========================
    // CHECK TOPIC
    // =========================

    if (!topic.trim()) {
      alert(
        "Please enter a topic first."
      );

      return;
    }

    try {
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
You are the AI Notes Generator inside Giganics.

IMPORTANT RULES:
- Never say that you are Gemini.
- Never introduce yourself as Gemini.
- Never say "My name is Gemini".
- Never mention Google, Gemini, Bard, or the Gemini API.
- Do not introduce yourself.
- Start directly with the study notes.
- Create simple and easy-to-understand study notes.
- Use clean Markdown formatting.
- Use proper headings, bold text, bullet points, numbered lists, and short paragraphs when appropriate.
- If the user asks for Urdu, write the notes in Urdu.
- If the user asks for English, write the notes in English.
- Preserve the requested language throughout the notes.

Create study notes about this topic:

${topic}
            `,
          }
        );

      const generatedNotes =
        response.text ||
        "No notes were generated.";

      setNotes(
        generatedNotes
      );

      // =========================
      // UPDATE DAILY COUNT
      // =========================

      const newCount =
        currentCount + 1;

      localStorage.setItem(
        "aiNotesCount",
        newCount.toString()
      );

      localStorage.setItem(
        "aiNotesDate",
        today
      );

      setNotesCount(
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
      // FILE LIMITS
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
          `Your ${storagePlanName} plan has reached its maximum limit of ${maxFiles} files.`
        );
      } else {
        const newFile = {
          id: Date.now(),

          title:
            `${topic} Notes`,

          type:
            "AI Notes",

          date:
            "Today",

          content:
            generatedNotes,
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
        "AI Notes Error:",
        error
      );

      alert(
        "Failed to generate notes."
      );
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
    <div className="ai-notes-page">

      {/* =========================
          BACK BUTTON
      ========================= */}

      <button
        className="ai-notes-back"
        onClick={handleBack}
      >
        <FaArrowLeft />
        Back to Dashboard
      </button>

      {/* =========================
          HEADER
      ========================= */}

      <div className="ai-notes-header">

        <FaBookOpen />

        <div>
          <h1>
            AI Notes
          </h1>

          <p>
            Create smart notes with
            Giganics AI.
          </p>
        </div>

      </div>

      {/* =========================
          NOTES CARD
      ========================= */}

      <div className="ai-notes-card">

        <label>
          Enter your topic
        </label>

        <textarea
          placeholder="Example: Photosynthesis"
          value={topic}
          onChange={(e) =>
            setTopic(
              e.target.value
            )
          }
        />

        <button
          className="generate-notes-btn"
          onClick={
            generateNotes
          }
        >
          Generate Notes
        </button>

        {/* =========================
            GENERATED NOTES
        ========================= */}

        {notes && (
          <>
            <div
              id="notes-pdf-content"
              className="generated-notes"
              dir="auto"
              style={{
                direction:
                  /[\u0600-\u06FF]/.test(
                    notes
                  )
                    ? "rtl"
                    : "ltr",

                textAlign:
                  /[\u0600-\u06FF]/.test(
                    notes
                  )
                    ? "right"
                    : "left",

                unicodeBidi:
                  "plaintext",
              }}
            >

              <h2>
                Generated Notes
              </h2>

              <ReactMarkdown>
                {notes}
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
              disabled={
                downloading
              }
            >
              <FaDownload />

              {downloading
                ? "Creating PDF..."
                : "Download PDF"}
            </button>

          </>
        )}

      </div>

    </div>
  );
}

export default AINotes;