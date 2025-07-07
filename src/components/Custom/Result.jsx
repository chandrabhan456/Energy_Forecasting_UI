import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Papa from "papaparse";
import LineGraph2 from "../Graphs/LineGraph2";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import "react-datepicker/dist/react-datepicker.css";
import "./DataConn.css";
import { useStateContext } from "../../contexts/ContextProvider";

const FreqOptions = [
  { value: "Initial", label: "Frequency" },
  { value: "Hourly", label: "Hourly" },
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Yearly", label: "Yearly" },
];

const Result = () => {
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

  const [selectedFreq, setSelectedFreq] = useState(FreqOptions[0].value);
  const [dateStartValue, setDateStartValue] = useState("");
  const [dateEndValue, setDateEndValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(false);
  const [modelData, setModelData] = useState("");
  const [graphData, setGraphData] = useState([]);
  const chartRef1 = useRef();
  const [activeButton2, setActiveButton2] = useState("Graph");
  const navigate = useNavigate(); // Initialize the navigate function
  const handleClick = () => {
    navigate("/validation");
    // Add your function logic here
  };
  const handleClickHome = () => {
    navigate("/mainPage");
    // Add your function logic here
  };
  const handleFreq = (e) => {
    setSelectedFreq(e.target.value);
    setForecast(false);
  };
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
  const handleResult = async () => {
    if (selectedFreq === "Initial") {
      alert("Select Model/Frequency from dropdown.");
    } else {
      setLoading(true);

      try {
        const response = await fetch(
          `http://127.0.0.1:5000/forecast/custom/${selectedModel1}/${formatDate(
            dateStartValue
          )}/${formatDate(dateEndValue)}/${selectedFreq}`,
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
  const handleButtonClick = (button) => {
    setActiveButton2(button);
  };
  useEffect(() => {
    if (modelData) {
      const parsed = parseCSV(modelData);
      setGraphData(parsed);
      console.log("parsed data:", parsed);
    } else {
      setGraphData([]);
    }
  }, [modelData]);

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
            Forecasting with Custom Data
          </button>
        </div>
      </div>
      <div className="flex flex-col items-center mt-16">
        <div className="flex " style={{ marginLeft: "-45%" }}>
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
        </div>
        <div className="flex gap-2 ">
          <div
            className="main-page-dropdown"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left", // or "center" for horizontal centering
              height: "47px",
              minWidth: "120px",
              padding: "0 12px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              background: "#f9f9f9",
              fontSize: "1rem",
              color: "#333",
              userSelect: "none",
            }}
          >
            {selectedModel1}
          </div>

          <div className="flex">
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
                onChange={([date]) => {
                  setDateEndValue(date);
                  setForecast(false);
                }}
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
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button className={`fancy-3d-btn h-12`} onClick={handleResult}>
            Forecast
          </button>
        </div>
      </div>
      <div className="pdf-info mt-2 ml-[10%] justify-center  dark:bg-[#1e1e1e] bg-[#f7f7f7] ">
        {loading && !forecast && (
          <p
            className=" shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg text-center text-3xl"
            style={{ padding: "20px", height: "80%" }}
          >
            Generating Forecast...
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
                <p className="texl-2xl font-bold text-black">
                  {selectedModel1} Forecast
                </p>

                <div
                  style={{
                    width: "100%",
                    margin: "2rem auto",
                    height: "200px",
                  }}
                  ref={chartRef1}
                >
                  <LineGraph2 data={graphData} ModelName={selectedModel1} />
                </div>
              </>
            )}
            {activeButton2 === "Table" && (
              <div
                className="scroll-table-container"
                style={{ marginTop: "10px" }}
              >
                <p className="texl-2xl font-bold text-black">
                  {selectedModel1} Forecast
                </p>

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
                        <th>Total load Prediction</th>
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Result;
