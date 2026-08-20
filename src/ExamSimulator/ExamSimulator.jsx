import "./ExamSimulator.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GoogleGenAI } from "@google/genai";

import {
  FaArrowLeft,
  FaClipboardCheck,
  FaBook,
  FaClock,
  FaLayerGroup,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaSignal,
} from "react-icons/fa";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

function ExamSimulator() {
  const navigate = useNavigate();

  // =========================
  // EXAM SETUP
  // =========================

  const [subject, setSubject] = useState("Mathematics");
  const [questionCount, setQuestionCount] = useState("10");
  const [timeLimit, setTimeLimit] = useState("15");
  const [difficulty, setDifficulty] = useState("Medium");

  // =========================
  // EXAM STATE
  // =========================

  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [writtenQuestions, setWrittenQuestions] = useState([]);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [writtenAnswers, setWrittenAnswers] = useState({});

  // =========================
  // LOADING / ERROR
  // =========================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // TIMER
  // =========================

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // =========================
  // DYNAMIC QUESTION COUNTS
  // =========================

  const totalQuestions = Number(questionCount);

  const writtenCount = Math.round(totalQuestions * 0.3);

  const mcqCount = totalQuestions - writtenCount;

  // =========================
  // REAL COUNTDOWN TIMER
  // =========================

  useEffect(() => {
    if (!examStarted || examFinished) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(timer);

          setExamFinished(true);

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [examStarted, examFinished]);

  // =========================
  // FORMAT TIMER
  // =========================

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);

    const secs = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  // =========================
  // DIFFICULTY INSTRUCTION
  // =========================

  const getDifficultyInstruction = () => {
    if (difficulty === "Easy") {
      return `
ALL questions must be EASY.

Use:
- basic concepts
- simple calculations
- straightforward application
- beginner-friendly reasoning
`;
    }

    if (difficulty === "Medium") {
      return `
ALL questions must be MEDIUM difficulty.

Use:
- concept understanding
- application
- moderate reasoning
- some calculation or analysis
`;
    }

    if (difficulty === "Hard") {
      return `
ALL questions must be HARD.

Use:
- deep understanding
- multi-step reasoning
- challenging application
- analysis
- difficult calculations where appropriate
`;
    }

    return `
Use MIXED difficulty.

Approximately:
30% Easy
40% Medium
30% Hard

Make the difficulty genuinely different between questions.
`;
  };

  // =========================
  // START / GENERATE EXAM
  // =========================

  const startExam = async () => {
    setLoading(true);

    setError("");

    try {
      const total = Number(questionCount);

      // =========================
      // DYNAMIC SPLIT
      // =========================

      const dynamicWrittenCount = Math.round(total * 0.3);

      const dynamicMcqCount =
        total - dynamicWrittenCount;

      // =========================
      // DIFFICULTY
      // =========================

      const difficultyInstruction =
        getDifficultyInstruction();

      // =========================
      // AI PROMPT
      // =========================

      const prompt = `
You are an expert school examination paper generator.

Create a REALISTIC ${subject} examination.

=========================
EXAM SETTINGS
=========================

Subject:
${subject}

Total Questions:
${total}

MCQ Questions:
${dynamicMcqCount}

Written Questions:
${dynamicWrittenCount}

Difficulty:
${difficulty}

${difficultyInstruction}

=========================
MCQ REQUIREMENTS
=========================

Generate EXACTLY ${dynamicMcqCount} MCQ questions.

Every MCQ must:

1. Be a real educational question.
2. Test actual understanding.
3. Be related to ${subject}.
4. Have exactly 4 options.
5. Have only ONE correct answer.
6. Have realistic distractors.
7. Avoid silly or obviously wrong options.
8. Avoid duplicate questions.
9. Match the requested difficulty.
10. Include a short explanation.

Do NOT generate placeholder questions.

Do NOT use:
"Question 1..."
"Question 2..."
without meaningful content.

=========================
WRITTEN REQUIREMENTS
=========================

Generate EXACTLY ${dynamicWrittenCount} written questions.

Every written question must:

1. Be a real exam-style question.
2. Require the student to write an answer.
3. Test understanding, explanation, solving,
   reasoning, comparison or application.
4. Match the requested difficulty.
5. Be different from the MCQs.
6. Include an expected answer.
7. Include important marking points.

Do NOT provide multiple-choice options
for written questions.

=========================
REAL EXAM QUALITY
=========================

The exam should feel like a proper school examination.

Questions should not all be extremely easy.

Use different question styles where appropriate:

- conceptual questions
- application questions
- calculation questions
- reasoning questions
- scenario-based questions
- explanation questions

Do not repeat the same idea again and again.

=========================
JSON FORMAT
=========================

Return ONLY valid JSON.

Use EXACTLY this structure:

{
  "mcqs": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 0,
      "explanation": "Short explanation"
    }
  ],
  "writtenQuestions": [
    {
      "question": "Written question text",
      "expectedAnswer": "Expected answer",
      "markingPoints": [
        "Important marking point 1",
        "Important marking point 2"
      ]
    }
  ]
}

IMPORTANT:

correctAnswer MUST be:

0
1
2
or
3

Do not return letters such as A, B, C or D.

Do not use Markdown.

Do not add anything outside the JSON.

Return ONLY JSON.
`;

      // =========================
      // AI REQUEST
      // =========================

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      let text = response.text.trim();

      // =========================
      // CLEAN JSON
      // =========================

      text = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      const generatedExam = JSON.parse(text);

      // =========================
      // VALIDATION
      // =========================

      if (!generatedExam.mcqs) {
        throw new Error("MCQs missing.");
      }

      if (!generatedExam.writtenQuestions) {
        throw new Error("Written questions missing.");
      }

      if (
        generatedExam.mcqs.length !==
        dynamicMcqCount
      ) {
        throw new Error(
          `AI generated ${generatedExam.mcqs.length} MCQs instead of ${dynamicMcqCount}.`
        );
      }

      if (
        generatedExam.writtenQuestions.length !==
        dynamicWrittenCount
      ) {
        throw new Error(
          `AI generated ${generatedExam.writtenQuestions.length} written questions instead of ${dynamicWrittenCount}.`
        );
      }

      // =========================
      // SAVE EXAM
      // =========================

      setQuestions(generatedExam.mcqs);

      setWrittenQuestions(
        generatedExam.writtenQuestions
      );

      setCurrentQuestion(0);

      setSelectedAnswers({});

      setWrittenAnswers({});

      setExamFinished(false);

      // =========================
      // START REAL TIMER
      // =========================

      setRemainingSeconds(
        Number(timeLimit) * 60
      );

      setExamStarted(true);

    } catch (err) {
      console.error(
        "Exam generation error:",
        err
      );

      setError(
        "Exam generate nahi ho saka. Please dobara try karein."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SELECT MCQ ANSWER
  // =========================

  const selectAnswer = (index) => {
    setSelectedAnswers((previous) => ({
      ...previous,

      [currentQuestion]: index,
    }));
  };

  // =========================
  // WRITTEN ANSWER
  // =========================

  const handleWrittenAnswer = (
    index,
    value
  ) => {
    setWrittenAnswers((previous) => ({
      ...previous,

      [index]: value,
    }));
  };

  // =========================
  // SUBMIT EXAM
  // =========================

  const submitExam = () => {
    setExamFinished(true);
  };

  // =========================
  // CALCULATE MCQ SCORE
  // =========================

  const calculateScore = () => {
    let score = 0;

    questions.forEach(
      (question, index) => {
        if (
          selectedAnswers[index] ===
          question.correctAnswer
        ) {
          score++;
        }
      }
    );

    return score;
  };

  // =========================
  // RESET EXAM
  // =========================

  const takeAnotherExam = () => {
    setExamStarted(false);

    setExamFinished(false);

    setQuestions([]);

    setWrittenQuestions([]);

    setSelectedAnswers({});

    setWrittenAnswers({});

    setCurrentQuestion(0);

    setRemainingSeconds(0);

    setError("");
  };

  // =========================
  // RESULT SCREEN
  // =========================

  if (examFinished) {
    const score = calculateScore();

    const percentage =
      questions.length > 0
        ? Math.round(
            (score / questions.length) * 100
          )
        : 0;

    const timeExpired =
      remainingSeconds === 0;

    return (
      <div className="exam-simulator-page">

        {/* =========================
            TOP BAR
        ========================= */}

        <div className="exam-simulator-topbar">

          <button
            className="exam-back-btn"
            onClick={() =>
              navigate(
                "/student-premium-dashboard"
              )
            }
          >
            <FaArrowLeft />

            Back
          </button>


          <div className="exam-title">

            <FaClipboardCheck />

            <div>

              <h1>Exam Result</h1>

              <p>
                Your AI Exam Simulator
                performance
              </p>

            </div>

          </div>

        </div>


        {/* =========================
            RESULT
        ========================= */}

        <section className="exam-setup">

          <div className="exam-section-title">

            <span className="exam-premium-label">
              EXAM COMPLETED
            </span>

            <h2>
              {subject} Exam Result
            </h2>

            <p>
              Difficulty: {difficulty}
            </p>

            {timeExpired && (
              <p
                style={{
                  color: "#ef4444",
                  marginTop: "8px",
                }}
              >
                Time finished — exam
                submitted automatically.
              </p>
            )}

          </div>


          {/* SCORE CARD */}

          <div className="exam-question-card">

            <h2>
              Your Score
            </h2>


            <div
              style={{
                fontSize: "48px",
                fontWeight: "700",
                color: "#f5c542",
                marginTop: "15px",
                marginBottom: "5px",
              }}
            >
              {score}/{questions.length}
            </div>


            <p>
              {percentage}% MCQ Score
            </p>


            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                borderRadius: "12px",
                background: "#0d1729",
                border:
                  "1px solid #263754",
              }}
            >

              <p>
                <strong>
                  MCQs:
                </strong>{" "}
                {questions.length}
              </p>

              <p
                style={{
                  marginTop: "8px",
                }}
              >
                <strong>
                  Written:
                </strong>{" "}
                {writtenQuestions.length}
              </p>

              <p
                style={{
                  marginTop: "8px",
                }}
              >
                <strong>
                  Difficulty:
                </strong>{" "}
                {difficulty}
              </p>

            </div>

          </div>


          {/* =========================
              MCQ RESULTS
          ========================= */}

          <div
            className="exam-section-title"
            style={{
              marginTop: "35px",
            }}
          >

            <h2>
              MCQ Review
            </h2>

            <p>
              Review your answers.
            </p>

          </div>


          <div className="exam-answer-list">

            {questions.map(
              (question, index) => {

                const correct =
                  selectedAnswers[index] ===
                  question.correctAnswer;

                return (
                  <div
                    key={index}
                    style={{
                      background:
                        "#0d1729",
                      border:
                        "1px solid #263754",
                      borderRadius:
                        "14px",
                      padding: "18px",
                    }}
                  >

                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: "10px",
                        marginBottom:
                          "10px",
                      }}
                    >

                      {correct ? (
                        <FaCheckCircle
                          style={{
                            color:
                              "#22c55e",
                          }}
                        />
                      ) : (
                        <FaTimesCircle
                          style={{
                            color:
                              "#ef4444",
                          }}
                        />
                      )}

                      <strong>
                        MCQ {index + 1}
                      </strong>

                    </div>


                    <p>
                      {question.question}
                    </p>


                    <p
                      style={{
                        marginTop:
                          "10px",
                        color:
                          "#f5c542",
                      }}
                    >
                      Correct Answer:{" "}

                      {
                        question.options[
                          question
                            .correctAnswer
                        ]
                      }

                    </p>


                    {!correct &&
                      selectedAnswers[
                        index
                      ] !== undefined && (
                        <p
                          style={{
                            marginTop:
                              "8px",
                            color:
                              "#ef4444",
                          }}
                        >
                          Your Answer:{" "}

                          {
                            question
                              .options[
                              selectedAnswers[
                                index
                              ]
                            ]
                          }

                        </p>
                      )}


                    <p
                      style={{
                        marginTop:
                          "8px",
                        color:
                          "#94a3b8",
                      }}
                    >
                      {
                        question.explanation
                      }
                    </p>

                  </div>
                );
              }
            )}

          </div>


          {/* =========================
              WRITTEN REVIEW
          ========================= */}

          <div
            className="exam-section-title"
            style={{
              marginTop: "35px",
            }}
          >

            <h2>
              Written Questions
            </h2>

            <p>
              Your written answers.
            </p>

          </div>


          <div className="exam-answer-list">

            {writtenQuestions.map(
              (question, index) => (

                <div
                  key={index}
                  style={{
                    background:
                      "#0d1729",
                    border:
                      "1px solid #263754",
                    borderRadius:
                      "14px",
                    padding: "18px",
                  }}
                >

                  <strong
                    style={{
                      color:
                        "#f5c542",
                    }}
                  >
                    Written Question{" "}
                    {index + 1}
                  </strong>


                  <p
                    style={{
                      marginTop:
                        "12px",
                    }}
                  >
                    {question.question}
                  </p>


                  <p
                    style={{
                      marginTop:
                        "15px",
                      color:
                        "#94a3b8",
                    }}
                  >
                    Your Answer:
                  </p>


                  <p
                    style={{
                      marginTop:
                        "7px",
                      whiteSpace:
                        "pre-wrap",
                    }}
                  >
                    {writtenAnswers[
                      index
                    ] ||
                      "Not answered"}
                  </p>

                </div>

              )
            )}

          </div>


          {/* =========================
              TAKE ANOTHER EXAM
          ========================= */}

          <button
            className="start-exam-btn"
            style={{
              marginTop: "30px",
            }}
            onClick={
              takeAnotherExam
            }
          >

            <FaClipboardCheck />

            Take Another Exam

          </button>

        </section>

      </div>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================

  return (
    <div className="exam-simulator-page">

      {/* =========================
          TOP BAR
      ========================= */}

      <div className="exam-simulator-topbar">

        <button
          className="exam-back-btn"
          onClick={() =>
            navigate(
              "/student-premium-dashboard"
            )
          }
        >
          <FaArrowLeft />

          Back
        </button>


        <div className="exam-title">

          <FaClipboardCheck />

          <div>

            <h1>
              AI Exam Simulator
            </h1>

            <p>
              Prepare like it's the
              real exam.
            </p>

          </div>

        </div>

      </div>


      {/* =========================
          SETUP SCREEN
      ========================= */}

      {!examStarted ? (

        <>

          {/* HERO */}

          <section className="exam-hero">

            <div className="exam-hero-content">

              <span className="exam-premium-label">
                PREMIUM FEATURE
              </span>


              <h2>
                Test Your Knowledge
                <br />
                Like a Real Exam
              </h2>


              <p>
                AI-generated MCQs and
                written questions for a
                realistic exam experience.
              </p>

            </div>


            <div className="exam-hero-icon">

              <FaClipboardCheck />

            </div>

          </section>


          {/* SETUP */}

          <section className="exam-setup">

            <div className="exam-section-title">

              <h2>
                Start Your Exam
              </h2>

              <p>
                Customize your
                AI-generated exam.
              </p>

            </div>


            {/* OPTIONS */}

            <div className="exam-option-grid">

              {/* SUBJECT */}

              <div className="exam-option-card">

                <div className="exam-option-icon">

                  <FaBook />

                </div>


                <div>

                  <h3>
                    Subject
                  </h3>


                  <select
                    value={subject}
                    onChange={(e) =>
                      setSubject(
                        e.target.value
                      )
                    }
                  >

                    <option>
                      Mathematics
                    </option>

                    <option>
                      Physics
                    </option>

                    <option>
                      Chemistry
                    </option>

                    <option>
                      Biology
                    </option>

                    <option>
                      Computer Science
                    </option>

                    <option>
                      English
                    </option>

                  </select>

                </div>

              </div>


              {/* QUESTIONS */}

              <div className="exam-option-card">

                <div className="exam-option-icon">

                  <FaLayerGroup />

                </div>


                <div>

                  <h3>
                    Total Questions
                  </h3>


                  <select
                    value={questionCount}
                    onChange={(e) =>
                      setQuestionCount(
                        e.target.value
                      )
                    }
                  >

                    <option value="10">
                      10 Questions
                    </option>

                    <option value="20">
                      20 Questions
                    </option>

                    <option value="30">
                      30 Questions
                    </option>

                    <option value="50">
                      50 Questions
                    </option>

                  </select>

                </div>

              </div>


              {/* TIME */}

              <div className="exam-option-card">

                <div className="exam-option-icon">

                  <FaClock />

                </div>


                <div>

                  <h3>
                    Time Limit
                  </h3>


                  <select
                    value={timeLimit}
                    onChange={(e) =>
                      setTimeLimit(
                        e.target.value
                      )
                    }
                  >

                    <option value="15">
                      15 Minutes
                    </option>

                    <option value="30">
                      30 Minutes
                    </option>

                    <option value="45">
                      45 Minutes
                    </option>

                    <option value="60">
                      60 Minutes
                    </option>

                    <option value="90">
                      90 Minutes
                    </option>

                  </select>

                </div>

              </div>


              {/* DIFFICULTY */}

              <div className="exam-option-card">

                <div className="exam-option-icon">

                  <FaSignal />

                </div>


                <div>

                  <h3>
                    Difficulty
                  </h3>


                  <select
                    value={difficulty}
                    onChange={(e) =>
                      setDifficulty(
                        e.target.value
                      )
                    }
                  >

                    <option value="Easy">
                      Easy
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Hard">
                      Hard
                    </option>

                    <option value="Mixed">
                      Mixed
                    </option>

                  </select>

                </div>

              </div>

            </div>


            {/* QUESTION BREAKDOWN */}

            <div
              style={{
                marginTop: "22px",
                padding: "16px 20px",
                background:
                  "#0d1729",
                border:
                  "1px solid #263754",
                borderRadius: "14px",
                textAlign: "center",
                color: "#94a3b8",
              }}
            >

              <strong
                style={{
                  color: "#f5c542",
                }}
              >
                Exam Structure
              </strong>

              <p
                style={{
                  marginTop: "8px",
                }}
              >
                {mcqCount} MCQs +{" "}
                {writtenCount} Written
                Questions
              </p>

            </div>


            {/* ERROR */}

            {error && (

              <p
                style={{
                  color:
                    "#ef4444",
                  marginTop:
                    "18px",
                  textAlign:
                    "center",
                }}
              >
                {error}
              </p>

            )}


            {/* START BUTTON */}

            <button
              className="start-exam-btn"
              onClick={
                startExam
              }
              disabled={
                loading
              }
            >

              {loading ? (

                <>

                  <FaSpinner
                    className="exam-spinner"
                  />

                  Generating AI
                  Exam...

                </>

              ) : (

                <>

                  <FaClipboardCheck />

                  Generate &
                  Start Exam

                </>

              )}

            </button>

          </section>

        </>

      ) : (

        /* =========================
           REAL EXAM
        ========================= */

        <section className="exam-setup">

          {/* TIMER */}

          <div
            style={{
              position:
                "sticky",
              top: "15px",
              zIndex: 20,
              display:
                "flex",
              justifyContent:
                "flex-end",
              marginBottom:
                "20px",
            }}
          >

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: "10px",
                padding:
                  "12px 20px",
                borderRadius:
                  "14px",

                background:
                  remainingSeconds <=
                  60
                    ? "#3a1717"
                    : "#0d1729",

                border:
                  remainingSeconds <=
                  60
                    ? "1px solid #ef4444"
                    : "1px solid #263754",

                color:
                  remainingSeconds <=
                  60
                    ? "#ef4444"
                    : "#f5c542",

                fontSize:
                  "18px",

                fontWeight:
                  "700",

                boxShadow:
                  "0 8px 25px rgba(0,0,0,.25)",
              }}
            >

              <FaClock />

              {formatTime(
                remainingSeconds
              )}

            </div>

          </div>


          {/* =========================
              MCQ SECTION
          ========================= */}

          {currentQuestion <
          questions.length ? (

            <>

              <div className="exam-section-title">

                <span className="exam-premium-label">
                  SECTION A — MCQs
                </span>


                <h2>
                  Question{" "}
                  {currentQuestion +
                    1}{" "}
                  of{" "}
                  {questions.length}
                </h2>


                <p>
                  Difficulty:{" "}
                  {difficulty}
                </p>

              </div>


              <div className="exam-question-card">

                <h2>
                  Question{" "}
                  {currentQuestion +
                    1}
                </h2>


                <p>
                  {
                    questions[
                      currentQuestion
                    ].question
                  }
                </p>


                <div className="exam-answer-list">

                  {
                    questions[
                      currentQuestion
                    ].options.map(
                      (
                        option,
                        index
                      ) => (

                        <button
                          key={
                            index
                          }

                          className={
                            selectedAnswers[
                              currentQuestion
                            ] ===
                            index
                              ? "selected-answer"
                              : ""
                          }

                          onClick={() =>
                            selectAnswer(
                              index
                            )
                          }
                        >

                          {
                            String.fromCharCode(
                              65 +
                                index
                            )
                          }

                          .{" "}

                          {
                            option
                          }

                        </button>

                      )
                    )
                  }

                </div>


                <button
                  className="start-exam-btn"
                  style={{
                    marginTop:
                      "25px",
                  }}

                  disabled={
                    selectedAnswers[
                      currentQuestion
                    ] ===
                    undefined
                  }

                  onClick={() => {

                    if (
                      currentQuestion <
                      questions.length -
                        1
                    ) {

                      setCurrentQuestion(
                        currentQuestion +
                          1
                      );

                    } else {

                      setCurrentQuestion(
                        questions.length
                      );

                    }

                  }}
                >

                  Next Question

                </button>

              </div>

            </>

          ) : (

            /* =========================
               WRITTEN SECTION
            ========================= */

            <>

              <div className="exam-section-title">

                <span className="exam-premium-label">
                  SECTION B — WRITTEN
                </span>


                <h2>
                  Written Questions
                </h2>


                <p>
                  Answer the following
                  questions in your
                  own words.
                </p>

              </div>


              {writtenQuestions.map(
                (
                  question,
                  index
                ) => (

                  <div
                    className="exam-question-card"
                    key={
                      index
                    }
                  >

                    <h2>
                      Written
                      Question{" "}
                      {index +
                        1}
                    </h2>


                    <p>
                      {
                        question.question
                      }
                    </p>


                    <textarea
                      value={
                        writtenAnswers[
                          index
                        ] ||
                        ""
                      }

                      onChange={(
                        e
                      ) =>
                        handleWrittenAnswer(
                          index,
                          e.target
                            .value
                        )
                      }

                      placeholder="Write your answer here..."

                      rows="7"

                      style={{
                        width:
                          "100%",

                        marginTop:
                          "20px",

                        padding:
                          "16px",

                        borderRadius:
                          "12px",

                        border:
                          "1px solid #263754",

                        background:
                          "#0d1729",

                        color:
                          "#fff",

                        fontSize:
                          "15px",

                        resize:
                          "vertical",

                        outline:
                          "none",

                        fontFamily:
                          "Arial, sans-serif",
                      }}
                    />

                  </div>

                )
              )}


              <button
                className="start-exam-btn"
                onClick={
                  submitExam
                }
              >

                <FaCheckCircle />

                Submit Exam

              </button>

            </>

          )}

        </section>

      )}

    </div>
  );
}

export default ExamSimulator;