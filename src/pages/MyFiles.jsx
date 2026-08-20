import "./MyFiles.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  FaSearch,
  FaBook,
  FaQuestionCircle,
  FaClipboardList,
  FaLayerGroup,
  FaTrash,
  FaExternalLinkAlt,
  FaArrowLeft,
  FaDownload,
  FaTimes,
  FaCrown,
  FaHome,
  FaFileAlt,
  FaClipboard,
  FaKey,
  FaCog,
  FaBars,
  FaFolderOpen,
} from "react-icons/fa";

function MyFiles() {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All Files");
  const [selectedFile, setSelectedFile] = useState(null);
  const [downloading, setDownloading] = useState(false);

  // =========================================================
  // ROLE
  // =========================================================

  const role = localStorage.getItem("role") || "student";

  const isTeacher = role === "teacher";

  // =========================================================
  // SIDEBAR
  // =========================================================

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeTimer = useRef(null);

  const openSidebar = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    setSidebarOpen(true);
  };

  const closeSidebarDelayed = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    closeTimer.current = setTimeout(() => {
      setSidebarOpen(false);
    }, 600);
  };

  const closeSidebar = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    setSidebarOpen(false);
  };

  const goTo = (path) => {
    closeSidebar();
    navigate(path);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
    };
  }, []);

  // =========================================================
  // ROLE BASED STORAGE KEY
  // =========================================================

  const fileStorageKey =
    role === "teacher"
      ? "giganics_teacher_files"
      : "giganics_student_files";

  // =========================================================
  // LOAD FILES
  // =========================================================

  useEffect(() => {
    loadFiles();
  }, [role]);

  const loadFiles = () => {
    let roleFiles = [];
    let oldFiles = [];

    // -------------------------------------------------------
    // LOAD ROLE FILES
    // -------------------------------------------------------

    try {
      const saved = localStorage.getItem(fileStorageKey);

      if (saved) {
        roleFiles = JSON.parse(saved) || [];
      }
    } catch (error) {
      console.error(
        "Role files loading error:",
        error
      );

      roleFiles = [];
    }

    // -------------------------------------------------------
    // LOAD OLD FILES
    // -------------------------------------------------------

    try {
      const savedOldFiles =
        localStorage.getItem("giganics_files");

      if (savedOldFiles) {
        oldFiles = JSON.parse(savedOldFiles) || [];
      }
    } catch (error) {
      console.error(
        "Old files loading error:",
        error
      );

      oldFiles = [];
    }

    // -------------------------------------------------------
    // MERGE
    // -------------------------------------------------------

    const combinedFiles = [
      ...roleFiles,
      ...oldFiles,
    ];

    // -------------------------------------------------------
    // REMOVE DUPLICATES
    // -------------------------------------------------------

    const uniqueFiles = [];

    const seenIds = new Set();

    combinedFiles.forEach((file, index) => {
      if (!file) return;

      const fileId =
        file.id ||
        `${file.title || "file"}-${file.date || index}`;

      if (!seenIds.has(fileId)) {
        seenIds.add(fileId);

        uniqueFiles.push({
          ...file,
          id: fileId,
        });
      }
    });

    // -------------------------------------------------------
    // SAVE MERGED FILES
    // -------------------------------------------------------

    try {
      localStorage.setItem(
        fileStorageKey,
        JSON.stringify(uniqueFiles)
      );
    } catch (error) {
      console.error(
        "Failed to save merged files:",
        error
      );
    }

    setFiles(uniqueFiles);
  };

  // =========================================================
  // DELETE FILE
  // =========================================================

  const deleteFile = (id) => {
    const updatedFiles = files.filter(
      (file) => file.id !== id
    );

    setFiles(updatedFiles);

    localStorage.setItem(
      fileStorageKey,
      JSON.stringify(updatedFiles)
    );

    try {
      const oldFiles = JSON.parse(
        localStorage.getItem("giganics_files") || "[]"
      );

      const updatedOldFiles = oldFiles.filter(
        (file) => file.id !== id
      );

      localStorage.setItem(
        "giganics_files",
        JSON.stringify(updatedOldFiles)
      );
    } catch (error) {
      console.error(
        "Old files delete error:",
        error
      );
    }

    if (selectedFile?.id === id) {
      setSelectedFile(null);
    }
  };

  // =========================================================
  // OPEN FILE
  // =========================================================

  const openFile = (file) => {
    setSelectedFile(file);
  };

  // =========================================================
  // DOWNLOAD PDF
  // =========================================================

  const downloadFile = async (file) => {
    const plan =
      localStorage.getItem("plan") ||
      (role === "teacher"
        ? "teacher_free"
        : "student_free");

    // =======================================================
    // PDF IS PAID FEATURE
    // =======================================================

    const pdfAllowedPlans = [
      "teacher_premium",
      "student_basic",
      "student_premium",
    ];

    if (!pdfAllowedPlans.includes(plan)) {
      if (role === "teacher") {
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

    // =======================================================
    // CONTENT CHECK
    // =======================================================

    if (!file?.content) {
      alert(
        "This file does not contain any saved content."
      );

      return;
    }

    let pdfElement = null;

    try {
      setDownloading(true);

      const isUrdu =
        /[\u0600-\u06FF]/.test(
          file.content
        );

      // =====================================================
      // PDF CONTAINER
      // =====================================================

      pdfElement =
        document.createElement("div");

      pdfElement.style.position = "fixed";
      pdfElement.style.left = "0";
      pdfElement.style.top = "0";
      pdfElement.style.width = "794px";
      pdfElement.style.padding = "45px";
      pdfElement.style.boxSizing = "border-box";
      pdfElement.style.background = "#ffffff";
      pdfElement.style.color = "#111111";
      pdfElement.style.fontSize = "18px";
      pdfElement.style.lineHeight = "1.8";

      pdfElement.style.direction =
        isUrdu ? "rtl" : "ltr";

      pdfElement.style.textAlign =
        isUrdu ? "right" : "left";

      pdfElement.style.zIndex = "-9999";

      // =====================================================
      // TITLE
      // =====================================================

      const title =
        document.createElement("h1");

      title.textContent =
        file.title || "Giganics File";

      title.style.color = "#111111";
      title.style.marginBottom = "25px";
      title.style.fontSize = "28px";

      title.style.direction =
        isUrdu ? "rtl" : "ltr";

      title.style.textAlign =
        isUrdu ? "right" : "left";

      pdfElement.appendChild(title);

      // =====================================================
      // CONTENT
      // =====================================================

      const content =
        document.createElement("div");

      content.innerHTML =
        convertMarkdownToHTML(
          file.content
        );

      content.style.color = "#222222";

      content.style.direction =
        isUrdu ? "rtl" : "ltr";

      content.style.textAlign =
        isUrdu ? "right" : "left";

      content.style.lineHeight = "1.9";

      pdfElement.appendChild(content);

      document.body.appendChild(pdfElement);

      // =====================================================
      // WAIT FOR FONTS
      // =====================================================

      if (document.fonts) {
        await document.fonts.ready;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      // =====================================================
      // CANVAS
      // =====================================================

      const canvas =
        await html2canvas(
          pdfElement,
          {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
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

      pdfElement.remove();
      pdfElement = null;

      // =====================================================
      // IMAGE
      // =====================================================

      const imgData =
        canvas.toDataURL(
          "image/png",
          1.0
        );

      // =====================================================
      // PDF
      // =====================================================

      const pdf =
        new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;

      const printableWidth =
        pageWidth - margin * 2;

      const printableHeight =
        pageHeight - margin * 2;

      const imageHeight =
        (canvas.height *
          printableWidth) /
        canvas.width;

      let heightLeft = imageHeight;

      let position = margin;

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

      heightLeft -= printableHeight;

      while (heightLeft > 0) {
        position =
          margin -
          (imageHeight - heightLeft);

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

        heightLeft -= printableHeight;
      }

      // =====================================================
      // SAFE FILE NAME
      // =====================================================

      const safeFileName = (
        file.title ||
        "Giganics-File"
      )
        .replace(
          /[\\/:*?"<>|]/g,
          ""
        )
        .replace(
          /\s+/g,
          "-"
        );

      pdf.save(
        `${safeFileName}.pdf`
      );

    } catch (error) {
      console.error(
        "PDF download error:",
        error
      );

      if (pdfElement) {
        pdfElement.remove();
      }

      alert(
        "Failed to create PDF. Please try again."
      );

    } finally {
      setDownloading(false);
    }
  };

  // =========================================================
  // MARKDOWN TO HTML
  // =========================================================

  const convertMarkdownToHTML = (
    markdown
  ) => {
    let html = String(markdown || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(
      /^###### (.*)$/gm,
      "<h6>$1</h6>"
    );

    html = html.replace(
      /^##### (.*)$/gm,
      "<h5>$1</h5>"
    );

    html = html.replace(
      /^#### (.*)$/gm,
      "<h4>$1</h4>"
    );

    html = html.replace(
      /^### (.*)$/gm,
      "<h3>$1</h3>"
    );

    html = html.replace(
      /^## (.*)$/gm,
      "<h2>$1</h2>"
    );

    html = html.replace(
      /^# (.*)$/gm,
      "<h1>$1</h1>"
    );

    html = html.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );

    html = html.replace(
      /^\* (.*)$/gm,
      "<li>$1</li>"
    );

    html = html.replace(
      /^- (.*)$/gm,
      "<li>$1</li>"
    );

    html = html.replace(
      /^\d+\. (.*)$/gm,
      "<li>$1</li>"
    );

    html = html.replace(
      /(<li>.*<\/li>)/gs,
      "<ul>$1</ul>"
    );

    html = html.replace(
      /\n{2,}/g,
      "<br><br>"
    );

    html = html.replace(
      /\n/g,
      "<br>"
    );

    return html;
  };

  // =========================================================
  // FILE ICON
  // =========================================================

  const getFileIcon = (type) => {
    switch (type) {
      case "AI Notes":
        return <FaBook />;

      case "MCQs":
        return <FaQuestionCircle />;

      case "Homework":
        return <FaClipboardList />;

      case "Flashcards":
        return <FaLayerGroup />;

      case "Revision":
        return <FaBook />;

      default:
        return <FaBook />;
    }
  };

  // =========================================================
  // FILE CLASS
  // =========================================================

  const getFileClass = (type) => {
    switch (type) {
      case "AI Notes":
        return "notes";

      case "MCQs":
        return "mcqs";

      case "Homework":
        return "homework";

      case "Flashcards":
        return "flashcards";

      case "Revision":
        return "notes";

      default:
        return "notes";
    }
  };

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

  const filteredFiles = files.filter(
    (file) => {
      const title =
        file.title || "";

      const matchesSearch =
        title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesFilter =
        filter === "All Files" ||
        file.type === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    }
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="myfiles-page">

      {/* =====================================================
          TEACHER SIDEBAR
          MY FILES IS NOT PREMIUM
      ===================================================== */}

      {isTeacher && (
        <>
          {/* SIDEBAR TRIGGER */}

          <div
            className="myfiles-sidebar-trigger"
            onMouseEnter={openSidebar}
          >
            <div className="myfiles-sidebar-hint">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>

          {/* MOBILE MENU */}

          <button
            className="myfiles-menu-btn"
            onClick={openSidebar}
            aria-label="Open menu"
          >
            <FaBars />
          </button>

          {/* OVERLAY */}

          {sidebarOpen && (
            <div
              className="myfiles-sidebar-overlay"
              onClick={closeSidebar}
            />
          )}

          {/* SIDEBAR */}

          <aside
            className={`myfiles-sidebar ${
              sidebarOpen
                ? "myfiles-sidebar-open"
                : ""
            }`}
            onMouseEnter={openSidebar}
            onMouseLeave={closeSidebarDelayed}
          >

            {/* CLOSE */}

            <button
              className="myfiles-sidebar-close"
              onClick={closeSidebar}
              aria-label="Close menu"
            >
              <FaTimes />
            </button>

            {/* LOGO */}

            <div
              className="myfiles-premium-logo"
              onClick={() =>
                goTo(
                  "/teacher-premium-dashboard"
                )
              }
            >
              <div className="myfiles-logo-orb">
                <FaCrown />
              </div>

              <h2>
                Giganics
              </h2>
            </div>

            {/* NAVIGATION */}

            <ul>

              <li
                onClick={() =>
                  goTo(
                    "/teacher-premium-dashboard"
                  )
                }
              >
                <FaHome />
                <span>
                  Dashboard
                </span>
              </li>

              <li
                onClick={() =>
                  goTo(
                    "/teacher-test-paper"
                  )
                }
              >
                <FaFileAlt />
                <span>
                  Exam Paper AI
                </span>
              </li>

              <li
                onClick={() =>
                  goTo(
                    "/teacher-ai-notes"
                  )
                }
              >
                <FaBook />
                <span>
                  AI Notes
                </span>
              </li>

              <li
                onClick={() =>
                  goTo(
                    "/teacher-mcqs"
                  )
                }
              >
                <FaQuestionCircle />
                <span>
                  AI MCQs
                </span>
              </li>

              <li
                onClick={() =>
                  goTo(
                    "/teacher-homework"
                  )
                }
              >
                <FaClipboard />
                <span>
                  Homework
                </span>
              </li>

              <li
                onClick={() =>
                  goTo(
                    "/teacher-classwork"
                  )
                }
              >
                <FaLayerGroup />
                <span>
                  Classwork
                </span>
              </li>

              <li
                onClick={() =>
                  goTo(
                    "/teacher-flashcards"
                  )
                }
              >
                <FaBook />
                <span>
                  Flashcards
                </span>
              </li>

              <li
                onClick={() =>
                  goTo(
                    "/teacher-answer-key"
                  )
                }
              >
                <FaKey />
                <span>
                  Answer Keys
                </span>
              </li>

              {/* PDF IS PREMIUM */}

              <li
                onClick={() =>
                  goTo(
                    "/pdf-download"
                  )
                }
              >
                <FaDownload />
                <span>
                  PDF Export
                </span>
              </li>

              {/* MY FILES IS FREE */}

              <li
                className="active"
                onClick={() =>
                  goTo("/my-files")
                }
              >
                <FaFolderOpen />
                <span>
                  My Files
                </span>
              </li>

              <li
                onClick={closeSidebar}
              >
                <FaCog />
                <span>
                  Settings
                </span>
              </li>

            </ul>

          </aside>
        </>
      )}

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="myfiles-header">

        <div>

          <button
            className="myfiles-back-btn"
            onClick={() =>
              navigate(-1)
            }
          >
            <FaArrowLeft />
            Back
          </button>

          <h1>
            My Files
          </h1>

          <p>
            Manage all your AI generated
            learning files.
          </p>

        </div>

      </div>

      {/* =====================================================
          SEARCH + FILTER
      ===================================================== */}

      <div className="myfiles-tools">

        <div className="myfiles-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search your files..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

        <select
          className="myfiles-filter"
          value={filter}
          onChange={(e) =>
            setFilter(
              e.target.value
            )
          }
        >
          <option>
            All Files
          </option>

          <option>
            AI Notes
          </option>

          <option>
            MCQs
          </option>

          <option>
            Homework
          </option>

          <option>
            Flashcards
          </option>

          <option>
            Revision
          </option>

        </select>

      </div>

      {/* =====================================================
          FILES
      ===================================================== */}

      <div className="myfiles-grid">

        {filteredFiles.length === 0 ? (

          <div className="myfiles-empty">

            <FaBook />

            <h3>
              No files found
            </h3>

            <p>
              Your generated learning
              files will appear here.
            </p>

          </div>

        ) : (

          filteredFiles.map(
            (file) => (

              <div
                className="file-card"
                key={file.id}
              >

                <div
                  className={`file-icon ${getFileClass(
                    file.type
                  )}`}
                >
                  {getFileIcon(
                    file.type
                  )}
                </div>

                <div className="file-info">

                  <h3>
                    {file.title ||
                      "Untitled File"}
                  </h3>

                  <p>
                    {file.type ||
                      "Learning File"}{" "}
                    •{" "}
                    {file.date ||
                      "Today"}
                  </p>

                </div>

                <div className="file-actions">

                  {/* OPEN */}

                  <button
                    onClick={() =>
                      openFile(file)
                    }
                    title="Open"
                  >
                    <FaExternalLinkAlt />
                  </button>

                  {/* PDF */}

                  <button
                    onClick={() =>
                      downloadFile(file)
                    }
                    title="Download PDF"
                    disabled={
                      downloading
                    }
                  >
                    <FaDownload />
                  </button>

                  {/* DELETE */}

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteFile(
                        file.id
                      )
                    }
                    title="Delete"
                  >
                    <FaTrash />
                  </button>

                </div>

              </div>

            )
          )

        )}

      </div>

      {/* =====================================================
          OPEN FILE
      ===================================================== */}

      {selectedFile && (

        <div className="myfiles-file-view">

          <div className="myfiles-file-view-card">

            {/* HEADER */}

            <div className="myfiles-file-view-header">

              <div>

                <h2>
                  {
                    selectedFile.title ||
                    "Untitled File"
                  }
                </h2>

                <p>
                  {
                    selectedFile.type ||
                    "Learning File"
                  }
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedFile(
                    null
                  )
                }
                title="Close"
              >
                <FaTimes />
              </button>

            </div>

            {/* CONTENT */}

            <div className="myfiles-file-content">

              {selectedFile.content ? (

                <ReactMarkdown>
                  {
                    selectedFile.content
                  }
                </ReactMarkdown>

              ) : (

                <p>
                  This file does not contain
                  any saved content.
                </p>

              )}

            </div>

            {/* FOOTER */}

            <div className="myfiles-file-footer">

              <button
                onClick={() =>
                  downloadFile(
                    selectedFile
                  )
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

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default MyFiles;