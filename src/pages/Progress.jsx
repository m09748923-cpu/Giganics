import "./Progress.css";
import { FaArrowLeft, FaChartLine } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Progress() {
  const navigate = useNavigate();

  const currentPlan =
    localStorage.getItem("plan") || "student_free";

  const [aiNotesCount, setAiNotesCount] = useState(0);
  const [mcqsCount, setMcqsCount] = useState(0);
  const [homeworkCount, setHomeworkCount] = useState(0);
  const [revisionCount, setRevisionCount] = useState(0);

  useEffect(() => {
    const count =
      Number(localStorage.getItem("aiNotesCount")) || 0;

    setAiNotesCount(count);

    const mcqCount =
      Number(localStorage.getItem("mcqsCount")) || 0;

    setMcqsCount(mcqCount);

    const homeworkCount =
      Number(localStorage.getItem("homeworkCount")) || 0;

    setHomeworkCount(homeworkCount);

    const revisionCount =
      Number(localStorage.getItem("revisionCount")) || 0;

    setRevisionCount(revisionCount);
  }, []);

  return (
    <div className="progress-page">

      <button
        className="progress-back"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft />
        Back
      </button>

      <div className="progress-header">

        <div className="progress-icon">
          <FaChartLine />
        </div>

        <div>
          <h1>My Progress</h1>
          <p>
            Track your learning progress and activity.
          </p>
        </div>

      </div>

      <div className="progress-cards">

        <div className="progress-card">
          <h3>AI Notes</h3>
          <strong>
            {aiNotesCount} /{" "}
            {currentPlan === "student_free"
              ? "10"
              : "Unlimited"}
          </strong>
          <span>Completed Today</span>
        </div>

        <div className="progress-card">
          <h3>MCQs</h3>
          <strong>
            {mcqsCount} /{" "}
            {currentPlan === "student_free"
              ? "10"
              : "Unlimited"}
          </strong>
          <span>Completed Today</span>
        </div>

        <div className="progress-card">
          <h3>Homework</h3>
          <strong>
            {homeworkCount} /{" "}
            {currentPlan === "student_free"
              ? "3"
              : "Unlimited"}
          </strong>
          <span>Completed Today</span>
        </div>

        <div className="progress-card">
          <h3>Revision Sheets</h3>
          <strong>
            {revisionCount} /{" "}
            {currentPlan === "student_free"
              ? "2"
              : "Unlimited"}
          </strong>
          <span>Completed Today</span>
        </div>

      </div>

    </div>
  );
}