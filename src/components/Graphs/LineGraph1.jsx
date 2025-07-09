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
  ReferenceLine
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { updateSessionInDb } from "../../utils/historyDb";
import { useStateContext } from "../../contexts/ContextProvider";

const LineGraph1 = ({ data, data1, ModelName }) => {
  const { history, setHistory, activeSessionName } = useStateContext();
  const chartRef = useRef();
  console.log("datata ia",data)
 const lastData1Time = data1.reduce(
  (max, item) => (new Date(item.time) > new Date(max) ? item.time : max),
  data1[0]?.time
);
function normalizeTime(t) {
  return t; // If time is identical strings in both datasets, otherwise adjust
}

// Build maps for fast lookup
const dataMap = {};
data.forEach(item => {
  dataMap[normalizeTime(item.time)] = item;
});
const data1Map = {};
data1.forEach(item => {
  data1Map[normalizeTime(item.time)] = item;
});

// Get all unique times (union)
const allTimes = new Set([
  ...data.map(item => normalizeTime(item.time)),
  ...data1.map(item => normalizeTime(item.time))
]);

// Build merged data
const mergedData = Array.from(allTimes).sort().map(time => ({
  time: time,
  Actual: dataMap[time]?.Actual,
  Predicted: dataMap[time]?.Predicted,
  Actual2: data1Map[time]?.Actual
}));

// Example output
console.log(mergedData.slice(0, 100));

  const allValues = data.reduce((acc, cur) => {
    if (cur.Actual !== undefined && cur.Actual !== null) acc.push(cur.Actual);
    if (cur.Predicted !== undefined && cur.Predicted !== null)
      acc.push(cur.Predicted);
    return acc;
  }, []);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);

  // Create 4-stick y-axis: 0, min, ., ., max
  const interval = (max - min) / 3;
  const ticks = [
    0,
    Math.round(min),
    Math.round(min + interval),
    Math.round(min + 2 * interval),
    Math.round(max),
  ];

  // PDF Download
  const handleDownloadPDF = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, {
      backgroundColor: "#fff",
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    // Title
    const titleText = `${ModelName} Validation Report`;
    pdf.setFontSize(18);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const textWidth = pdf.getTextWidth(titleText);
    pdf.text(titleText, (pageWidth - textWidth) / 2, 40);

    // Subtitle Graph
    const subtitleText = "Validation Graph";
    pdf.text(
      subtitleText,
      (pageWidth - pdf.getTextWidth(subtitleText)) / 2,
      80
    );

    // Chart image
    pdf.addImage(imgData, "PNG", 40, 90, pageWidth - 80, 180);

    // Subtitle Table
    const subtitleText1 = "Validation Table";
    pdf.text(
      subtitleText1,
      (pageWidth - pdf.getTextWidth(subtitleText1)) / 2,
      290
    );

    // Table data
    const headers = ["Time", "Actual", "Predicted"];
    const body = data.map((row) => [
      row.time !== undefined ? String(row.time) : "",
      row.Actual !== undefined ? String(row.Actual) : "",
      row.Predicted !== undefined ? String(row.Predicted) : "",
    ]);

    const tableWidth = pageWidth * 0.6;
    const leftMargin = (pageWidth - tableWidth) / 2;

    autoTable(pdf, {
      head: [headers],
      body,
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

    // Save PDF and update session history
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory;

      const newHistory = prevHistory.map((session) => {
        if (session.sessionName !== activeSessionName) {
          return session;
        }

        const pdfFileName = `${ModelName}_Validation.pdf`;
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

    pdf.save(`${ModelName}_Validation.pdf`);
  };

  // CSV Download
  const handleDownloadCSV = () => {
    if (!data || !data.length) return;
    const headers = ["time", "Actual", "Predicted"];
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
 const handleZoomClick = () => {
  const chartData = JSON.stringify(mergedData);
  const refLineX = lastData1Time; // Pass this from your component scope

  const html = `
    <html>
      <head>
        <title>Zoomed Chart</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          html, body { margin:0; padding:0; height:100%; width:100%; background:#fff; }
          .title { font-family:sans-serif; font-size:1.5rem; margin:1rem; }
          #myChart { width: 95vw; height: 60vh; display: block; margin: 0 auto; }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body>
        <div class="title">${ModelName || ''} Forecast Chart</div>
        <canvas id="myChart"></canvas>
        <script>
          const chartData = ${chartData};
          const labels = chartData.map(d => d.time ? d.time.slice(0, 10) : "");
          const refLineX = "${refLineX}";

          const datasets = [
            {
              label: 'Actual',
              data: chartData.map(d => d.Actual !== undefined ? d.Actual : null),
              borderColor: '#1976d2',
              backgroundColor: '#1976d2',
              fill: false,
              tension: 0.4,
              order: 1,
            },
            {
              label: 'Predicted',
              data: chartData.map(d => d.Predicted !== undefined ? d.Predicted : null),
              borderColor: '#ffd600',
              backgroundColor: '#ffd600',
              borderDash: [6, 4],
              fill: false,
              tension: 0.4,
              order: 2,
            },
            {
              label: 'Actual2',
              data: chartData.map(d => d.Actual2 !== undefined ? d.Actual2 : null),
              borderColor: '#1976d2',
              backgroundColor: '#1976d2',
              fill: false,
              tension: 0.4,
              order: 3,
            }
          ];

          // Hide "Actual2" from legend
          const hideActual2FromLegend = {
            id: 'hideActual2FromLegend',
            beforeInit(chart) {
              const original = chart.options.plugins.legend.labels.generateLabels;
              chart.options.plugins.legend.labels.generateLabels = function(chart) {
                return original(chart).filter(item => item.text !== 'Actual2');
              }
            }
          };

          // Reference line plugin
          const referenceLinePlugin = {
            id: 'referenceLinePlugin',
            afterDraw: chart => {
              if (!refLineX) return;
              const xAxis = chart.scales.x;
              const yAxis = chart.scales.y;
              const ctx = chart.ctx;
              // Find index of the reference line label
              const index = labels.findIndex(label => label === refLineX.slice(0, 10));
              if (index === -1) return;
              const x = xAxis.getPixelForValue(index);
              ctx.save();
              // Draw the vertical line
              ctx.strokeStyle = 'red';
              ctx.setLineDash([3, 3]);
              ctx.beginPath();
              ctx.moveTo(x, yAxis.top);
              ctx.lineTo(x, yAxis.bottom);
              ctx.stroke();
              ctx.setLineDash([]);
              // Draw the label at the top
              ctx.font = "bold 12px sans-serif";
              ctx.fillStyle = "red";
              ctx.textAlign = "center";
              ctx.fillText(refLineX, x, yAxis.top - 5);
              ctx.restore();
            }
          };

          const ctx = document.getElementById('myChart').getContext('2d');
          new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
              responsive: true,
              plugins: {
                legend: { display: true },
                title: { display: false },
                tooltip: { enabled: true },
              },
              scales: {
                x: { display: true, title: { display: true, text: 'Time' } },
                y: { display: true, title: { display: true, text: 'Value' } }
              }
            },
            plugins: [hideActual2FromLegend, referenceLinePlugin]
          });
        </script>
      </body>
    </html>
  `;
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
        ref={chartRef}
        style={{ background: "#fff", borderRadius: 8, paddingTop: 16 }}
      >
        <ResponsiveContainer width="100%" height={250}>
          <LineChart
            data={mergedData}
          margin={{ top: 20, right: 80, bottom: 60, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tickFormatter={(str) => str.slice(0, 10)} />
            <YAxis ticks={ticks}>
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
              dataKey="Actual"
              name="Actual"
              stroke="#1976d2"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Predicted"
              name="Predicted"
              stroke="#ffd600"
              strokeWidth={3}
              dot={false}
              strokeDasharray="6 4"
            />
            <Line
              type="monotone"
              dataKey="Actual2"
              name="Actual"
              stroke="#1976d2"
              strokeWidth={3}
              dot={false}
              legendType="none"   // This hides Actual2 from the legend
            />
             <ReferenceLine
      x={lastData1Time}
      stroke="red"
      label={{
        value: lastData1Time,
        position: "top",
        fill: "red",
        fontSize: 12,
        fontWeight: "bold"
      }}
      strokeDasharray="3 3"
    />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineGraph1;
