import "./SubscriptionPlans.css";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  FaCheckCircle,
  FaCrown,
  FaRocket,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaArrowLeft,
} from "react-icons/fa";

function SubscriptionPlans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /*
  =====================================================
  ROLE DETECTION
  URL ROLE > LOCAL STORAGE ROLE > STUDENT DEFAULT
  =====================================================
  */

  const urlRole = searchParams.get("role");
  const savedRole = localStorage.getItem("role");

  const role =
    urlRole === "teacher" || urlRole === "student"
      ? urlRole
      : savedRole === "teacher"
      ? "teacher"
      : "student";

  /*
  =====================================================
  SAVE CORRECT ROLE
  =====================================================
  */

  localStorage.setItem("role", role);

  /*
  =====================================================
  CURRENT PLAN
  =====================================================
  */

  const currentPlan =
    localStorage.getItem("plan") ||
    (role === "teacher" ? "teacher_free" : "student_free");

  /*
  =====================================================
  TEACHER PLANS
  ONLY:
  Teacher Free
  Teacher Premium
  =====================================================
  */

  const teacherPlans = [
    {
      id: "teacher_free",
      name: "Teacher Free",
      description: "Create basic teaching material with AI.",
      price: "Rs 0",
      period: "",
      icon: <FaChalkboardTeacher />,
     features: [
  "AI Notes — 5/day",
  "MCQs — 10/day",
  "Flashcards — 5/day",
  "Homework — 3/day",
  "Classwork — 3/day",
  "Revision Sheets — 2/day",
  "Test Papers — 2/day",
  "Answer Keys — 2/day",
  "PDF Download — Locked",
  "Print with Watermark",
  "My Files — 20 files",
  "Standard AI Speed",
],
    },

    {
      id: "teacher_premium",
      name: "Teacher Premium",
      description: "The complete AI teaching experience.",
      price: "Rs 1000",
      period: "/ Month",
      icon: <FaRocket />,
      popular: true,
      features: [
        "Unlimited AI Notes",
        "Unlimited Homework",
        "Unlimited Classwork",
        "Unlimited MCQs",
        "Unlimited Flashcards",
        "Unlimited Test Papers",
        "PDF Download",
        "No Watermark",
        "Priority AI Processing",
        "Priority Support",
        "Advanced Teaching Tools",
      ],
    },
  ];

  /*
  =====================================================
  STUDENT PLANS
  =====================================================
  */

  const studentPlans = [
    {
      id: "student_free",
      name: "Student Free",
      description: "Get started with essential AI learning tools.",
      price: "Rs 0",
      period: "",
      icon: <FaUserGraduate />,
      features: [
        "Limited AI Notes",
        "Limited MCQs",
        "Limited Flashcards",
        "Daily Usage Limit",
        "Basic Learning Tools",
      ],
    },

    {
      id: "student_basic",
      name: "Student Basic",
      description: "More AI tools for everyday studying.",
      price: "Rs 300",
      period: "/ Month",
      icon: <FaCrown />,
      popular: true,
      features: [
        "More AI Notes",
        "More MCQs",
        "More Flashcards",
        "Homework Help",
        "Revision Sheets",
        "Increased Daily Usage",
        "PDF Download",
        "No Watermark",
      ],
    },

    {
      id: "student_premium",
      name: "Student Premium",
      description: "The complete AI learning experience.",
      price: "Rs 600",
      period: "/ Month",
      icon: <FaRocket />,
      features: [
        "Unlimited AI Notes",
        "Unlimited MCQs",
        "Unlimited Flashcards",
        "Unlimited Homework Help",
        "Unlimited Revision Sheets",
        "Advanced AI Tools",
        "PDF Download",
        "No Watermark",
        "Priority AI Processing",
        "Priority Support",
      ],
    },
  ];

  /*
  =====================================================
  SELECT CORRECT PLANS
  =====================================================
  */

  const plans = role === "teacher" ? teacherPlans : studentPlans;

  /*
  =====================================================
  TITLE
  =====================================================
  */

  const pageTitle =
    role === "teacher" ? "Teacher Plans" : "Student Plans";

  const pageDescription =
    role === "teacher"
      ? "Powerful AI tools designed for smarter teaching."
      : "Powerful AI tools designed for smarter learning.";

  /*
  =====================================================
  BUTTON ACTION
  =====================================================
  */

 const handleSelectPlan = (plan) => {
  if (plan.id === currentPlan) {
    return;
  }

  localStorage.setItem("plan", plan.id);
  localStorage.setItem("role", role);

  alert(`${plan.name} selected successfully!`);

  console.log("SELECTED PLAN:", plan.id);

  if (plan.id === "teacher_premium") {
    navigate("/teacher-premium-dashboard");
  } else if (plan.id === "teacher_free") {
    navigate("/teacher-dashboard");
  } else if (plan.id === "student_basic") {
    navigate("/student-basic-dashboard");
  } else if (plan.id === "student_premium") {
    navigate("/student-premium-dashboard");
  } else {
    navigate("/student-dashboard");
  }
};

  /*
  =====================================================
  BACK BUTTON
  =====================================================
  */

  const handleBack = () => {
    if (role === "teacher") {
      navigate("/teacher-dashboard");
    } else {
      navigate("/student-dashboard");
    }
  };

  return (
    <div className="subscription-plans-page">

      {/* =========================
          BACK BUTTON
      ========================= */}

      <button
        className="back-btn"
        onClick={handleBack}
      >
        <FaArrowLeft />
        Back
      </button>

      {/* =========================
          HEADER
      ========================= */}

      <header className="subscription-header">

        <div className="subscription-title">

          <div className="title-icon">
            {role === "teacher" ? (
              <FaChalkboardTeacher />
            ) : (
              <FaUserGraduate />
            )}
          </div>

          <h1>{pageTitle}</h1>

        </div>

        <p>
          {pageDescription}
        </p>

      </header>

      {/* =========================
          CURRENT PLAN
      ========================= */}

      <div className="current-plan">

        <div>

          <span className="current-label">
            CURRENT PLAN
          </span>

          <strong>
            {currentPlan === "teacher_free"
              ? "Teacher Free"
              : currentPlan === "teacher_premium"
              ? "Teacher Premium"
              : currentPlan === "student_free"
              ? "Student Free"
              : currentPlan === "student_basic"
              ? "Student Basic"
              : currentPlan === "student_premium"
              ? "Student Premium"
              : role === "teacher"
              ? "Teacher Free"
              : "Student Free"}
          </strong>

        </div>

        <FaCheckCircle />

      </div>

      {/* =========================
          PLANS
      ========================= */}

      <div
        className={`plans-container ${
          role === "teacher" ? "teacher-layout" : ""
        }`}
      >

        {plans.map((plan) => {

          const isCurrent = plan.id === currentPlan;

          return (
            <div
              key={plan.id}
              className={`plan-card ${
                plan.popular ? "popular-card" : ""
              } ${
                isCurrent ? "current-card" : ""
              }`}
            >

              {/* POPULAR */}

              {plan.popular && !isCurrent && (
                <div className="popular-badge">
                  <FaCrown />
                  Most Popular
                </div>
              )}

              {/* CURRENT */}

              {isCurrent && (
                <div className="current-badge">
                  <FaCheckCircle />
                  Current Plan
                </div>
              )}

              {/* ICON */}

              <div className="plan-icon">
                {plan.icon}
              </div>

              {/* NAME */}

              <h2>
                {plan.name}
              </h2>

              {/* DESCRIPTION */}

              <p className="plan-description">
                {plan.description}
              </p>

              {/* PRICE */}

              <div className="plan-price">

                <span>
                  {plan.price}
                </span>

                {plan.period && (
                  <small>
                    {plan.period}
                  </small>
                )}

              </div>

              {/* DIVIDER */}

              <div className="plan-divider"></div>

              {/* FEATURES */}

              <div className="features">

                {plan.features.map(
                  (feature, index) => (
                    <div
                      className="feature"
                      key={index}
                    >
                      <FaCheckCircle />

                      <span>
                        {feature}
                      </span>
                    </div>
                  )
                )}

              </div>

              {/* BUTTON */}

              <button
                className={`plan-button ${
                  isCurrent ? "current-button" : ""
                }`}
                disabled={isCurrent}
                onClick={() =>
                  handleSelectPlan(plan)
                }
              >

                {isCurrent ? (
                  <>
                    <FaCheckCircle />
                    Current Plan
                  </>
                ) : (
                  <>
                    Select Plan
                  </>
                )}

              </button>

            </div>
          );

        })}

      </div>

    </div>
  );
}

export default SubscriptionPlans;