import { getHistory, updateSessionNameInDb,getSessionById } from "../utils/historyDb";
import React, { useState } from "react";
import "./Sidebar.css";
import Chatbot from "../assets/energy.png";
import { useStateContext } from "../contexts/ContextProvider.jsx";

// Defensive CSV parser
function parseCSV(text) {
  if (typeof text !== "string") return [];
  return text
    .trim()
    .split("\n")
    .map((line) => line.split(","));
}

// Table renderer for CSV
function CSVTable({ content }) {
  if (!content || typeof content !== "string") {
    return (
      <div style={{ color: "red", padding: 16 }}>
        No CSV content to display.
      </div>
    );
  }
  const rows = parseCSV(content);
  if (!rows.length)
    return <div style={{ color: "red", padding: 16 }}>Empty CSV.</div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    border: "1px solid #ccc",
                    padding: "4px 8px",
                    background: i === 0 ? "#eee" : "white",
                    fontWeight: i === 0 ? "bold" : "normal",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Sidebar = () => {
  const {
    history,
    setHistory,
    csvFile1,
    setCsvFile1,
    activeHistory,
    setActiveHistory,
    activeSessionName,
    setActiveSessionName,
  } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [openSessions, setOpenSessions] = useState({});
  const [viewedFile, setViewedFile] = useState(null); // { sessionName, file }
  const [fileContent, setFileContent] = useState(""); // for dynamic loading
  const [loading, setLoading] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [newSessionName, setNewSessionName] = useState("");

  const toggleSession = (sessionName) => {
    setOpenSessions((prev) => ({
      ...prev,
      [sessionName]: !prev[sessionName],
    }));
  };
  async function handleRenameSession(sessionId, newName) {
    // Update in-memory
    history((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, sessionName: newName } : s))
    );
    // Update in DB
    await updateSessionNameInDb(sessionId, newName);
  }
  return (
    <div>
      {/* Sidebar */}
      <div className="w-80 p-4 mt-1 h-[90%] overflow-y-auto custom-scrollbar overflow-x-hidden">
        <div style={{ textAlign: "left", marginTop: "5px" }}>
          <img
            src={Chatbot}
            alt="Agent Logo"
            style={{
              width: "75%",
              height: "165px",
              display: "block",
              margin: "0 auto",
            }}
          />
        </div>
        <div className="container my-3 font-bold">History</div>

        <ul className="pl-2">
          {(history?.length ?? 0) === 0 ? (
            <li className="text-gray-500">No sessions yet</li>
          ) : (
            history
              .slice()
              .reverse()
              .map((session, idx) => (
                <li key={session.id} className="mb-2">
                  <div
                    className="font-semibold flex items-center cursor-pointer select-none"
                    onClick={() =>
                      setOpenSessions((prev) => ({
                        ...prev,
                        [session.sessionName]: !prev[session.sessionName],
                      }))
                    }
                  >
                    <span className="mr-1">
                      {openSessions[session.sessionName] ? "▼" : "►"}
                    </span>
                    {editingSessionId === session.id ? (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!newSessionName.trim()) return;
                          await updateSessionNameInDb(
                            session.id,
                            newSessionName
                          );

                          // Update history state
                          setHistory((prev) =>
                            prev.map((s) =>
                              s.id === session.id
                                ? { ...s, sessionName: newSessionName }
                                : s
                            )
                          );

                          // Update openSessions object key if open
                          setOpenSessions((prev) => {
                            if (!(session.sessionName in prev)) return prev;
                            const { [session.sessionName]: wasOpen, ...rest } =
                              prev;
                            return { ...rest, [newSessionName]: wasOpen };
                          });

                          setEditingSessionId(null);
                          setNewSessionName("");
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center"
                      >
                        <input
                          className="border rounded px-1 py-0.5 text-sm"
                          value={newSessionName}
                          onChange={(e) => setNewSessionName(e.target.value)}
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="ml-1 text-xs px-2 py-1 rounded bg-green-200"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="ml-1 text-xs px-2 py-1 rounded bg-gray-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSessionId(null);
                            setNewSessionName("");
                          }}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <span
                          className={
                            openSessions[session.sessionName]
                              ? "text-blue-400"
                              : ""
                          }
                        >
                          {session.sessionName}
                        </span>

                        <button
                          className="ml-2 text-xs px-1 py-0.5 rounded bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSessionId(session.id);
                            setNewSessionName(session.sessionName);
                          }}
                          title="Rename session"
                        >
                          ✏️
                        </button>
                      </>
                    )}
                  </div>
                  {openSessions[session.sessionName] && (
                    <ul className="ml-4 ">
                      {session.files.map((file, fIdx) => (
                        <li key={fIdx} className="text-sm flex items-center" style={{marginTop:"-10px"}}>
                          <span className="flex-1 truncate">{file.name}</span>
                          {!file.name
                            .toLowerCase()
                            .includes("forecast_results_") && (
                            <button
                              className="px-1 py-1 rounded text-xs"
                              onClick={() => {
                                setCsvFile1(file);
                                setActiveHistory(true);
                                setActiveSessionName(session.sessionName);
                              }}
                              disabled={isLoading}
                            >
                              {isLoading ? "..." : "⬆️"}
                            </button>
                          )}
                          <button
                            className="px-1 py-1 rounded text-xs"
                            onClick={async (e) => {
                              e.stopPropagation();
                              setLoading(true);

                              // Fetch full session from IndexedDB by id
                              const dbSession = await getSessionById(
                                session.id
                              );
                              setLoading(false);

                              if (
                                dbSession &&
                                dbSession.files &&
                                dbSession.files[fIdx]
                              ) {
                                const file = dbSession.files[fIdx];
                                const content = file.content || "";

                                // Create a blob and trigger download
                                const blob = new Blob([content], {
                                  type: "text/csv",
                                });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = file.name;
                                document.body.appendChild(a);
                                a.click();
                                setTimeout(() => {
                                  URL.revokeObjectURL(url);
                                  document.body.removeChild(a);
                                }, 100);
                              } else {
                                alert("File not found in DB.");
                              }
                            }}
                          >
                            ⬇️
                          </button>
                          <button
                            className="px-1 py-1 rounded text-xs"
                            onClick={async (e) => {
                              e.stopPropagation();
                              setLoading(true);

                              // Fetch full session from IndexedDB by id
                              const dbSession = await getSessionById(
                                session.id
                              );
                              setLoading(false);

                              if (
                                dbSession &&
                                dbSession.files &&
                                dbSession.files[fIdx]
                              ) {
                                const file = dbSession.files[fIdx];
                                const content = file.content || "";

                                // Open new tab
                                const newWindow = window.open();
                                if (newWindow) {
                                  const isCSV = file.name.endsWith(".csv");
                                  let html;
                                  if (isCSV) {
                                    // Limit to first 1000 rows
                                    const rowLimit = 1000;
                                    const allRows = content.trim().split("\n");
                                    const limitedRows = allRows
                                      .slice(0, rowLimit)
                                      .map((row) => row.split(","));
                                    const totalRows = allRows.length;
                                    html = `
                              <html>
                                <head>
                                  <title>${file.name}</title>
                                  <style>
                                    body { font-family: Arial; padding: 24px; }
                                    table { border-collapse: collapse; width: 100%; }
                                    td, th { border: 1px solid #ccc; padding: 6px 12px; }
                                    th { background: #eee; }
                                  </style>
                                </head>
                                <body>
                                  <h2>${file.name}</h2>
                                  <table>


                                    ${limitedRows
                                      .map(
                                        (row, i) =>
                                          `<tr>${row
                                            .map(
                                              (cell) =>
                                                `<${
                                                  i === 0 ? "th" : "td"
                                                }>${cell}</${
                                                  i === 0 ? "th" : "td"
                                                }>`
                                            )
                                            .join("")}</tr>`
                                      )
                                      .join("")}
                                  </table>


                                  ${
                                    totalRows > rowLimit
                                      ? `<p style="color: red;">Showing only the first ${rowLimit} of ${totalRows} rows.</p>`
                                      : ""
                                  }
                                </body>
                              </html>
                            `;
                                  } else {
                                    html = `
                              <html>
                                <head>
                                  <title>${file.name}</title>
                                  <style>body { font-family: Arial; padding: 24px; }</style>
                                </head>
                                <body>
                                  <h2>${file.name}</h2>
                                  <pre>${content
                                    .replace(/</g, "&lt;")
                                    .replace(/>/g, "&gt;")}</pre>
                                </body>
                              </html>
                            `;
                                  }
                                  newWindow.document.write(html);
                                  newWindow.document.close();
                                } else {
                                  alert(
                                    "Popup blocked! Please allow popups for this site."
                                  );
                                }
                              } else {
                                alert("Not found in DB.");
                              }
                            }}
                          >
                            <p className="text-2xl">👁</p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))
          )}
        </ul>
      </div>

      {/* File Viewer */}
      {viewedFile && (
        <div
          style={{
            margin: "40px 0 0 24px",
            padding: 16,
            background: "#fafbff",
            borderRadius: 8,
            maxWidth: 700,
          }}
        >
          <h3>
            Viewing:{" "}
            <b>
              {viewedFile.sessionName} / {viewedFile.file.name}
            </b>
          </h3>
          {loading ? (
            <div style={{ padding: 16 }}>Loading...</div>
          ) : viewedFile.file.name.endsWith(".csv") ? (
            <CSVTable content={fileContent} />
          ) : (
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "#f0f0f0",
                padding: 12,
                borderRadius: 6,
                fontSize: "13px",
              }}
            >
              {typeof fileContent === "string"
                ? fileContent
                : "No file content available."}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
