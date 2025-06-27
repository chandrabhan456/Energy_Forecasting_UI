import React, { useState, useEffect, useRef } from "react";
import "./DataConn.css";

import { RiFileExcel2Fill } from "react-icons/ri";
import Papa from "papaparse";
import { FaDownload } from "react-icons/fa";
import LineGraph1 from "./Graphs/LineGraph1";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useStateContext } from "../contexts/ContextProvider";
import { updateSessionInDb, addHistoryItem } from "../utils/historyDb";

import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import "react-datepicker/dist/react-datepicker.css";

const modelOptions = [
  { value: "Initial", label: "Select Model" },
  { value: "TinyTimeMixer", label: "TinyTimeMixer" },
  { value: "XGBoost", label: "XGBoost" },
  { value: "Prophet", label: "Prophet" },
  { value: "All", label: "All Models" },
];

const FreqOptions = [
  { value: "Initial", label: "Frequency" },
  { value: "Hourly", label: "Hourly" },
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Yearly", label: "Yearly" },
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
  const [selectedFreq, setSelectedFreq] = useState(FreqOptions[0].value);
  const [csvActive, setCsvActive] = useState(true);

  console.log("csvFile1:", csvFile1);
  console.log("activeHistory", activeHistory);
  const [message, setMessage] = useState("");
  const [errmessage, setErrMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [csvFile, setCsvFile] = useState(activeHistory ? csvFile1 : null);

  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateStartValue, setDateStartValue] = useState("");
  const [dateEndValue, setDateEndValue] = useState("");

  const [activeButton, setActiveButton] = useState("none");
  const [modelData, setModelData] = useState("");

  const [forecast, setForecast] = useState(false);
  useEffect(() => {
    setCsvFile(activeHistory ? csvFile1 : null);
    if (activeHistory) {
      setActiveButton("none");
      setForecast(false);
      setMessage("");
      setButton1("1");
    }
  }, [activeHistory, csvFile1]);
  const [graphData, setGraphData] = useState([]);
  const chartRef1 = useRef();

  const [buttoon1, setButton1] = useState("");

  const handleChange = (e) => {
    setSelectedModel(e.target.value);
    setForecast(false);
  };
  const handleFreq = (e) => {
    setSelectedFreq(e.target.value);
    setForecast(false);
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
    setMessage("");
    setSelectedModel(modelOptions[0].value);
    setDateStartValue("");
    setDateEndValue("");
  };

  // Remove the file
  const handleCsvRemove = () => {
    setCsvFile(null);
    setCsvFile1(null);
    setCsvData([]);
    setActiveButton("none");
    setForecast(false);
    setMessage("");
    setSelectedModel(modelOptions[0].value);
    setDateStartValue("");
    setDateEndValue("");
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
  }, [csvData]); // This will run after pdfFiles state is updated

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
            type: "csv_document",
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

  function formatDate(dateString) {
    const dateObj = new Date(dateString);
    const pad = (n) => n.toString().padStart(2, "0");
    return (
      dateObj.getFullYear() +
      "-" +
      pad(dateObj.getMonth() + 1) +
      "-" +
      pad(dateObj.getDate()) +
      "/" +
      pad(dateObj.getHours()) +
      ":" +
      pad(dateObj.getMinutes()) +
      ":" +
      pad(dateObj.getSeconds())
    );
  }

  const handleGenerateForecast = async () => {
    setActiveButton("Graph");
    setModelData("");
    if (selectedModel === "Initial" || selectedFreq === "Initial") {
      alert("Select Model/Frequency from dropdown.");
    } else {
      setLoading(true);

      try {
        const response = await fetch(
          `http://127.0.0.1:5000/forecast/${selectedModel}/${formatDate(
            dateStartValue
          )}/${formatDate(dateEndValue)}`,
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

        if (data) {
          setModelData(data.csv_text_future_forecast);
          setForecast(true);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
        setModelData("");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (modelData) {
      const parsed = parseCSV(modelData);
      setGraphData(parsed);
      console.log("parsed data:", parsed);
    } else {
      setGraphData([]);
    }
  }, [activeButton, modelData]);

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
                  className="cursor-pointer text-nowrap text-blue-700 font-medium text-lg dark:text-[#D3D3D3]"
                >
                  Upload file here,{" "}
                  <span className="underline text-nowrap">click to browse</span>
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
                          <div>
                            {csvFile && (
                              <div className="flex items-center m-0">
                                <RiFileExcel2Fill
                                  style={{
                                    color: "green",
                                    marginTop: "3px",
                                    marginRight: "2px",
                                    width: "24px",
                                  }}
                                />

                                <p
                                  className="truncate dark:text-[#d3d3d3] text-black mr-4"
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
                                  className="ml-2 text-center text-white bg-blue-500 border border-blue-700 rounded px-2"
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
                          <div className=" mt-2 flex  space-x-2 whitespace-nowrap">
                            {/* Button and Status */}
                            {buttoon1 === "1" && (
                              <>
                                <button
                                  className={`fancy-3d-btn h-12 ml-[20%]`}
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
                              <div className="flex gap-2 ">
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
                                <div className="">
                                  <div className="date-picker-container">
                                    <Flatpickr
                                      data-enable-time
                                      value={dateStartValue}
                                      onChange={([date]) => {
                                        setDateStartValue(date);
                                        setForecast(false);
                                      }}
                                      className="date-picker-input"
                                      placeholder="Forecast StartDate"
                                      options={{
                                        enableTime: true,
                                        noCalendar: false,
                                        dateFormat: "Y-m-d/H",
                                        time_24hr: true,
                                      }}
                                    />
                                    {/* Optional: Add a calendar icon here, e.g., from Font Awesome or similar library */}
                                    <span className="date-picker-icon">📅</span>
                                  </div>
                                  <div className="date-picker-container ml-1">
                                    <Flatpickr
                                      data-enable-time
                                      value={dateEndValue}
                                      onChange={([date]) =>{
                                        setDateEndValue(date);
                                        setForecast(false);
                                       } }
                                      className="date-picker-input"
                                      placeholder="Forecast EndDate"
                                      options={{
                                        enableTime: true,
                                        noCalendar: false,
                                        dateFormat: "Y-m-d/H",
                                        time_24hr: true,
                                      }}
                                    />
                                    <span className="date-picker-icon">📅</span>
                                  </div>
                                </div>
                                {/* Dropdown for frequency  */}
                                <select
                                  id="freq-select"
                                  value={selectedFreq}
                                  onChange={handleFreq}
                                  className="main-page-dropdown"
                                >
                                  {FreqOptions.map((option) => (
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
                                >
                                  Generate Forecast
                                </button>
                              </div>
                            )}
                          </div>
                          <div>
                            {buttoon1 === "1" && isLoading && (
                              <div className="progress-bar-container mt-3">
                                <div className="progress-bar"></div>
                              </div>
                            )}
                            {!isLoading && message && buttoon1 === "1" && (
                              <p
                                className="message-box ml-[18%]"
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
                    className=" shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg text-center text-3xl"
                    style={{ padding: "20px", height: "80%" }}
                  >
                    Generating Forecast...
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
                {!loading && activeButton === "Graph" && forecast && (
                  <div
                    className="shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg overflow-x-auto overflow-y-scroll"
                    style={{ padding: "10px", height: "60%" }}
                  >
                    <p className="text-xl font-semibold">Forecast Graph </p>
                    <div
                      style={{
                        width: "100%",
                        margin: "2rem auto",
                        height: "200px",
                      }}
                      ref={chartRef1}
                    >
                      <LineGraph1 data={graphData} ModelName={selectedModel} />
                    </div>
                    <p
                      className="text-xl font-semibold"
                      style={{ marginTop: "80px" }}
                    >
                      Forecast Table{" "}
                    </p>
                    <div
                      className="scroll-table-container"
                      style={{ marginTop: "10px" }}
                    >
                      {selectedModel === "All" ? (
                        <table className="nice-table">
                          <thead>
                            <tr>
                              <th>Time</th>
                              <th>TinyTimeMixer</th>
                              <th>XGBoost</th>
                              <th>Prophet</th>
                            </tr>
                          </thead>
                          <tbody>
                            {graphData.map((row, idx) => (
                              <tr key={idx}>
                                <td>{row.time}</td>
                                <td>{row["TinyTimeMixer"]}</td>
                                <td>{row["XGBoost"]}</td>
                                <td>{row["Prophet"]}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <table className="nice-table">
                          <thead>
                            <tr>
                              <th>Time</th>
                              <th>Total Load Prediction</th>
                            </tr>
                          </thead>
                          <tbody>
                            {graphData.map((row, idx) => (
                              <tr key={idx}>
                                <td>{row.time}</td>
                                <td>{row["total load actual_prediction"]}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}

                {/* Result Tab */}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DataConnection;
