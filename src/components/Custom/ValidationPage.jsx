import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Papa from "papaparse";
import LineGraph1 from "../Graphs/LineGraph1";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import "react-datepicker/dist/react-datepicker.css";
import "./DataConn.css";
import { useStateContext } from "../../contexts/ContextProvider";

const modelOptions = [
  { value: "Initial", label: "Select Model" },
  { value: "TinyTimeMixer", label: "TinyTimeMixer" },
  { value: "XGBoost", label: "XGBoost" },
  { value: "Prophet", label: "Prophet" },
  { value: "Ensemble", label: "Ensemble (XGB+Prophet)" },
  // { value: "All", label: "All Models" },
];

const FreqOptions = [
  { value: "Initial", label: "Frequency" },
  { value: "Hourly", label: "Hourly" },
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Yearly", label: "Yearly" },
];

const ValidationPage = () => {
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
  const [evaluationData, setEvaluationData] = useState("");
  
  const [activeButton2, setActiveButton2] = useState("Graph");
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(false);
  const [modelData, setModelData] = useState("");
   const [modelData1, setModelData1] = useState("");
  const [graphData, setGraphData] = useState([]);
  const [graphData1, setGraphData1] = useState([]);
  const chartRef1 = useRef();

  const navigate = useNavigate(); // Initialize the navigate function
  const handleClick = () => {
    navigate("/dataPage");
    // Add your function logic here
  };
  const handleClickHome = () => {
    navigate("/mainPage");
    // Add your function logic here
  };
  const handleNextClick = () => {
    navigate("/result"); // Navigate to '/secondPage' when the function is called
  };
  const handleChange = (e) => {
    setSelectedModel(e.target.value);
    setForecast(false);
  };
  const handleFreq = (e) => {
    setSelectedFreq(e.target.value);
    setForecast(false);
  };

  const handleButtonClick = (button) => {
    setActiveButton2(button);
  };
  const handleEvaluation = async () => {
    if (selectedModel === "Initial" || selectedFreq === "Initial") {
      alert("Select Model/Frequency from dropdown.");
    } else {
      setLoading(true);
      setSelectedModel1(selectedModel);
      try {
        const response = await fetch(
         `http://127.0.0.1:5000/validation/custom/${selectedModel}/${selectedFreq}`,
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
          setModelData(data.csv_text_validation);
          setModelData1(data.csv_text_actual)
          setEvaluationData(data.eval_metrics)
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
  useEffect(() => {
    if (modelData) {
      const parsed = parseCSV(modelData);
      setGraphData(parsed);
      console.log("parsed data:", parsed);
    }
    if (modelData1) {
      const parsed = parseCSV(modelData1);
      setGraphData1(parsed);
      console.log("parsed data:", parsed);
    }
    else {
      setGraphData([]);
    }
  }, [modelData,modelData1]);

  return (
    <div className="mt-8 ">
      <div className="ml-8 flex">
        <button
          onClick={handleClickHome}
          className="bg-blue-500 border-2 border-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Home
        </button>
        <div className="ml-[30%]">
          <button className="text-black font-bold text-xl bg-transparent border-none  flex items-center p-2">
            Model training on Custom Data
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center mt-16">
        <div className="flex items-start">
          <div className="">
            <button
              className="text-blue-500 bg-transparent border-none cursor-pointer flex items-center p-2"
              onClick={handleClick}
            >
              <svg
                className="mr-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>
          </div>
          <div className="">
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
          </div>
        </div>
        <div>
          <div className="flex gap-2 ">
            <select
              id="model-select"
              value={selectedModel}
              onChange={handleChange}
              className="main-page-dropdown"
            >
              {modelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Dropdown for frequency  */}
            <select
              id="freq-select"
              value={selectedFreq}
              onChange={handleFreq}
              className="main-page-dropdown"
            >
              {FreqOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button className={`fancy-3d-btn h-12`} onClick={handleEvaluation}>
              Train Model
            </button>
          </div>
        </div>{" "}
      </div>

      <div className="pdf-info mt-2- ml-[10%] justify-center  dark:bg-[#1e1e1e] bg-[#f7f7f7] ">
        {loading && !forecast && (
          <p
            className=" shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg text-center text-3xl"
            style={{ padding: "20px", height: "80%" }}
          >
            Training the Model...
          </p>
        )}
        {!loading && forecast && (
          <div
            className="shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg overflow-x-auto overflow-y-scroll"
            style={{ padding: "10px", height: "75%" }}
          >
            <div
              className="button-container"
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <button
                onClick={() => handleButtonClick("Graph")}
                className={`main-page-button ${
                  activeButton2 === "Graph" ? "active" : ""
                }`}
              >
                Graph
              </button>
              <button
                onClick={() => handleButtonClick("Table")}
                className={`main-page-button ${
                  activeButton2 === "Table" ? "active" : ""
                }`}
              >
                Table
              </button>
            </div>
            {activeButton2 === "Graph" && (
              <>
              <p className="texl-2xl font-bold text-black">{selectedModel} Actual v/s Prediction</p>
                <div
                  style={{
                    width: "100%",
                    margin: "2rem auto",
                    height: "200px",
                  }}
                  ref={chartRef1}
                >
                  <LineGraph1 data={graphData} data1={graphData1} ModelName={selectedModel1} />
                </div>
              <div className="flex items-center justify-center min-h-screen bg-white" style={{marginTop:'-25%'}}>
                  <table className="nice-table w-[40%]">
                    <thead>
                      <tr className="bg-blue-400">
                        <th className="px-4 py-2 text-center border-b">Evaluation Metric</th>
                        <th className="px-4 py-2 text-center border-b">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(evaluationData).map(([metric, value]) => (
                        <tr key={metric} className="hover:bg-gray-50">
                          <td className="px-4 py-2 capitalize border-b">
                            {metric}
                          </td>
                          <td className="px-4 py-2 border-b">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {activeButton2 === "Table" && (
              <div
                className="scroll-table-container"
                style={{ marginTop: "10px" }}
              >
                   <p className="texl-2xl font-bold text-black">{selectedModel} Actual v/s Prediction</p>
           
                {selectedModel1 === "All" ? (
                  <table className="nice-table w-[100%]">
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
                  <table className="nice-table w-[100%]">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Actual</th>
                        <th>Predicted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {graphData.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.time}</td>
                          <td>{row["Actual"]}</td>
                          <td>{row["Predicted"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationPage;
