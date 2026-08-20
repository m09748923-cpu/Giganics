import "./TeacherClasswork.css";

import {
  FaArrowLeft,
  FaBookOpen,
  FaWandMagicSparkles,
  FaDownload,
  FaCrown,
  FaLock,
} from "react-icons/fa6";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GoogleGenAI } from "@google/genai";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const DAILY_LIMIT = 3;
const TEACHER_FREE_FILES_LIMIT = 10;
const TEACHER_FILES_KEY = "giganics_teacher_files";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function getFreeCount() {
  const today = getToday();

  const savedDate = localStorage.getItem(
    "teacherClassworkDate"
  );

  const savedCount = Number(
    localStorage.getItem(
      "teacherClassworkCount"
    ) || 0
  );

  if (savedDate !== today) {
    localStorage.setItem(
      "teacherClassworkDate",
      today
    );

    localStorage.setItem(
      "teacherClassworkCount",
      "0"
    );

    return 0;
  }

  return savedCount;
}

function TeacherClasswork() {
  const navigate = useNavigate();

  // ==========================================
  // FORM
  // ==========================================

  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("English");
  const [difficulty, setDifficulty] = useState("Medium");

  // ==========================================
  // RESULT
  // ==========================================

  const [classwork, setClasswork] = useState(null);
  const [generated, setGenerated] = useState(false);

  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // ==========================================
  // PLAN
  // ==========================================

  const [plan, setPlan] = useState("teacher_free");

  const [count, setCount] = useState(0);

  const isPremium =
    plan === "teacher_premium" ||
    plan === "teacher_pro";

  const limitReached =
    !isPremium && count >= DAILY_LIMIT;

  // ==========================================
  // LOAD PLAN
  // ==========================================

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
      setCount(0);
    } else {
      setPlan("teacher_free");
      setCount(getFreeCount());
    }
  }, []);

  // ==========================================
  // FREE DAILY COUNTER
  // ==========================================

  useEffect(() => {
    if (isPremium) {
      return;
    }

    setCount(getFreeCount());
  }, [isPremium]);

  // ==========================================
  // SAVE TO TEACHER FILES
  // ==========================================

  const saveToTeacherFiles = (data) => {
    try {
      const existing =
        JSON.parse(
          localStorage.getItem(
            TEACHER_FILES_KEY
          ) || "[]"
        );

      /*
       * Teacher Free:
       * Maximum 10 files.
       *
       * Teacher Premium:
       * Unlimited files.
       */

      if (
        !isPremium &&
        existing.length >=
          TEACHER_FREE_FILES_LIMIT
      ) {
        return false;
      }

      const markdownContent = `
# ${data.title}

**Subject:** ${subject}

**Class:** ${className}

**Topic:** ${topic}

**Language:** ${language}

**Difficulty:** ${difficulty}

---

## ${data.intro}

${data.activities
  .map(
    (activity) => `
### ${activity.title}

${activity.instruction}

${activity.items
  .map(
    (item, index) =>
      `${index + 1}. ${item}`
  )
  .join("\n")}

**Answer:**

____________________________________

____________________________________
`
  )
  .join("\n")}

---

## Today I Learned

${data.reflection}

____________________________________

____________________________________
`;

      const newFile = {
        id:
          "teacher-classwork-" +
          Date.now(),

        title:
          data.title ||
          `Classwork - ${topic}`,

        type: "Classwork",

        content:
          markdownContent.trim(),

        subject,
        className,
        topic,
        language,
        difficulty,

        date:
          new Date().toLocaleDateString(),

        createdAt:
          new Date().toISOString(),

        role: "teacher",

        plan: isPremium
          ? "teacher_premium"
          : "teacher_free",
      };

      const updatedFiles = [
        newFile,
        ...existing,
      ];

      localStorage.setItem(
        TEACHER_FILES_KEY,
        JSON.stringify(updatedFiles)
      );

      return true;

    } catch (error) {
      console.error(
        "Teacher My Files Save Error:",
        error
      );

      return false;
    }
  };

  // ==========================================
  // GENERATE CLASSWORK
  // ==========================================

  const handleGenerate = async () => {

    if (
      !subject ||
      !className ||
      !topic.trim()
    ) {
      alert(
        "Please select Subject, Class and enter Topic."
      );
      return;
    }

    // FREE LIMIT ONLY
    if (!isPremium && limitReached) {
      alert(
        "Teacher Free daily Classwork limit reached."
      );
      return;
    }

    if (
      !import.meta.env
        .VITE_GEMINI_API_KEY
    ) {
      alert(
        "Gemini API key is missing."
      );
      return;
    }

    try {

      setLoading(true);
      setGenerated(false);
      setClasswork(null);

      let difficultyInstruction = "";

      if (difficulty === "Easy") {
        difficultyInstruction = `
Make the work easy and suitable for basic classroom practice.
Use simple recall, identification, matching and short answers.
`;
      }

      if (difficulty === "Medium") {
        difficultyInstruction = `
Make the work moderately challenging.
Focus on understanding, explanation and basic application.
`;
      }

      if (difficulty === "Hard") {
        difficultyInstruction = `
Make the work challenging for the selected class.
Use application, reasoning, comparison and critical thinking.
Still keep it as classroom practice, NOT an exam.
`;
      }

      const premiumInstruction = isPremium
        ? `
PREMIUM TEACHER MODE:

Create a highly polished professional worksheet.
Use stronger conceptual variety.
Include better application and reasoning activities.
Avoid repetitive patterns.
Make the worksheet feel suitable for professional classroom use.
`
        : `
TEACHER FREE MODE:

Create a clean and useful classroom worksheet.
Keep activities simple and practical.
`;

      const prompt = `
You are an experienced Pakistani school teacher.

${premiumInstruction}

Create a CLASSWORK WORKSHEET.

This is NOT:
- a test
- an exam
- a quiz
- homework
- an answer key
- a marking scheme

The teacher will use this during a classroom lesson.

SUBJECT:
${subject}

CLASS:
${className}

TOPIC:
${topic}

LANGUAGE:
${language}

DIFFICULTY:
${difficulty}

${difficultyInstruction}

Create exactly 4 different classroom activities.

Examples:
- warm-up practice
- fill in the blanks
- matching/classification
- short written practice
- explain in your own words
- application activity
- thinking activity
- lesson recap

Rules:

1. Everything must be in ${language}.
2. Keep language appropriate for ${className}.
3. Keep items short.
4. Do not add long paragraphs.
5. Do not add marks.
6. Do not add total marks.
7. Do not add exam time.
8. Do not provide answers.
9. Do not call it a test.
10. Do not make it MCQ-heavy.
11. No emojis.
12. No markdown.
13. Maximum 3 items per activity.
14. Make it printable.
15. Return ONLY JSON.

JSON:

{
  "title": "short classwork title",
  "intro": "short classroom instruction",
  "activities": [
    {
      "title": "activity title",
      "instruction": "short instruction",
      "items": [
        "item",
        "item",
        "item"
      ]
    },
    {
      "title": "activity title",
      "instruction": "short instruction",
      "items": [
        "item",
        "item",
        "item"
      ]
    },
    {
      "title": "activity title",
      "instruction": "short instruction",
      "items": [
        "item",
        "item",
        "item"
      ]
    },
    {
      "title": "activity title",
      "instruction": "short instruction",
      "items": [
        "item",
        "item",
        "item"
      ]
    }
  ],
  "reflection": "short reflection prompt"
}
`;

      const response =
        await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

      let text =
        response.text?.trim();

      if (!text) {
        throw new Error(
          "Empty Gemini response"
        );
      }

      text = text
        .replace(
          /^```json\s*/i,
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

      const parsed =
        JSON.parse(text);

      if (
        !parsed.title ||
        !parsed.intro ||
        !Array.isArray(
          parsed.activities
        ) ||
        parsed.activities.length !== 4
      ) {
        throw new Error(
          "Invalid Gemini classwork format"
        );
      }

      setClasswork(parsed);
      setGenerated(true);

      // ======================================
      // SAVE TO MY FILES
      // ======================================

      const saved =
        saveToTeacherFiles(parsed);

      if (
        !saved &&
        !isPremium
      ) {
        console.warn(
          "Teacher Free My Files limit reached."
        );
      }

      // ======================================
      // INCREMENT FREE LIMIT
      // ======================================

      if (!isPremium) {

        const newCount =
          count + 1;

        localStorage.setItem(
          "teacherClassworkDate",
          getToday()
        );

        localStorage.setItem(
          "teacherClassworkCount",
          String(newCount)
        );

        setCount(newCount);
      }

    } catch (error) {

      console.error(
        "Classwork generation error:",
        error
      );

      alert(
        "Classwork generate nahi ho saka. Console check karo."
      );

    } finally {

      setLoading(false);

    }
  };

  // ==========================================
  // PDF DOWNLOAD
  // ==========================================

  const handleDownloadPDF = async () => {

    const paper =
      document.getElementById(
        "classwork-pdf-paper"
      );

    if (!paper) {
      alert(
        "Classwork preview not found."
      );
      return;
    }

    try {

      setDownloading(true);

      const canvas =
        await html2canvas(paper, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
        });

      const imgData =
        canvas.toDataURL(
          "image/png",
          1.0
        );

      const pdf =
        new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 7;

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

      if (
        imageHeight <=
        usableHeight + 1
      ) {

        pdf.addImage(
          imgData,
          "PNG",
          margin,
          margin,
          usableWidth,
          imageHeight
        );

      } else {

        let remaining =
          imageHeight;

        let offset = 0;

        while (
          remaining > 1
        ) {

          if (offset > 0) {
            pdf.addPage();
          }

          const currentHeight =
            Math.min(
              remaining,
              usableHeight
            );

          const sourceHeight =
            Math.ceil(
              (currentHeight /
                usableWidth) *
                canvas.width
            );

          const sourceY =
            Math.floor(
              (offset /
                usableWidth) *
                canvas.width
            );

          const pageCanvas =
            document.createElement(
              "canvas"
            );

          pageCanvas.width =
            canvas.width;

          pageCanvas.height =
            sourceHeight;

          const ctx =
            pageCanvas.getContext(
              "2d"
            );

          ctx.fillStyle =
            "#ffffff";

          ctx.fillRect(
            0,
            0,
            pageCanvas.width,
            pageCanvas.height
          );

          ctx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sourceHeight,
            0,
            0,
            canvas.width,
            sourceHeight
          );

          const pageImage =
            pageCanvas.toDataURL(
              "image/png",
              1.0
            );

          pdf.addImage(
            pageImage,
            "PNG",
            margin,
            margin,
            usableWidth,
            currentHeight
          );

          remaining -=
            currentHeight;

          offset +=
            currentHeight;
        }
      }

      const safeTopic =
        topic
          .trim()
          .replace(
            /[^a-zA-Z0-9]/g,
            "-"
          )
          .slice(
            0,
            45
          );

      pdf.save(
        `Giganics-Classwork-${safeTopic}.pdf`
      );

    } catch (error) {

      console.error(
        "PDF error:",
        error
      );

      alert(
        "PDF download failed."
      );

    } finally {

      setDownloading(false);

    }
  };

  // ==========================================
  // REMAINING
  // ==========================================

  const remaining =
    Math.max(
      0,
      DAILY_LIMIT - count
    );

  // ==========================================
  // BACK
  // ==========================================

  const handleBack = () => {

    if (isPremium) {
      navigate(
        "/teacher-premium-dashboard"
      );
    } else {
      navigate(
        "/teacher-dashboard"
      );
    }

  };

  // ==========================================
  // RETURN
  // ==========================================

  return (
    <div className="teacher-classwork-page">

      {/* HEADER */}

      <header className="classwork-header">

        <button
          className="back-btn"
          onClick={handleBack}
        >
          <FaArrowLeft />
          <span>Back</span>
        </button>

        <div className="classwork-title">

          <FaBookOpen />

          <div>

            <h1>
              Teacher Classwork
            </h1>

            <p>
              Create classroom worksheets in seconds
            </p>

          </div>

        </div>

        <div
          className={
            isPremium
              ? "teacher-premium-badge"
              : "teacher-free-badge"
          }
        >

          {isPremium && <FaCrown />}

          {isPremium
            ? "Teacher Premium"
            : "Teacher Free"}

        </div>

      </header>


      <main className="classwork-container">

        {/* GENERATOR */}

        <section className="classwork-generator">

          <div className="section-heading">

            <div>

              <h2>
                Create Classwork
              </h2>

              <p>
                Prepare printable classroom practice.
              </p>

            </div>

            <div
              className={
                limitReached
                  ? "daily-limit limit-reached"
                  : "daily-limit"
              }
            >

              {isPremium ? (
                <>
                  Premium:{" "}
                  <strong>
                    UNLIMITED
                  </strong>
                </>
              ) : (
                <>
                  Daily:{" "}
                  <strong>
                    {count}/{DAILY_LIMIT}
                  </strong>
                </>
              )}

            </div>

          </div>


          <div className="classwork-form">

            <div className="form-group">

              <label>
                Subject
              </label>

              <select
                value={subject}
                onChange={(e) =>
                  setSubject(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Subject
                </option>

                <option>
                  English
                </option>

                <option>
                  Urdu
                </option>

                <option>
                  Mathematics
                </option>

                <option>
                  Science
                </option>

                <option>
                  Computer
                </option>

                <option>
                  Islamiat
                </option>

                <option>
                  Pakistan Studies
                </option>

                <option>
                  Social Studies
                </option>

              </select>

            </div>


            <div className="form-group">

              <label>
                Class
              </label>

              <select
                value={className}
                onChange={(e) =>
                  setClassName(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select Class
                </option>

                {Array.from(
                  {
                    length: 12,
                  },
                  (_, index) => (
                    <option
                      key={
                        index + 1
                      }
                      value={`Class ${
                        index + 1
                      }`}
                    >
                      Class{" "}
                      {index + 1}
                    </option>
                  )
                )}

              </select>

            </div>


            <div className="form-group full-width">

              <label>
                Topic / Chapter
              </label>

              <input
                type="text"
                placeholder="e.g. Photosynthesis"
                value={topic}
                onChange={(e) =>
                  setTopic(
                    e.target.value
                  )
                }
              />

            </div>


            <div className="form-group">

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

                <option>
                  English
                </option>

                <option>
                  Urdu
                </option>

                <option>
                  Sindhi
                </option>

              </select>

            </div>


            <div className="form-group">

              <label>
                Difficulty
              </label>

              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(
                    e.target.value
                  )
                }
              >

                <option value="Easy">
                  Easy — Basic Practice
                </option>

                <option value="Medium">
                  Medium — Understanding
                </option>

                <option value="Hard">
                  Hard — Critical Thinking
                </option>

              </select>

            </div>

          </div>


          {/* LIMIT INFO */}

          <div className="classwork-plan-info">

            {isPremium ? (
              <>
                <FaCrown />

                <span>
                  Teacher Premium Classwork:
                  <strong>
                    Unlimited generations
                  </strong>
                </span>
              </>
            ) : (
              <>
                <FaLock />

                <span>
                  Teacher Free:
                  <strong>
                    {remaining} generations remaining today
                  </strong>
                </span>
              </>
            )}

          </div>


          <button
            className="generate-classwork-btn"
            onClick={
              handleGenerate
            }
            disabled={
              loading ||
              limitReached
            }
          >

            {loading ? (
              "Generating Classwork..."
            ) : limitReached ? (
              <>
                <FaLock />
                Daily Limit Reached
              </>
            ) : (
              <>
                <FaWandMagicSparkles />
                Generate Classwork
              </>
            )}

          </button>

        </section>


        {/* WORKSPACE */}

        <section className="classwork-workspace">

          <div className="workspace-header">

            <div>

              <h2>
                Classwork Preview
              </h2>

              <p>
                Printable classroom worksheet
              </p>

            </div>

            <button
              className="download-btn"
              onClick={
                handleDownloadPDF
              }
              disabled={
                !generated ||
                downloading
              }
            >

              <FaDownload />

              {downloading
                ? "Creating PDF..."
                : "Download PDF"}

            </button>

          </div>


          {!generated ? (

            <div className="empty-classwork">

              <FaBookOpen />

              <h3>
                No Classwork Yet
              </h3>

              <p>
                Select the subject,
                class and topic,
                then generate your
                classroom worksheet.
              </p>

            </div>

          ) : (

            <div
              id="classwork-pdf-paper"
              className="classwork-paper"
            >

              <div className="paper-header">

                <div className="paper-brand">
                  GIGANICS
                </div>

                <div className="paper-label">
                  CLASSWORK
                </div>

                <h1>
                  {classwork.title}
                </h1>

                <div className="paper-meta">

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


              <div className="student-info">

                <div>
                  Student Name:
                  <span className="student-line"></span>
                </div>

                <div>
                  Date:
                  <span className="date-line"></span>
                </div>

              </div>


              <div className="paper-intro">
                {classwork.intro}
              </div>


              <div className="activities-container">

                {classwork.activities.map(
                  (
                    activity,
                    index
                  ) => (

                    <div
                      className="worksheet-activity"
                      key={index}
                    >

                      <h2>
                        {activity.title}
                      </h2>

                      <p className="activity-instruction">
                        {
                          activity.instruction
                        }
                      </p>

                      {activity.items.map(
                        (
                          item,
                          itemIndex
                        ) => (

                          <div
                            className="worksheet-item"
                            key={
                              itemIndex
                            }
                          >

                            <div className="item-text">

                              {
                                itemIndex +
                                1
                              }
                              .{" "}
                              {item}

                            </div>

                            <div className="answer-lines">

                              <div></div>
                              <div></div>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  )
                )}

              </div>


              <div className="reflection-section">

                <h2>
                  Today I Learned
                </h2>

                <p>
                  {
                    classwork.reflection
                  }
                </p>

                <div></div>
                <div></div>

              </div>


              <div className="paper-footer">

                <span>
                  Giganics
                </span>

                <span>
                  {isPremium
                    ? "Teacher Premium"
                    : "Teacher Free"}
                </span>

              </div>


              {/* FREE WATERMARK ONLY */}

              {!isPremium && (
                <div className="paper-watermark">
                  GIGANICS
                </div>
              )}

            </div>

          )}

        </section>


        {/* FREE NOTE */}

        {!isPremium && (

          <div className="free-plan-note">

            <FaLock />

            <span>

              Teacher Free includes{" "}

              <strong>
                {DAILY_LIMIT} Classwork
                generations per day
              </strong>

              {" "}with a Giganics watermark.

            </span>

          </div>

        )}

      </main>

    </div>
  );
}

export default TeacherClasswork;