import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const DataDownloader = () => {
  const [loading, setLoading] = useState(false);
  const [jsonBody, setJsonBody] = useState(""); // State for JSON body input
  const [controller, setController] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [logs, setLogs] = useState([]); // State for logs

  useEffect(() => {
    let timerInterval;

    if (loading) {
      setStartTime(Date.now());

      timerInterval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60)
          .toString()
          .padStart(2, "0");
        const seconds = (elapsed % 60).toString().padStart(2, "0");
        setElapsedTime(`${minutes}:${seconds}`);
      }, 1000);
    } else {
      clearInterval(timerInterval);
    }

    return () => clearInterval(timerInterval);
  }, [loading, startTime]);

  const handleDownload = async () => {
    setLoading(true);

    let filters = {};

    // If jsonBody is provided, parse and merge with filters
    if (jsonBody.trim()) {
      try {
        const parsedJson = JSON.parse(jsonBody);
        filters = { ...filters, ...parsedJson };
      } catch (error) {
        setLoading(false);
        alert("Invalid JSON body");
        return;
      }
    }

    const abortController = new AbortController();
    setController(abortController);

    const startDownloadTime = Date.now();
    const formattedStartTime = new Date(startDownloadTime).toLocaleString();

    try {
      const response = await fetch(
        "https://localhost:7269/v1/transactions/csvExport",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(filters),
          signal: abortController.signal,
        }
      );

      const endDownloadTime = Date.now();
      const duration = Math.floor((endDownloadTime - startDownloadTime) / 1000); // Duration in seconds
      const formattedEndTime = new Date(endDownloadTime).toLocaleString();

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let fileName = "data.csv"; // Default filename

      if (contentDisposition && contentDisposition.includes("filename=")) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch.length > 1) {
          fileName = filenameMatch[1];
        }
      }

      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);

      // Log successful download
      setLogs((prevLogs) => [
        ...prevLogs,
        {
          status: "Success",
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          duration: `${duration} seconds`,
          error: "",
        },
      ]);
    } catch (error) {
      const endDownloadTime = Date.now();
      const duration = Math.floor((endDownloadTime - startDownloadTime) / 1000); // Duration in seconds
      const formattedEndTime = new Date(endDownloadTime).toLocaleString();

      // Log failure
      setLogs((prevLogs) => [
        ...prevLogs,
        {
          status: "Failed",
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          duration: `${duration} seconds`,
          error: error.message,
        },
      ]);
    } finally {
      setLoading(false);
      setController(null);
    }
  };

  const handleCancel = () => {
    if (controller) {
      controller.abort();
    }
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Download Logs", 14, 16);
    doc.autoTable({
      head: [["Status", "Start Time", "End Time", "Duration", "Error"]],
      body: logs.map((log) => [
        log.status,
        log.startTime,
        log.endTime,
        log.duration,
        log.error,
      ]),
      startY: 20,
    });
    doc.save("download-report.pdf");
  };

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <div style={styles.formRow}>
          <textarea
            placeholder="Enter JSON Body"
            value={jsonBody}
            onChange={(e) => setJsonBody(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleDownload} style={styles.button}>
            Download CSV
          </button>
        </div>
      </div>
      {loading && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <div style={styles.circleLoader}></div>
            <div style={styles.timer}>{elapsedTime}</div>
            <button onClick={handleCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </div>
      )}
      <div style={styles.logs}>
        <h2 style={styles.logsHeader}>Download Logs:</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Duration</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{log.status}</td>
                <td>{log.startTime}</td>
                <td>{log.endTime}</td>
                <td>{log.duration}</td>
                <td>{log.error}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={handleDownloadPDF} style={styles.pdfButton}>
          Download Report as PDF
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f4f9",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    boxSizing: "border-box",
  },
  form: {
    width: "100%",
    maxWidth: "800px",
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    boxSizing: "border-box",
  },
  formRow: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    minHeight: "100px",
  },
  button: {
    padding: "8px 16px",
    borderRadius: "4px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
    position: "relative",
  },
  circleLoader: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    border: "5px solid #3b82f6",
    borderTopColor: "transparent",
    animation: "spin 1s linear infinite",
    margin: "0 auto 10px",
  },
  timer: {
    fontSize: "1.2rem",
    margin: "10px 0",
  },
  cancelButton: {
    padding: "8px 16px",
    marginTop: "10px",
    borderRadius: "4px",
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
  },
  logs: {
    width: "100%",
    maxWidth: "800px",
    marginTop: "20px",
  },
  logsHeader: {
    fontSize: "1.5rem",
    marginBottom: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "10px",
  },
  tableHeader: {
    fontWeight: "bold",
  },
  pdfButton: {
    padding: "8px 16px",
    borderRadius: "4px",
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    marginTop: "10px",
  },
};

// Add spinner animation keyframes
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default DataDownloader;
