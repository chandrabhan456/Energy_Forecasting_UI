import React from "react";
import { useLocation } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider.jsx";

// Reuse your CSV parser/table
function parseCSV(text) {
  if (typeof text !== "string") return [];
  return text.trim().split('\n').map(line => line.split(','));
}
function CSVTable({ content }) {
  if (!content || typeof content !== "string") {
    return <div style={{ color: 'red', padding: 16 }}>No CSV content to display.</div>;
  }
  const rows = parseCSV(content);
  if (!rows.length) return <div style={{ color: 'red', padding: 16 }}>Empty CSV.</div>;
  return (
    <div style={{overflowX: "auto"}}>
      <table style={{borderCollapse: "collapse", width: "100%"}}>
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
                    fontWeight: i === 0 ? "bold" : "normal"
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

export default function FileViewer() {
  const { history } = useStateContext();
  const search = new URLSearchParams(useLocation().search);

  const sessionName = search.get("session");
  const fileName = search.get("file");

  // Find file in context
  let file = null;
  let session = null;
  if (history && sessionName && fileName) {
    session = history.find(s => s.sessionName === sessionName);
    if (session) {
      file = session.files.find(f => f.name === fileName);
    }
  }

  const [content, setContent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!file) {
      setContent(null);
      setLoading(false);
      return;
    }
    if (typeof file.content === "string") {
      setContent(file.content);
      setLoading(false);
    } else if (file.fileObject && file.fileObject.text) {
      file.fileObject.text().then(setContent).catch(() => setContent("Failed to read file.")).finally(() => setLoading(false));
    } else {
      setContent("No file content available.");
      setLoading(false);
    }
  }, [file]);

  if (!file) return <div style={{padding: 32, color: "red"}}>File not found.</div>;

  return (
    <div style={{margin: 40, padding: 16, background: "#fafbff", borderRadius: 8, maxWidth: 700}}>
      <h3>
        Viewing: <b>{sessionName} / {fileName}</b>
      </h3>
      {loading ? (
        <div style={{padding: 16}}>Loading...</div>
      ) : (
        fileName.endsWith('.csv') ?
          <CSVTable content={content} />
        : (
          <pre style={{
            whiteSpace: "pre-wrap",
            background: "#f0f0f0",
            padding: 12,
            borderRadius: 6,
            fontSize: "13px"
          }}>
            {typeof content === "string" ? content : "No file content available."}
          </pre>
        )
      )}
    </div>
  );
}