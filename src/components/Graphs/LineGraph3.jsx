import React, { useRef } from "react";
import {
  LineChart,
  Label,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { updateSessionInDb, addHistoryItem } from "../../utils/historyDb";
import { useStateContext } from "../../contexts/ContextProvider";
const LineGraph3 = ({ data, ModelName }) => {
  const { history, setHistory, activeSessionName, setActiveSessionName } =
    useStateContext();

  const chartRef1 = useRef();
 const handleDownloadPDF = async () => {
  if (!chartRef1.current) return;

  // Capture chart as image
  const canvas = await html2canvas(chartRef1.current, {
    backgroundColor: "#fff",
  });
  const imgData = canvas.toDataURL("image/png");

  // Prepare PDF
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  // Add centered title
  const titleText = `Data Report`;
  pdf.setFontSize(18);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const textWidth = pdf.getTextWidth(titleText);
  const textX = (pageWidth - textWidth) / 2;
  pdf.text(titleText, textX, 40);

  // Add subtitle for graph
  const subtitleText = " Graph";
  const subtitleWidth = pdf.getTextWidth(subtitleText);
  const subtitleX = (pageWidth - subtitleWidth) / 2;
  pdf.text(subtitleText, subtitleX, 80);

  // Add chart image
  pdf.addImage(imgData, "PNG", 40, 90, pageWidth - 80, 180);

  // Add subtitle for table
  const subtitleText1 = " Table";
  const subtitleWidth1 = pdf.getTextWidth(subtitleText1);
  const subtitleX1 = (pageWidth - subtitleWidth1) / 2;
  pdf.text(subtitleText1, subtitleX1, 290);

  // Prepare table data
  const headers = ModelName === "All"
    ? ["Time", "TinyTimeMixer", "XGBoost", "Prophet"]
    : ["Time", "total load actual"];

  const headers1 = ModelName === "All"
    ? ["time", "TinyTimeMixer", "XGBoost", "Prophet"]
    : ["time", "total load actual"];

  const rows = data.map((row) =>
    headers1.map((key) => (row[key] !== undefined ? String(row[key]) : ""))
  );

  // Calculate the table width (60% of page width)
  const tableWidth = pageWidth * 0.6;
  const leftMargin = (pageWidth - tableWidth) / 2;

  // Use autoTable to add the table with all rows
  autoTable(pdf, {
    head: [headers],
    body: rows,
    startY: 300,
    margin: { left: leftMargin },
    tableWidth: tableWidth,
    headStyles: {
      fillColor: [200, 220, 255],
      textColor: [0, 0, 0],
      fontSize: 10,
      halign: "center",
    },
    styles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      halign: "center",
    },
    didDrawPage: (data) => {
      if (data.pageNumber > 1) {
        data.settings.startY = 0;
      }
    },
  });

  // Save the PDF and update the session history
  setHistory((prevHistory) => {
    if (prevHistory.length === 0) return prevHistory;

    const newHistory = prevHistory.map((session) => {
      if (session.sessionName !== activeSessionName) {
        return session;
      }

      const pdfFileName = `${ModelName}_Forecast.pdf`;
      const pdfFileContent = pdf.output("dataurlstring");
      const pdfFile = {
        name: pdfFileName,
        content: pdfFileContent,
        createdAt: new Date().toISOString(),
        type: "pdf_document",
      };

      let replaced = false;
      let newFiles = (session.files || []).map((file) => {
        if (file.name === pdfFileName) {
          replaced = true;
          return pdfFile;
        }
        return file;
      });

      if (!replaced) {
        newFiles = [...newFiles, pdfFile];
      }

      const updatedSession = { ...session, files: newFiles };

      updateSessionInDb(updatedSession);

      return updatedSession;
    });

    return newHistory;
  });

  pdf.save(`${ModelName}_Forecast.pdf`);
};


  // Download table data as CSV
  const handleDownloadCSV = () => {
    if (!data || !data.length) return;
    const headers =
      ModelName === "All"
        ? ["time", "TinyTimeMixer", "XGBoost", "Prophet"]
        : ["time", "total load actual_prediction"];
    const csvRows = [];
    csvRows.push(headers.join(","));
    data.forEach((row) => {
      const vals = headers.map((key) => {
        let val = row[key];
        if (typeof val === "string") {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val !== undefined ? val : "";
      });
      csvRows.push(vals.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `${ModelName}_data.csv`;
    link.click();
  };

  // Zoom handler (open chart in new tab)
  const handleZoomClick = () => {
    // Prepare the chart data for the new window
    const chartData = JSON.stringify(data);
    const chartLabel = ModelName;

    // The HTML content for the new window
    const html = `
      <html>
        <head>
          <title>Zoomed Chart</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
         <style>
        html, body { margin:0; padding:0; height:100%; width:90%; background:#fff; }
        .title { font-family:sans-serif; font-size:1.5rem; margin:1rem; }
        #chart-container { width: 95vw; height: 60vh; margin: 0 auto; }
        #myChart { width: 100%; height: 100%; }
      </style>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        </head>
        <body>
          <div class="title">${
            chartLabel === "All" ? "All Models" : chartLabel
          } Forecast Chart</div>
          <canvas id="myChart"></canvas>
          <script>
            const chartData = ${chartData};
            const label = "${chartLabel}";
            const labels = chartData.map(d => d.time ? d.time.slice(0,10) : "");
            let datasets;
            if (label === "All") {
              datasets = [
                {
                  label: 'TTM',
                  data: chartData.map(d => d.TinyTimeMixer),
                  borderColor: '#1976d2',
                  fill: false,
                  tension: 0.4,
                },
                {
                  label: 'XGBoost',
                  data: chartData.map(d => d.XGBoost),
                  borderColor: '#388e3c',
                  fill: false,
                  tension: 0.4,
                },
                {
                  label: 'Prophet',
                  data: chartData.map(d => d.Prophet),
                  borderColor: '#d32f2f',
                  fill: false,
                  tension: 0.4,
                },
              ];
            } else {
              datasets = [
                {
                  label: label + ' Forecast',
                  data: chartData.map(d => d["total load actual"]),
                  borderColor: '#1976d2',
                  fill: false,
                  tension: 0.4,
                },
              ];
            }
            const ctx = document.getElementById('myChart').getContext('2d');
            new Chart(ctx, {
              type: 'line',
              data: {
                labels,
                datasets,
              },
              options: {
                responsive: true,
                plugins: {
                  legend: { display: true },
                  title: { display: false },
                  tooltip: { enabled: true },
                },
                scales: {
                  x: { display: true, title: { display: true, text: 'Datetime' } },
                  y: { display: true, title: { display: true, text: 'Forecast Load (Wh)' } }
                }
              }
            });
          </script>
        </body>
      </html>
    `;

    // Open new window and write the HTML content
    const newWindow = window.open();
    newWindow.document.write(html);
    newWindow.document.close();
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Top right buttons */}
      <div
        style={{
          position: "absolute",
          marginTop: "-10px",
          right: 8,
          zIndex: 20,
          display: "flex",
          gap: 6,
        }}
      >
        {/* PDF Button */}
        <button
          style={{
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title="Download PDF (graph + data)"
          onClick={handleDownloadPDF}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19 20H5V4h7V2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zm2-13V3.5L17.5 2H17v6h6v-.5L21 7z"
            />
          </svg>
        </button>
        {/* CSV Button */}
        <button
          style={{
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          title="Download data as CSV"
          onClick={handleDownloadCSV}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M5 20h14v-2H5M19 8h-4V4H9v4H5l7 7 7-7z"
            />
          </svg>
        </button>
        {/* Zoom Button */}
        <button
          style={{
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={handleZoomClick}
          title="Open in new tab"
          tabIndex={0}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M4 4h7V2H2v9h2V4zm16 16h-7v2h9v-9h-2v7zM4 20v-7H2v9h9v-2H4zm16-16v7h2V2h-9v2h7z"
            />
          </svg>
        </button>
      </div>

      {/* Chart */}
      <div
        ref={chartRef1}
        style={{ background: "#fff", borderRadius: 8, paddingTop: 16 }}
      >
        {ModelName === "All" ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tickFormatter={(str) => str.slice(0, 10)} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="TinyTimeMixer"
                name="TTM"
                stroke="#1976d2"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="XGBoost"
                name="XGBoost"
                stroke="#388e3c"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Prophet"
                name="Prophet"
                stroke="#d32f2f"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={data}
              margin={{ top: 20, right: 80, bottom: 20, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
                 <XAxis dataKey="time" tickFormatter={(str) => str.slice(0, 10)} />
    <YAxis >
                <Label
                  content={({ viewBox }) => (
                    <text
                      x={viewBox.x - 50}
                      y={viewBox.y + viewBox.height * 0.8}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(-90, ${viewBox.x - 50}, ${
                        viewBox.y + viewBox.height / 2
                      })`}
                      style={{ fontSize: 14, fill: "#666" }}
                    >
                      Forecast Load (Wh)
                    </text>
                  )}
                  position="outside"
                />
              </YAxis>
              <Tooltip />
              <Legend verticalAlign="bottom" align="center" />
              <Line
                type="monotone"
                dataKey="total load actual"
                name={ModelName + " Forecast"}
                stroke="#1976d2"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default LineGraph3;
