import React, { useState, useEffect, useRef } from "react";
import "./DataConn.css";
import { RiFileExcel2Fill } from "react-icons/ri";
import Papa from "papaparse";
import LineGraph3 from "../Graphs/LineGraph3";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
import { updateSessionInDb, addHistoryItem } from "../../utils/historyDb";

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
    selectedModel1,
    setSelectedModel1,
  } = useStateContext();
  const [selectedModel, setSelectedModel] = useState(modelOptions[0].value);
  const [selectedFreq, setSelectedFreq] = useState(FreqOptions[0].value);
  const [csvActive, setCsvActive] = useState(true);

  console.log("csvFile1:", csvFile1);
  console.log("activeHistory", activeHistory);
  const [message, setMessage] = useState("");
  const [errmessage, setErrMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [csvFile, setCsvFile] = useState(
    activeHistory ? csvFile1.fileObject : null
  );
  const [uploadedData, setUploadedData] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateStartValue, setDateStartValue] = useState("");
  const [dateEndValue, setDateEndValue] = useState("");
  const [imageURL1, setImageURL1] = useState(null);
  const [imageURL2, setImageURL2] = useState(null);
  const [imageMsg1, setImageMsg1] = useState("");
  const [imageMsg2, setImageMsg2] = useState("");
  const [tableData, setTableData] = useState([]);
  const [csvTable, setCsvTable] = useState("");
  const [activeButton, setActiveButton] = useState("none");
  const [modelData, setModelData] = useState("");
  const [activeButton2, setActiveButton2] = useState("Info");
  const [forecast, setForecast] = useState(false);
  useEffect(() => {
    setCsvFile(activeHistory ? csvFile1.fileObject : null);
    if (activeHistory) {
      setActiveButton("none");
      setForecast(false);
      setMessage("");
      setButton1("1");
    }
  }, [activeHistory, csvFile1]);
  const [graphData, setGraphData] = useState([]);
  const [sentences, setSentences] = useState([]);
  const chartRef1 = useRef();

  const [buttoon1, setButton1] = useState("");
  const navigate = useNavigate(); // Initialize the navigate function
  const handleChange = (e) => {
    setSelectedModel(e.target.value);
    setForecast(false);
  };
  const handleFreq = (e) => {
    setSelectedFreq(e.target.value);
    setForecast(false);
  };
  const handleClick = () => {
    navigate("/mainPage"); // Navigate to '/secondPage' when the function is called
  };

  const handleNextClick = () => {
    navigate("/Validation"); // Navigate to '/secondPage' when the function is called
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
    console.log("newly file is");
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
    console.log("newly file is", csvFile);
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
      setUploadedData(data.csv_Input_DataPlot);

      // Set image URLs using base64 data from the API response
      const imageURL1 = `data:image/png;base64,${data.plt_hourlydemand}`;
      const imageURL2 = `data:image/png;base64,${data.plt_yearlydemand}`;

      setImageURL1(imageURL1); // Assuming you have a state for imageURL1
      setImageURL2(imageURL2); // Assuming you have a state for imageURL2
      setImageMsg1(data.plt_hourlydemand_message);
      setImageMsg2(data.plt_yearlydemand_message);
      setCsvTable(data.csv_text_Statistics_Data);
      setForecast(true);
      // Read file content as text
      const content = await csvFile.fileObject.text();

      // Create new session object
      const newSession = {
        sessionName: `Session ${history.length + 1}`,
        files: [
          {
            fileObject: csvFile,
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
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrMessage(`Error uploading file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("activeSessionName changed:", activeSessionName);
  }, [activeSessionName]);


  useEffect(() => {
    if (uploadedData) {
      const parsed = parseCSV(uploadedData);
      setGraphData(parsed);
      console.log("parsed data:", parsed);

      setSentences(message.split(". "));
    }
    if (csvTable) {
      const parsed = parseCSV(csvTable);
      setTableData(parsed);
    } else {
      setGraphData([]);
    }
  }, [activeButton, uploadedData, message, csvTable]);

  const handleButtonClick = (button) => {
    setActiveButton2(button);
  };
  const handleClickHome = () => {
    navigate("/mainPage");
    // Add your function logic here
  };
  return (
    <div className="mt-8 ">
      <div className="ml-8">
        <button
          onClick={handleClickHome}
          className="bg-blue-500 border-2 border-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Home
        </button>
      </div>
      <div className="mt-1 ml-[12%] flex flex-col  space-y-2 w-full ">
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
                          <div className="flex">
                            {csvFile && (
                              <div className="flex items-center m-0 ml-2">
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
                                  className={`fancy-3d-btn h-12 ml-[26%]`}
                                  onClick={handleUpload}
                                  disabled={activeButton === "Upload"}
                                >
                                  Upload
                                </button>
                                <button
                                  className={`flex items-center p-2 border-none bg-transparent 
                                          ${
                                            forecast
                                              ? "text-blue-500 cursor-pointer hover:bg-blue-50"
                                              : "text-gray-400 cursor-not-allowed"
                                          }`}
                                  onClick={handleNextClick}
                                  disabled={!forecast}
                                >
                                  Next
                                  <svg
                                    className="ml-2 w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </button>
                              </>
                            )}
                            
                          </div>
                          <div>
                            {buttoon1 === "1" && isLoading && (
                              <div className="progress-bar-container mt-3">
                                <div className="progress-bar"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="pdf-info mt-2 justify-center  dark:bg-[#1e1e1e] bg-[#f7f7f7] ">
              

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
                {/*upload section */}
                {!isLoading && activeButton === "Upload" && (
                  <div
                    className="shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg overflow-x-auto overflow-y-scroll"
                    style={{ padding: "10px", height: "60%" }}
                  >
                    {/* Button Container */}
                    <div
                      className="button-container"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "20px",
                      }}
                    >
                      <button
                        onClick={() => handleButtonClick("Info")}
                        className={`main-page-button ${
                          activeButton2 === "Info" ? "active" : ""
                        }`}
                      >
                        Info
                      </button>
                      <button
                        onClick={() => handleButtonClick("Table")}
                        className={`main-page-button ${
                          activeButton2 === "Table" ? "active" : ""
                        }`}
                      >
                        Table
                      </button>
                      <button
                        onClick={() => handleButtonClick("Graph1")}
                        className={`main-page-button ${
                          activeButton2 === "Graph1" ? "active" : ""
                        }`}
                      >
                        Graph1
                      </button>
                      <button
                        onClick={() => handleButtonClick("Graph2")}
                        className={`main-page-button ${
                          activeButton2 === "Graph2" ? "active" : ""
                        }`}
                      >
                        Graph2
                      </button>
                    </div>

                    {/* Conditional Content Rendering */}
                    {activeButton2 === "Info" && (
                      <div style={{ textAlign: "left", marginLeft: "10%" }}>
                        <div
                          style={{
                            height: "360px",
                            overflowY: "auto",
                            paddingRight: "8px",
                          }}
                        >
                          {sentences.map((sentence, index) => (
                            <p
                              key={index}
                              style={{ color: index === 0 ? "green" : "blue" }}
                            >
                              <div className="flex">
                                <strong className="text-2xl text-black">
                                  .
                                </strong>{" "}
                                <p className="text-lg ml-2"> {sentence}</p>
                              </div>
                            </p>
                          ))}
                          <div
                            style={{
                              width: "100%",
                              textAlign: "left",

                              margin: "1rem auto",
                              height: "200px",
                            }}
                            ref={chartRef1}
                          >
                            <LineGraph3
                              data={graphData}
                              ModelName={selectedModel}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeButton2 === "Graph1" && imageURL1 && (
                      <>
                        <div className="graph-image">
                          <img src={imageURL1} alt="Graph 1" />
                        </div>
                        <div className="font-bold">{imageMsg1}</div>
                      </>
                    )}

                    {activeButton2 === "Graph2" && imageURL2 && (
                      <>
                        <div className="graph-image">
                          <img src={imageURL2} alt="Graph 2" />
                        </div>
                        <div className="font-bold">{imageMsg2}</div>
                      </>
                    )}
                    {activeButton2 === "Table" && tableData && (
                      <>
                        <table className="nice-table ml-[10%] w-[80%]">
                          <thead>
                            <tr>
                              <th>Year</th>
                              <th>Mean Energy Consumption</th>
                              <th>Standard Deviation of Energy Consumption</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tableData.map((row, idx) => (
                              <tr key={idx}>
                                <td>{row.Year}</td>
                                <td>{row["Mean Energy Consumption"]}</td>
                                <td>
                                  {
                                    row[
                                      "Standard Deviation of Energy Consumption"
                                    ]
                                  }
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                )}

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DataConnection;
