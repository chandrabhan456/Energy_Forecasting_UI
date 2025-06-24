import React, { useState, useEffect, useRef } from "react";
import "./DataConn.css";
import { IoIosClose } from "react-icons/io";
import { RiFileExcel2Fill } from "react-icons/ri";
import Papa from "papaparse";
import { FaDownload } from "react-icons/fa";
import LineGraph1 from "./Graphs/LineGraph1";
import ForecastGraph1 from "./Graphs/ForecastGraph1";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useStateContext } from "../contexts/ContextProvider";
import { updateSessionInDb, addHistoryItem } from "../utils/historyDb";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const dummyData = ["Index", "Date"];
const headers = ["#", "Metric", "Value"];
const columnWidths = [15, 70, 70]; // Only 3 columns, so only 0,1,2 used
const modelOptions = [
  { value: "TinyTimeMixerForPrediction", label: "TinyTimeMixerForPrediction" },
  { value: "XGBoost", label: "XGBoost" },
  { value: "Prophet", label: "Prophet" },
];
const DataConnection = () => {
  // State to manage selected options
  const {
    history,
    setHistory,
    csvFile1,
    setCsvFile1,
    activeHistory,
    activeSessionName,
    setActiveSessionName,
  } = useStateContext();
  const [selectedModel, setSelectedModel] = useState(modelOptions[0].value);
  const [inputValue1, setInputValue1] = useState("5000");
  const [hourValue, sethourValue] = useState("22");
  const [inputValue2, setInputValue2] = useState("5325");
  const [inputValue3, setInputValue3] = useState("5687");
  const [selectedview, setSelectedView] = useState(dummyData[0]);
  const [csvActive, setCsvActive] = useState(true);
  const [databaseActive, setDatabaseActive] = useState(false);
  const [cloudActive, setCloudActive] = useState(false);

  console.log("csvFile1:", csvFile1);
  console.log("activeHistory", activeHistory);

  const [csvFiles, setCsvFiles] = useState([]); // Store multiple files
  const [message, setMessage] = useState("");
  const [errmessage, setErrMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [csvFile, setCsvFile] = useState(activeHistory ? csvFile1 : null);

  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateValue, setDateValue] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [forecastResult, setForecastResult] = useState(null);
  const [activeButton, setActiveButton] = useState("none");

  const [metrix, setMetrix] = useState(null);
  const [forecast, setForecast] = useState(false);
  useEffect(() => {
    setCsvFile(activeHistory ? csvFile1 : null);
    if (activeHistory) {
      setActiveButton("none");
      setForecast(false);
    }
  }, [activeHistory, csvFile1]);
  const [csvData1, setCsvData1] = useState([]);
  const [indexResult1, setIndexResult1] = useState({});
  const [indexResult2, setIndexResult2] = useState([]);
  const [indexResult3, setIndexResult3] = useState([]);
  const [csvResult, setCsvResult] = useState([]);
  const [graphData1, setGraphData1] = useState([]);
  const [graphData2, setGraphData2] = useState([]);
  const [graphData3, setGraphData3] = useState([]);
  const [graphLabel1, setGraphLabel1] = useState("");
  const [graphLabel2, setGraphLabel2] = useState("");
  const [graphLabel3, setGraphLabel3] = useState("");
  const [graphLabel4, setGraphLabel4] = useState("");
  const [dateResult3, setDateResult3] = useState([]);
  const [graphData4, setGraphData4] = useState([]);
  const chartRef1 = useRef();
  const chartRef2 = useRef();
  const chartRef3 = useRef();
  const chartRef4 = useRef();
  const minDate = new Date(2018, 2, 1); // March 1, 2018
  const maxDate = new Date(2022, 2, 31); // March 31, 2022
  const [buttoon1, setButton1] = useState("");
  const handleChange = (e) => {
    setSelectedModel(e.target.value);
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setCsvData([]);
    setCsvFile(null); // Reset existing
    setActiveButton("none");
    setForecast(false);
    // Accept only CSV and Excel
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!validTypes.includes(file.type)) {
      alert("Please select a valid CSV or Excel file.");
      event.target.value = null;
      return;
    }

    // Set file with metadata
    setCsvFile({
      fileObject: file,
      name: file.name,
      type: file.type,
      timestamp: Date.now(),
    });

    // Clear input to allow re-uploading the same file
    event.target.value = null;
    setButton1("1");
  };

  // Remove the file
  const handleCsvRemove = () => {
    setCsvFile(null);
    setCsvFile1(null);
    setCsvData([]);
    setActiveButton("none");
    setForecast(false);
  };

  // Parse and preview the file (first 20 rows)
  const handleCsvClick = () => {
    if (!csvFile) return;
    setLoading(true);
    setCsvData([]); // Reset
    setActiveButton("file");
    let rowCount = 0;

    Papa.parse(csvFile.fileObject, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      chunk: (results, parser) => {
        const newRows = results.data;
        const remainingRows = 20 - rowCount;
        if (remainingRows > 0) {
          setCsvData((prevData) => [
            ...prevData,
            ...newRows.slice(0, remainingRows),
          ]);
          rowCount += newRows.length;
          if (rowCount >= 20) {
            parser.abort();
          }
        }
      },
      complete: () => {
        setLoading(false);
      },
      error: (error) => {
        alert("Error parsing CSV file: " + error.message);
        setLoading(false);
      },
    });
  };
  useEffect(() => {
    console.log("Updated csvData:", csvData);
  }, [csvFiles, csvData]); // This will run after pdfFiles state is updated

  function parseCSV(csv) {
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());
    return lines.slice(1).map((line) => {
      // This simple parser works for your dummy data, not for complex quoted values
      const values = line.split(",").map((v) => v.trim());
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = values[idx];
      });
      return obj;
    });
  }

  const handleUpload = async () => {
    if (!csvFile) {
      setErrMessage("No file selected.");
      return;
    }

    setIsLoading(true);
    setActiveButton("Upload");

    const formData = new FormData();
    formData.append("file", csvFile.fileObject);

    try {
      const response = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }

      const data = await response.json();
      setMessage(data.message);

      // Read file content as text
      const content = await csvFile.fileObject.text();

      // Create new session object
      const newSession = {
        sessionName: `Session ${history.length + 1}`,
        files: [
          {
            name: csvFile.fileObject.name,
            content: content,
          },
        ],
      };

      // Append to React state history
      const newId = await addHistoryItem(newSession); // newId will be 1, 2, 3, etc.

      setHistory((prev) => [...prev, { ...newSession, id: newId }]);
      setActiveSessionName(newSession.sessionName);

      // Add to IndexedDB (assuming addHistory handles this)
      //await addHistory(newSession);
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrMessage(`Error uploading file: ${error.message}`);
    } finally {
      setIsLoading(false);
      setActiveButton("");
      setButton1("2");
    }
  };
  useEffect(() => {
    console.log("activeSessionName changed:", activeSessionName);
  }, [activeSessionName]);
  function formatDate(date) {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = hourValue; // String(date.getHours()).padStart(2, '0');
    return `${year}-${month}-${day}/${hour}`;
  }
  const GetCsvGraph = async () => {
    setLoading(true);

    setForecastResult(null); // Reset before new fetch
    setMessage("");
    // Your logic here

    try {
      const response = await fetch(`http://127.0.0.1:5000/InputDataImage`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      // Parse JSON response
      const data = await response.json();
      console.log("API response", data);

      // Set base64 image (prepend the proper data URL prefix)

      if (data.csv_text_Input_DataPlot) {
        setCsvResult(data.csv_text_Input_DataPlot);
      }
      // Set metrics if you want to show them in a table
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateForecast = async () => {
    setLoading(true);
    setActiveButton("Graph");
    setMessage("");
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/forecast/TinyTimeMixerForPrediction",
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      // Parse JSON response
      const data = await response.json();
      console.log("API response", data);

      // Set base64 image (prepend the proper data URL prefix)

      // Set metrics if you want to show them in a table
      if (data.results?.Evaluation_Metrics) {
        setMetrix({ Evaluation_Metrics: data.results.Evaluation_Metrics });
        setForecast(true);
        GetCsvGraph();
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    } finally {
      setLoading(false);
      setButton1("3");
    }
  };
  const handleShowForecast = () => {
    setActiveButton("Graph");
    setMessage("");
  };
  console.log("Graph data", imageUrl);

  // Handler for "Evaluation Metrix"
  const handleEvaluationMetrix = async () => {
    setLoading(true);
    setActiveButton("Result");
    setForecastResult(null); // Reset before new fetch
    setMessage("");
    // Your logic here
    if (selectedview === "Index") {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/results/${inputValue1}/${inputValue2}/${inputValue3}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        // Parse JSON response
        const data = await response.json();
        console.log("API response", data);

        // Set base64 image (prepend the proper data URL prefix)

        if (data.csv_text_index1) {
          setIndexResult1(data.csv_text_index1);
          setIndexResult2(data.csv_text_index2);
          setIndexResult3(data.csv_text_index3);
          setGraphLabel1(data[`Index_${inputValue1}_hours_are`]);
          setGraphLabel2(data[`Index_${inputValue2}_hours_are`]);
          setGraphLabel3(data[`Index_${inputValue3}_hours_are`]);

          console.log("activeSessionName", activeSessionName);

          setHistory((prevHistory) => {
            if (prevHistory.length === 0) return prevHistory;

            // Use the active session name to update the relevant session
            const newHistory = prevHistory.map((session) => {
              if (session.sessionName !== activeSessionName) {
                return session; // Leave other sessions unchanged
              }

              const resultFilename = `Forecast_Results_index1.csv`;
              const resultFile = {
                name: resultFilename,
                content: data.csv_text_index1,
                createdAt: new Date().toISOString(),
                type: "index_result1",
              };

              // Replace or add the file
              let replaced = false;
              let newFiles = (session.files || []).map((file) => {
                if (file.name === resultFilename) {
                  replaced = true;
                  return resultFile; // Replace
                }
                return file;
              });
              if (!replaced) {
                newFiles = [...newFiles, resultFile];
              }

              const updatedSession = { ...session, files: newFiles };

              updateSessionInDb(updatedSession); // Update in IndexedDB
              return updatedSession;
            });

            return newHistory;
          });
        }
        // Set metrics if you want to show them in a table
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    } else {
      const date = formatDate(dateValue);
      console.log("selected date123", date);
      try {
        const response = await fetch(`http://127.0.0.1:5000/results/${date}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        // Parse JSON response
        const data = await response.json();
        console.log("API response", data);

        // Set base64 image (prepend the proper data URL prefix)

        if (data.csv_text_index1) {
          setDateResult3(data.csv_text_index1);

          setGraphLabel4(data[`Index_4_hours_are`]);
        }
        // Set metrics if you want to show them in a table
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper to convert SVG node to PNG DataURL
  const svgToPngDataUrl = (svgNode, width = 600, height = 200) => {
    return new Promise((resolve) => {
      const svgString = new XMLSerializer().serializeToString(svgNode);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      const img = new window.Image();
      const svg64 = btoa(unescape(encodeURIComponent(svgString)));
      img.onload = function () {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = "data:image/svg+xml;base64," + svg64;
    });
  };
  const handleDownload = async () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Evaluation Matrix", 105, 20, { align: "center" });

    // Table 1: Evaluation Metrics
    const rows = Object.entries(metrix.Evaluation_Metrics).map(
      ([key, value], idx) => [idx + 1, key, value]
    );
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 25,
      margin: { left: 27.5 },
      columnStyles: {
        0: { cellWidth: columnWidths[0] },
        1: { cellWidth: columnWidths[1] },
        2: { cellWidth: columnWidths[2] },
      },
      headStyles: {
        fillColor: [173, 216, 230],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
    });

    let finalY = doc.lastAutoTable.finalY || 50;
    const chartWidth = 180;
    const chartHeight = 60;

    const addChartToPdf = async (chartRef, label, y) => {
      if (chartRef?.current) {
        const svg = chartRef.current.querySelector("svg");
        if (svg) {
          const width = svg.width?.baseVal?.value || 600;
          const height = svg.height?.baseVal?.value || 200;
          const imgData = await svgToPngDataUrl(svg, width, height);

          doc.setFontSize(12);
          doc.text(label, 105, y + 8, { align: "center" });
          doc.addImage(imgData, "PNG", 15, y + 10, chartWidth, chartHeight);
          return y + 10 + chartHeight + 10;
        }
      }
      return y;
    };

    // Always add chartRef1 if present
    if (chartRef1?.current && chartRef1.current.querySelector("svg")) {
      finalY = await addChartToPdf(
        chartRef1,
        `Example ${graphLabel1}`,
        finalY + 8
      );
    }
    // Only add chartRef2 if present
    if (chartRef2?.current && chartRef2.current.querySelector("svg")) {
      finalY = await addChartToPdf(chartRef2, `Example ${graphLabel2}`, finalY);
    }
    // Only add chartRef3 if present
    if (chartRef3?.current && chartRef3.current.querySelector("svg")) {
      finalY = await addChartToPdf(chartRef3, `Example ${graphLabel3}`, finalY);
    }

    // Add your consumption table
    const consumptionHeaders = [
      ["Time", "Predicted Consumption", "Actual Consumption"],
    ];
    const consumptionRows = graphData1.map((row) => [
      row.Time,
      row["Predicted Consumption"],
      row["Actual Consumption"],
    ]);

    autoTable(doc, {
      head: consumptionHeaders,
      body: consumptionRows,
      startY: finalY + 8,
      margin: { left: 27.5 },
      headStyles: { fillColor: [200, 220, 255] },
    });

    doc.save("Forecast-Report.pdf");
  };

  useEffect(() => {
    if (selectedview === "Index") {
      if (indexResult1 && indexResult1.length > 0) {
        const parsed = parseCSV(indexResult1);
        setGraphData1(parsed);
        console.log("parsed data:", parsed);
      }
      if (indexResult2 && indexResult2.length > 0) {
        const parsed = parseCSV(indexResult2);
        setGraphData2(parsed);
        console.log("parsed data:", parsed);
      }
      if (indexResult3 && indexResult3.length > 0) {
        const parsed = parseCSV(indexResult3);
        setGraphData3(parsed);
        console.log("parsed data:", parsed);
      } else {
        setGraphData1([]);
        setGraphData4([]);
      }
    } else {
      if (dateResult3 && dateResult3.length > 0) {
        const parsed = parseCSV(dateResult3);
        setGraphData4(parsed);
        console.log("parsed data:", parsed);
      } else {
        setGraphData1([]);
        setGraphData4([]);
      }
    }
  }, [
    activeButton,
    csvData1,
    indexResult1,
    indexResult2,
    indexResult3,
    dateResult3,
  ]);
  useEffect(() => {
    console.log("csvDataaaa", csvResult);
  }),
    [csvResult];
  return (
    <div className="flex flex-col mt-0 ml-10 space-y-2 w-full ">
      <div className="mt-4 ml-[12%] ">
        {csvActive && (
          <>
            <div className="">
              <div className="w-1/2 mt-3 h-32 ml-[13%] flex flex-col items-center bg-blue-50 border-2 border-blue-300 border-dashed rounded-xl p-2 transition hover:shadow-lg hover:bg-blue-100">
                {/* Upload Illustration */}

                <div className="mb-4">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <rect width="64" height="64" rx="16" fill="#DBEAFE" />
                    <g>
                      <path
                        d="M45.5 46H22.5C17.8056 46 14 42.1944 14 37.5C14 33.2254 17.4992 29.6838 21.7094 29.5127C22.9441 25.0228 27.0519 22 32 22C36.9481 22 41.0559 25.0228 42.2906 29.5127C46.5008 29.6838 50 33.2254 50 37.5C50 42.1944 46.1944 46 41.5 46H45.5Z"
                        fill="#60A5FA"
                      />
                      <path
                        d="M32 38V27"
                        stroke="#2563EB"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M28 31L32 27L36 31"
                        stroke="#2563EB"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  </svg>
                </div>
                {/* File Input */}
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv, .xls, .xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-700 font-medium text-lg dark:text-[#D3D3D3]"
                >
                  Upload file here,{" "}
                  <span className="underline">click to browse</span>
                  {/* <div className="text-xs text-center text-blue-400 mt-2">
                    Supported: .csv, .xls, .xlsx
                  </div> */}
                </label>
              </div>
              <div className="ml-[8%]">
                {csvActive && (
                  <>
                    <div className="mt-1">
                      {csvFile && (
                        <div className="  ml-16">
                          {console.log("ramm", csvFiles)}
                          <div>
                            {csvFile && (
                              <div className="flex items-center m-0">
                                <RiFileExcel2Fill
                                  style={{
                                    color: "green",
                                    marginTop: "4px",
                                    marginRight: "8px",
                                    width: "24px",
                                  }}
                                />

                                <p
                                  className="truncate dark:text-[#d3d3d3] text-black mr-2"
                                  style={{
                                    cursor: "pointer",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    textOverflow: "ellipsis",
                                    margin: "0",
                                  }}
                                >
                                  {csvFile.name}
                                </p>
                                <button
                                  className="ml-1 text-center text-white bg-blue-500 border border-blue-700 rounded px-2"
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    handleCsvClick(csvFile.fileObject)
                                  }
                                >
                                  Preview
                                </button>
                                <button
                                  className="ml-1 text-left text-white bg-red-300 border border-red-300 rounded px-2"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleCsvRemove(csvFile)}
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 flex space-x-2 whitespace-nowrap">
                            {/* Button and Status */}
                            {buttoon1 === "1" && (
                              <>
                                <button
                                  className={`fancy-3d-btn h-12`}
                                  onClick={handleUpload}
                                  disabled={activeButton === "Upload"}
                                >
                                  {activeButton === "Upload"
                                    ? "Processing..."
                                    : "Upload File"}
                                </button>
                              </>
                            )}
                            {buttoon1 === "2" && (
                              <div className="flex gap-2">
                                <select
                                  id="model-select"
                                  value={selectedModel}
                                  onChange={handleChange}
                                  className="main-page-dropdown"
                                >
                                  {modelOptions.map((option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                    <button
                                  className={`fancy-3d-btn h-12`}
                                  onClick={handleGenerateForecast}
                                  disabled={activeButton === "Graph"}
                                >
                                  {activeButton === "Graph"
                                    ? "Processing..."
                                    : "Generate Forecast"}
                                </button>
                               </div>
                            )}
                            {buttoon1 === "3" && (
                              <>
                                <div className="flex space-x-2 mt-4">
                                  {/* Input Box 1 */}
                                  <select
                                    value={selectedview}
                                    onChange={(e) =>
                                      setSelectedView(e.target.value)
                                    }
                                    className="main-page-dropdown w-32"
                                    style={{ marginRight: "10px" }}
                                  >
                                    {dummyData.map((item) => (
                                      <option key={item} value={item}>
                                        {item}
                                      </option>
                                    ))}
                                  </select>
                                  {selectedview === "Index" ? (
                                    <>
                                      {/* Input Box 1 */}
                                      <input
                                        type="text"
                                        value={inputValue1}
                                        onChange={(e) =>
                                          setInputValue1(e.target.value)
                                        }
                                        className="border w-24 h-12 rounded px-2 py-1"
                                        placeholder="Enter value 1"
                                      />

                                      {/* Input Box 2 */}
                                      <input
                                        type="text"
                                        value={inputValue2}
                                        onChange={(e) =>
                                          setInputValue2(e.target.value)
                                        }
                                        className="border w-24 h-12 rounded px-2 py-1"
                                        placeholder="Enter value 2"
                                      />

                                      {/* Input Box 3 */}
                                      <input
                                        type="text"
                                        value={inputValue3}
                                        onChange={(e) =>
                                          setInputValue3(e.target.value)
                                        }
                                        className="border w-24 h-12 rounded px-2 py-1"
                                        placeholder="Enter value 3"
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <DatePicker
                                        selected={dateValue}
                                        onChange={(date) => setDateValue(date)}
                                        className="border w-32 rounded px-2 py-1 h-12"
                                        placeholderText="Select date"
                                        dateFormat="yyyy-MM-dd"
                                        minDate={minDate}
                                        maxDate={maxDate}
                                        openToDate={minDate} // <-- This line makes calendar open at minDate
                                        showMonthYearPicker={false} // Optional: true if you want month-year only
                                      />
                                      <input
                                        type="text"
                                        value={hourValue}
                                        onChange={(e) =>
                                          sethourValue(e.target.value)
                                        }
                                        className="border w-24 h-12 rounded px-2 py-1"
                                        placeholder="Enter value 1"
                                      />
                                    </>
                                  )}

                                  {/* Show Results Button */}
                                  <button
                                       className={`fancy-3d-btn h-12`}
                                    onClick={() => {
                                      setActiveButton("Result");
                                      handleEvaluationMetrix();
                                    }}
                                 disabled={activeButton === "result"}
                                >
                                  {activeButton === "result"
                                    ? "Processing..."
                                    : "Result"}
                                    </button>

                                  {/* Download Icon */}
                                  {/* <button
                                      className={`text-lg px-4 py-2 border rounded ${
                                        activeButton === "Graph"
                                          ? "bg-blue-500 border-blue-800 text-white"
                                          : "bg-white border-gray-300 text-black"
                                      } `}
                                      onClick={handleShowForecast}
                                    >
                                      Show Forecast
                                    </button> */}
                                  <div
                                    className="cursor-pointer"
                                    onClick={handleDownload}
                                  >
                                    {activeButton === "Result" && (
                                      <FaDownload className="mt-4 text-3xl text-blue-500" />
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          <div>
                            {buttoon1==='1' && isLoading && (
                              <div className="progress-bar-container mt-3">
                                <div className="progress-bar"></div>
                              </div>
                            )}
                            {!isLoading && message &&buttoon1==='1' && (
                              <p
                                className="message-box"
                                style={{
                                  overflow: "hidden", // Prevent overflowing text
                                  whiteSpace: "nowrap", // Prevent wrapping to the next line
                                  textOverflow: "ellipsis", // Add ellipsis for overflow
                                  maxWidth: "98%", // Adjust the width as needed
                                }}
                              >
                                {message}
                              </p> // Display the success or error message
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="pdf-info mt-2 justify-center  dark:bg-[#1e1e1e] bg-[#f7f7f7] ">
                {loading && activeButton === "Graph" && (
                  <p
                    className=" shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg text-center text-2xl"
                    style={{ padding: "10px", height: "80%" }}
                  >
                    Generating Forecast...
                  </p>
                )}
                {loading && activeButton === "Result" && (
                  <p
                    className=" shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg text-center text-2xl"
                    style={{ padding: "10px", height: "80%" }}
                  >
                    Generating Result...
                  </p>
                )}

                {activeButton === "file" &&
                  (loading ? (
                    <p
                      className="shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg text-center text-2xl flex items-center justify-center"
                      style={{ padding: "10px", height: "60%" }}
                    ></p>
                  ) : csvData.length > 0 ? (
                    <div
                      className="shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg overflow-auto"
                      style={{ padding: "1px", height: "60%" }}
                    >
                      <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                      >
                        <thead>
                          <tr>
                            {Object.keys(csvData[0]).map((header, index) => (
                              <th
                                key={index}
                                className="sticky top-0 bg-white z-20 border border-gray-300 px-2 py-2"
                              >
                                {header.charAt(0).toUpperCase() +
                                  header.slice(1)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {Object.values(row).map((value, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  style={{
                                    border: "1px solid #ddd",
                                    padding: "8px",
                                  }}
                                >
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 text-lg py-10">
                      No data uploaded yet.
                    </p>
                  ))}

                {/* Graph Tab */}
                {!loading && activeButton === "Graph" && (
                  <div
                    className="shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg overflow-x-auto overflow-y-scroll"
                    style={{ padding: "10px", height: "60%" }}
                  >
                    <div>
                      <p className="text-center font-bold mb-2">
                        Evaluation Matrix
                      </p>
                      <div
                        className="text-center ml-[35%]"
                        style={{ alignItems: "center" }}
                      >
                        <table className="min-w-[340px] justify-center items-center border-collapse border border-gray-400 text-sm">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="border border-gray-400 px-4 py-2 text-left">
                                #
                              </th>
                              <th className="border border-gray-400 px-4 py-2 text-left">
                                Metric
                              </th>
                              <th className="border border-gray-400 px-4 py-2 text-left">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(
                              metrix?.Evaluation_Metrics || {}
                            ).map(([key, value], idx) => (
                              <tr key={key}>
                                <td className="border border-gray-400 px-4 py-1">
                                  {idx + 1}
                                </td>
                                <td className="border border-gray-400 px-4 py-1">
                                  {key.replaceAll("_", " ")}
                                </td>
                                <td className="border border-gray-400 px-4 py-1">
                                  {typeof value === "number"
                                    ? value.toExponential(6)
                                    : value}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {/* <div
                        style={{
                          width: "100%",
                          margin: "2rem auto",
                          height: "200px",
                        }}
                        ref={chartRef4}
                      >
                        <ForecastGraph1 data={csvResult} />
                      </div> */}
                    </div>
                  </div>
                )}

                {/* Result Tab */}
                {!loading &&
                  activeButton === "Result" &&
                  graphData1.length > 0 &&
                  selectedview === "Index" && (
                    <div
                      className="shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg overflow-x-auto"
                      style={{ padding: "10px", height: "60%" }}
                    >
                      <div
                        style={{
                          width: "100%",
                          margin: "2rem auto",
                          height: "200px",
                        }}
                        ref={chartRef1}
                      >
                        <p className="text-center">Example {graphLabel1}</p>
                        <LineGraph1 data={graphData1} />
                      </div>
                      <div
                        style={{
                          width: "100%",
                          margin: "2rem auto",
                          height: "200px",
                        }}
                        ref={chartRef2}
                      >
                        <p className="text-center">Example {graphLabel2}</p>
                        <LineGraph1 data={graphData2} />
                      </div>
                      <div
                        style={{
                          width: "100%",
                          margin: "2rem auto",
                          height: "200px",
                        }}
                        ref={chartRef3}
                      >
                        <p className="text-center">Example {graphLabel3}</p>
                        <LineGraph1 data={graphData3} />
                      </div>
                    </div>
                  )}
                {!loading &&
                  activeButton === "Result" &&
                  graphData4.length > 0 &&
                  selectedview === "Date" && (
                    <div
                      className="shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg overflow-x-auto"
                      style={{ padding: "10px", height: "60%" }}
                    >
                      <div
                        style={{
                          width: "100%",
                          margin: "2rem auto",
                          height: "200px",
                        }}
                        ref={chartRef1}
                      >
                        <p className="text-center">Example {graphLabel4}</p>
                        <LineGraph1 data={graphData4} />
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </>
        )}
        {databaseActive && (
          <div>Database Connection Content: Connect to your database here.</div>
        )}
        {cloudActive && (
          <div>Cloud Storage Content: Manage your cloud storage services.</div>
        )}
      </div>
    </div>
  );
};

export default DataConnection;
