import "./PDFDownload.css";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBook,
  FaClipboardList,
  FaQuestionCircle,
  FaLayerGroup,
  FaFileAlt,
  FaEdit,
  FaDownload,
  FaFolderOpen,
  FaCheckCircle,
} from "react-icons/fa";

function PDFDownload() {
  const navigate = useNavigate();

  return (
    <div className="pdf-download-page">

      {/* HEADER */}

      <div className="pdf-download-header">

        <button
          className="pdf-back-btn"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
          Back
        </button>

        <div className="pdf-header-badge">
          <FaDownload />
          PDF DOWNLOAD
        </div>

        <h1>
          Download Your Learning
          <span> Anytime, Anywhere</span>
        </h1>

        <p>
          Giganics makes it simple to turn your
          AI-generated learning material into
          downloadable PDF files.
        </p>

      </div>


      {/* MAIN CARD */}

      <div className="pdf-info-card">

        <div className="pdf-card-title">

          <div>
            <h2>How PDF Download Works</h2>

            <p>
              Follow these simple steps to save
              your learning material as a PDF.
            </p>
          </div>

          <FaCheckCircle />

        </div>


        {/* STEP 1 */}

        <div className="pdf-step">

          <div className="pdf-step-number">
            01
          </div>

          <div className="pdf-step-content">

            <h3>Generate Your Learning Material</h3>

            <p>
              Start by creating the content you need
              using Giganics AI learning tools.
            </p>

            <div className="pdf-tools">

              <span>
                <FaBook />
                AI Notes
              </span>

              <span>
                <FaClipboardList />
                Homework
              </span>

              <span>
                <FaQuestionCircle />
                MCQs
              </span>

              <span>
                <FaLayerGroup />
                Flashcards
              </span>

              <span>
                <FaFileAlt />
                Revision
              </span>

            </div>

          </div>

        </div>


        {/* STEP 2 */}

        <div className="pdf-step">

          <div className="pdf-step-number">
            02
          </div>

          <div className="pdf-step-content">

            <h3>Review Your Content</h3>

            <p>
              Open your generated file and review
              the content before downloading it.
              Make sure everything looks exactly
              the way you want.
            </p>

          </div>

        </div>


        {/* STEP 3 */}

        <div className="pdf-step">

          <div className="pdf-step-number">
            03
          </div>

          <div className="pdf-step-content">

            <h3>Open Your File</h3>

            <p>
              Go to your generated learning file
              and open it to view the complete
              content.
            </p>

          </div>

        </div>


        {/* STEP 4 */}

        <div className="pdf-step">

          <div className="pdf-step-number">
            04
          </div>

          <div className="pdf-step-content">

            <h3>Click Download PDF</h3>

            <p>
              Inside your file, click the
              <strong> Download PDF </strong>
              button to create and download your
              study material as a PDF.
            </p>

          </div>

        </div>


        {/* STEP 5 */}

        <div className="pdf-step last-step">

          <div className="pdf-step-number">
            05
          </div>

          <div className="pdf-step-content">

            <h3>Access Your Files Anytime</h3>

            <p>
              You can return to My Files whenever
              you want to manage and access your
              generated learning material.
            </p>

          </div>

        </div>


        {/* MY FILES */}

        <div className="pdf-my-files">

          <div className="pdf-my-files-icon">
            <FaFolderOpen />
          </div>

          <div>

            <h2>Everything in One Place</h2>

            <p>
              My Files keeps your generated
              learning material organized so you
              can easily find your work whenever
              you need it.
            </p>

          </div>

        </div>


        {/* MY FILES BUTTON */}

        <div className="pdf-actions">

          <button
            className="pdf-files-btn"
            onClick={() => navigate("/my-files")}
          >
            <FaFolderOpen />
            Go to My Files
          </button>

        </div>

      </div>

    </div>
  );
}

export default PDFDownload;