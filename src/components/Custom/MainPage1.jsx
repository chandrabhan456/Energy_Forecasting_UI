import React, { useState, useEffect, useRef } from "react";
import "./MainPage.css";
import { useStateContext } from "../../contexts/ContextProvider";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaRegCircle, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { RiFileExcel2Fill } from "react-icons/ri";
import LineGraph3 from "../Graphs/LineGraph3";
import LineGraph1 from "../Graphs/LineGraph1";
import LineGraph2 from "../Graphs/LineGraph2";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import { toPng } from "html-to-image";
import { updateSessionInDb, addHistoryItem } from "../../utils/historyDb";
const steps = ["Upload File", "EDA", "Train Model", "Forecast", "Report"];

const modelOptions = [
  { value: "Initial", label: "Select Model" },
  { value: "TinyTimeMixer", label: "TinyTimeMixer" },
  { value: "XGBoost", label: "XGBoost" },
  { value: "Prophet", label: "Prophet" },
  { value: "Ensemble", label: "Ensemble" },
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

const MainPage1 = () => {
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
  const [csvFile, setCsvFile] = useState(
    activeHistory ? csvFile1.fileObject : null
  );
  //UPLOAD
  const [taskIndex, setTaskIndex] = useState(0);
  const [uploadedData, setUploadedData] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeButton, setActiveButton] = useState("none");
  const [viewActive, setViewActive] = useState(0);

  //EDA
  const [imageURL1, setImageURL1] = useState(null);
  const [imageURL2, setImageURL2] = useState(null);
  const [imageMsg1, setImageMsg1] = useState("");
  const [imageMsg2, setImageMsg2] = useState("");
  const [csvTable, setCsvTable] = useState("");
  const [message, setMessage] = useState("");
  const [errmessage, setErrMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeButton2, setActiveButton2] = useState("Info");

  const [tableData, setTableData] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [sentences, setSentences] = useState([]);
  const chartRef1 = useRef();
  //validation
  const [selectedModel, setSelectedModel] = useState(modelOptions[0].value);
  const [selectedFreq, setSelectedFreq] = useState(FreqOptions[0].value);
  const [evaluationData, setEvaluationData] = useState("");
  const [modelData, setModelData] = useState("");
  const [modelData1, setModelData1] = useState("");
  const [graphDataValidation, setGraphDataValidation] = useState([]);
  const [graphDataValidation1, setGraphDataValidation1] = useState([]);
  const [validation, setValidation] = useState(false);
  const chartRef2 = useRef();

  //forecast
  const [dateStartValue, setDateStartValue] = useState("");
  const [dateEndValue, setDateEndValue] = useState("");

  const [forecast, setForecast] = useState(false);
  const [modelDataForecast, setModelDataForecast] = useState("");
  const [graphDataForecast, setGraphDataForecast] = useState([]);
  const chartRef3 = useRef();

  //Report
 const [chartImages, setChartImages] = useState([null, null, null]);
const [shouldGenerateReport, setShouldGenerateReport] = useState(false);
 const [pdfs, setPdfs] = useState([]); // This will store blobs or base64 data

  const navigate = useNavigate(); // Initialize the navigate function
  useEffect(() => {
    setCsvFile(activeHistory ? csvFile1.fileObject : null);
    if (activeHistory) {
      setActiveButton("none");
      setForecast(false);
      setMessage("");
    }
  }, [activeHistory, csvFile1]);

  const handleDiscard = () => {
  // Upload
  setTaskIndex(0);
  setUploadedData(null);
  setCsvData([]);
  setCurrentStep(0);
  setLoading(false);
  setActiveButton("none");
  setViewActive(0);
  setCsvFile()
  // EDA
  setImageURL1(null);
  setImageURL2(null);
  setImageMsg1("");
  setImageMsg2("");
  setCsvTable("");
  setMessage("");
  setErrMessage("");
  setIsLoading(false);
  setActiveButton2("Info");
  setTableData([]);
  setGraphData([]);
  setSentences([]);
  if (chartRef1.current) chartRef1.current = null;

  // Validation
  setSelectedModel(modelOptions[0].value);
  setSelectedFreq(FreqOptions[0].value);
  setEvaluationData("");
  setModelData("");
  setModelData1("");
  setGraphDataValidation([]);
  setGraphDataValidation1([]);
  setValidation(false);
  if (chartRef2.current) chartRef2.current = null;

  // Forecast
  setDateStartValue("");
  setDateEndValue("");
  setForecast(false);
  setModelDataForecast("");
  setGraphDataForecast([]);
  if (chartRef3.current) chartRef3.current = null;

  // Report
  setChartImages([null, null, null]);
  setShouldGenerateReport(false);
  setPdfs([]);
};


  const handleClickHome = () => {
    navigate("/mainPage");
    // Add your function logic here
  };
  const handleNext = () => {
    if (currentStep === 1) {
      saveChartImage(0, chartRef1); // Saves to chartImages[0]
    }
    if (currentStep === 2) {
      saveChartImage(1, chartRef2); // Saves to chartImages[0]
    }
    if (currentStep === 3) {
      setActiveButton2("EDA");
      setCurrentStep(4);
      saveChartImage(2, chartRef3); // Saves to chartImages[0]

      generateReport();
    }
    if (taskIndex === currentStep) {
      setCurrentStep((prev) => prev + 1);
    }
    setTaskIndex((prev) => prev + 1);
  };
  const handleButtonClick = (button) => {
    setActiveButton2(button);
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setCsvData([]);
    setCsvFile(null); // Reset existing

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

    console.log("newly file is");
  };
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
  const handleViewClick = (index) => {
    // Your logic here

    setViewActive(index);
    setTaskIndex(index);
    if (index === 1) {
      setActiveButton2("Info");
    } else if (index === 2 || index === 3) {
      setActiveButton2("Graph");
    } else if (index === 4) {
      setActiveButton2("EDA");
    }
  };
  const handleChange = (e) => {
    setSelectedModel(e.target.value);
    setForecast(false);
  };
  const handleFreq = (e) => {
    setSelectedFreq(e.target.value);
    setForecast(false);
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
    console.log("Updated csvData:", csvData);
  }, [csvData, chartImages]); // This will run after pdfFiles state is updated
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
      setCurrentStep(1);
      setViewActive(1);
      setTaskIndex((prev) => prev + 1);
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
  const handleEvaluation = async () => {
    if (selectedModel === "Initial" || selectedFreq === "Initial") {
      alert("Select Model/Frequency from dropdown.");
    } else {
      setLoading(true);
      setSelectedModel1(selectedModel);
      setActiveButton2("Graph");
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
          setModelData1(data.csv_text_actual);
          setEvaluationData(data.eval_metrics);
          setValidation(true);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
        setModelData("");
      } finally {
        setLoading(false);
      }
    }
  };
  const handleResult = async () => {
    if (selectedFreq === "Initial") {
      alert("Select Model/Frequency from dropdown.");
    } else {
      setLoading(true);
      setActiveButton2("Graph");
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
          setModelDataForecast(data.csv_text_future_forecast);
          setForecast(true);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
        setModelDataForecast("");
      } finally {
        setLoading(false);
      }
    }
  };

const saveChartImage = async (index, ref) => {
  if (ref.current) {
    const dataUrl = await toPng(ref.current);
    setChartImages((prevImages) => {
      const newImages = [...prevImages];
      newImages[index] = dataUrl;
      return newImages;
    });
    setShouldGenerateReport(true); // Mark to generate after image saved
  }
};

useEffect(() => {
  if (shouldGenerateReport && chartImages[2]) {
    generateReport();
    setShouldGenerateReport(false);
  }
}, [chartImages, shouldGenerateReport]);

  function renderChart(doc, y, pageWidth, image, heading) {
  if (image) {
    const imgWidth = 170;
    const origWidth = 800; // your chart ref width in px
    const origHeight = 200; // your chart ref height in px
    const imgHeight = imgWidth * (origHeight / origWidth);
    const imgX = (pageWidth - imgWidth) / 2;
    doc.setFontSize(12);
    doc.text(heading, pageWidth / 2, y, { align: "center" });
    y += 4;
    doc.addImage(image, "PNG", imgX, y, imgWidth, imgHeight);
    y += imgHeight + 10;
  } else {
    doc.text(`[${heading} Placeholder]`, pageWidth / 2, y, {
      align: "center",
    });
    y += 20;
  }
  return y;
}

  function renderTable(doc, y, pageWidth, table, heading) {
    if (table && table.length > 0) {
      doc.setFontSize(14);
      doc.text(heading, pageWidth / 2, y, { align: "center" });
      y += 4;
      const columns = Object.keys(table[0]);
      autoTable(doc, {
        startY: y + 2,
        head: [columns],
        body: table.map((row) => columns.map((col) => row[col])),
        styles: { halign: "center" },
        headStyles: {
          halign: "center",
          fillColor: [41, 128, 185],
          textColor: 255,
        },
        bodyStyles: { halign: "center" },
        theme: "grid",
      });
      y = doc.lastAutoTable.finalY + 10;
    } else {
      doc.text(`[${heading} Placeholder]`, pageWidth / 2, y, {
        align: "center",
      });
      y += 20;
    }
    return y;
  }
 const generateReport = async () => {
  const getPDFBlob = (doc) =>
    new Promise((resolve) => {
      const blob = doc.output("blob");
      resolve(blob);
    });

  // --- EDA Report ---
  const docEDA = new jsPDF();
  let y = 20;
  let pageWidth = docEDA.internal.pageSize.getWidth();

  docEDA.setFontSize(20);
  docEDA.text("EDA Report", pageWidth / 2, y, { align: "center" });
  y += 12;

  docEDA.setFontSize(12);
  sentences.forEach((sentence, idx) => {
    docEDA.text(`${idx + 1}. ${sentence}`, 15, y);
    y += 8;
  });
  y += 8;

  y = renderChart(docEDA, y, pageWidth, chartImages[0], "EDA Chart");
  y = renderTable(docEDA, y, pageWidth, tableData, "EDA Table");
  y = renderChart(docEDA, y, pageWidth, imageURL1, "Image 1");
  y = renderChart(docEDA, y, pageWidth, imageURL2, "Image 2");

  // --- Model Report ---
  const docModel = new jsPDF();
  y = 20;
  pageWidth = docModel.internal.pageSize.getWidth();

  docModel.setFontSize(20);
  docModel.text("Model Report", pageWidth / 2, y, { align: "center" });
  y += 12;

  y = renderChart(docModel, y, pageWidth, chartImages[1], "Model Chart");
  y = renderTable(docModel, y, pageWidth, graphDataValidation, "Model Table");

  // --- Forecast Report ---
  const docForecast = new jsPDF();
  y = 20;
  pageWidth = docForecast.internal.pageSize.getWidth();

  docForecast.setFontSize(20);
  docForecast.text("Forecast Report", pageWidth / 2, y, { align: "center" });
  y += 12;

  y = renderChart(
    docForecast,
    y,
    pageWidth,
    chartImages[2],
    "Forecast Chart"
  );
  y = renderTable(
    docForecast,
    y,
    pageWidth,
    graphDataForecast,
    "Forecast Table"
  );

  // --- Convert all to blobs ---
  const blobs = await Promise.all([
    getPDFBlob(docEDA),
    getPDFBlob(docModel),
    getPDFBlob(docForecast),
  ]);

  // Save blobs in state
  setPdfs(blobs);

  // --- Update history ---
  setHistory((prevHistory) => {
    if (prevHistory.length === 0) return prevHistory;

    const newHistory = prevHistory.map((session) => {
      if (session.sessionName !== activeSessionName) {
        return session;
      }

      const pdfFiles = blobs.map((blob, index) => {
        let pdfFileName;
        switch (index) {
          case 0:
            pdfFileName = "EDA_Report.pdf";
            break;
          case 1:
            pdfFileName = `TrainModel_${selectedModel}_Report.pdf`;
            break;
          case 2:
            pdfFileName =`Forecast_${selectedModel}_Report.pdf`;
            break;
          default:
            pdfFileName = "Unknown_Report.pdf";
        }

        const pdfFileContent = URL.createObjectURL(blob);
        return {
          name: pdfFileName,
          content: pdfFileContent,
          createdAt: new Date().toISOString(),
          type: "pdf_document",
        };
      });

      const updatedSession = {
        ...session,
        files: [...(session.files || []), ...pdfFiles],
      };

      updateSessionInDb(updatedSession);

      return updatedSession;
    });

    return newHistory;
  });
};



  const getBlobUrl = () => {
    if (!pdfs.length) return null;
    let index = 0;
    if (activeButton2 === "Model") index = 1;
    else if (activeButton2 === "Forecast") index = 2;
    const blob = pdfs[index];
    if (!blob) return null;
    
    return URL.createObjectURL(blob);
  };

  useEffect(() => {
    return () => {
      if (pdfs.length) {
        pdfs.forEach((blob) => URL.revokeObjectURL(blob));
      }
    };
  }, [pdfs]);

  useEffect(() => {
    if (csvTable) {
      const parsed = parseCSV(csvTable);
      setTableData(parsed);
    }
    if (modelData) {
      const parsed = parseCSV(modelData);
      setGraphDataValidation(parsed);
      console.log("parsed data:", parsed);
    }
    if (modelData1) {
      const parsed = parseCSV(modelData1);
      setGraphDataValidation1(parsed);
      console.log("parsed data:", parsed);
    } else {
      setGraphData([]);
    }
  }, [
    activeButton,
    uploadedData,
    message,
    modelData,
    modelData1,
    csvTable,
    viewActive,
    taskIndex,
  ]);
  useEffect(() => {
    if (uploadedData) {
      const parsed = parseCSV(uploadedData);
      setGraphData(parsed);
      console.log("parsed data:", parsed);

      setSentences(message.split(". "));
    }
    if (modelDataForecast) {
      const parsed = parseCSV(modelDataForecast);
      setGraphDataForecast(parsed);
      console.log("parsed data:", parsed);
    }
    console.log("Updated chartImages:", chartImages[1]);
  }, [csvData, uploadedData, modelDataForecast, chartImages]); // This will run after pdfFiles state is updated
  return (
    <div className="min-h-screen w-full bg-white text-black main-content  relative">
      <div className="">
        <div className="ml-8 flex">
          <button
            onClick={handleClickHome}
            className="bg-[#578FCA] border-2 rounded-lg text-white w-32"
          >
            Home
          </button>

          <div className=" top-0 right-0   h-14 rounded-lg w-full">
            <button
              className="discard-btn w-32 "
              style={{ marginRight: "-2%" }}
              onClick={handleDiscard}
            >
              Discard
            </button>
          </div>
        </div>
        {/* Discard Button Wrapper with Background Color */}

        <div className="upload-sections-wrapper">
          <div className="upload-section " style={{ marginTop: "%" }}>
            <h2
              className=" upload-section1 config-heading text-center whitespace-nowrap"
              style={{ width: "100%" }}
            >
            Forecast with Custom Data
            </h2>

            <ul className="relative ml-5 mt-10">
              {steps.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start space-x-3 relative whitespace-nowrap"
                >
                  {/* Icon & Line Container */}
                  <div className="flex flex-col items-center">
                    {index < currentStep ? (
                      <div
                        className=" rounded-full  flex items-center justify-center "
                        style={{ backgroundColor: "#3b82f6" }} // You can also use Tailwind's class for background color
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",

                            border: "0px solid #F7F8FB",
                            borderRadius: "50%",
                            position: "relative", // To place icon inside the circle
                            backgroundColor: "#f0f0f0",
                          }}
                        >
                          <FaRegCircle size={40} color="transparent" />{" "}
                          {/* Empty Circle Logo */}
                          <div
                            style={{
                              backgroundColor: "white",
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)", // Centers the inner icon
                            }}
                          >
                            <FaCheckCircle
                              size={40}
                              color="green"
                              className="text-3xl"
                            />{" "}
                            {/* Icon inside the circle */}
                          </div>
                        </div>
                      </div>
                    ) : index === currentStep ? (
                      <div
                        className=" rounded-full  flex items-center justify-center "
                        style={{ backgroundColor: "#3b82f6" }} // You can also use Tailwind's class for background color
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",

                            border: "0px solid #F7F8FB",
                            borderRadius: "50%",
                            position: "relative", // To place icon inside the circle
                            backgroundColor: "#f0f0f0",
                          }}
                        >
                          <FaRegCircle size={40} color="transparent" />{" "}
                          {/* Empty Circle Logo */}
                          <div
                            style={{
                              backgroundColor: "white",
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)", // Centers the inner icon
                            }}
                          >
                            <FaCheckCircle
                              size={40}
                              color="#1e3a8a"
                              className="text-3xl"
                            />{" "}
                            {/* Icon inside the circle */}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <FaRegCheckCircle className="text-gray-400 " size={40} />
                    )}
                    {/* Vertical Line - Avoid Adding Line to Last Step */}
                    {index !== steps.length - 1 && (
                      <div className="w-0.5 h-10 bg-gray-300"></div>
                    )}
                  </div>

                  {/* Step Name (Properly Aligned) */}
                  <span
                    key={index}
                    className={`${
                      index === currentStep
                        ? "text-black font-semibold text-xl whitespace-nowrap"
                        : "text-black font-semibold text-xl"
                    } mt-1 text-l${index !== 0 ? " ml-4" : ""}`}
                    style={{ marginLeft: "-5px" }}
                  >
                    {step}
                  </span>

                  <div className="flex-1" />
                  {/* View Button */}
                  <button
                    disabled={index > currentStep}
                    onClick={() => handleViewClick(index)}
                    className={`px-6 py-2 rounded font-semibold transition-colors duration-300
          ${
            index < currentStep
              ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
              : "bg-gray-300 text-gray-400 cursor-not-allowed"
          }`}
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="upload-section "
            style={{ marginTop: "%", width: "60%" }}
          >
            <h2
              className="upload-section1 config-heading text-center whitespace-nowrap"
              style={{ width: "100%" }}
            >
              {steps[taskIndex]}
            </h2>
            {taskIndex === 0 && (
              <>
                <div className="w-[50%] mt-3 h-32 mx-auto flex flex-col items-center bg-blue-50 border-2 border-blue-300 border-dashed rounded-xl p-2 transition hover:shadow-lg hover:bg-blue-100">
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
                    <span className="underline text-nowrap">
                      click to browse
                    </span>
                    {/* <div className="text-xs text-center text-blue-400 mt-2">
                    Supported: .csv, .xls, .xlsx
                  </div> */}
                  </label>
                </div>
                <div className="flex items-center justify-center ">
                  <div className="w-1/2 bg-white p-1">
                    {csvFile && (
                      <div className="flex items-center mt-2 ml-2">
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
                          onClick={() => handleCsvClick(csvFile.fileObject)}
                        >
                          Preview
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {csvFile && (
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button
                      className="fancy-3d-btn h-12 mt-2"
                      onClick={handleUpload}
                    >
                      Upload
                    </button>
                  </div>
                )}
                <div>
                  {isLoading && (
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <div className="progress-bar-container mt-3">
                        <div className="progress-bar"></div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            {activeButton === "file" &&
              (loading ? (
                <p
                  className="shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg text-center text-2xl flex items-center justify-center"
                  style={{ padding: "10px", height: "80%" }}
                ></p>
              ) : csvData.length > 0 ? (
                <div
                  className="border rounded-lg overflow-auto"
                  style={{ padding: "1px", height: "90%" }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {Object.keys(csvData[0]).map((header, index) => (
                          <th
                            key={index}
                            className="sticky top-0 bg-white z-20 border border-gray-300 px-2 py-2"
                          >
                            {header.charAt(0).toUpperCase() + header.slice(1)}
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
            {taskIndex === 1 && (
              <>
                <div
                  className="shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg overflow-x-auto overflow-y-scroll "
                  style={{ padding: "10px", height: "81%" }}
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
                          height: "410px",
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
                              <strong className="text-2xl text-black">.</strong>{" "}
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
                          <LineGraph3 data={graphData} ModelName="" />
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
                <div className=" top-0 right-0 mt-2  h-14 rounded-lg w-full">
                  <button className="next-btn  " onClick={handleNext}>
                    Train Model
                  </button>
                </div>
              </>
            )}
            {taskIndex === 2 && (
              <>
                <div className="flex items-center justify-center gap-2 ">
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

                  <button
                    className={`fancy-3d-btn h-12`}
                    onClick={handleEvaluation}
                  >
                    Train Model
                  </button>
                </div>
                <div
                  className="mt-1 rounded-lg overflow-x-auto overflow-y-scroll "
                  style={{ padding: "10px", height: "73%" }}
                >
                  {loading && !validation && (
                    <p
                      className="shadow-[0_0_24px_4px_theme('colors.blue.200')]   text-center text-3xl"
                      style={{ padding: "20px", height: "100%" }}
                    >
                      Training the Model...
                    </p>
                  )}
                  {!loading && validation && (
                    <div
                      className=" shadow-[0_0_24px_4px_theme('colors.blue.200')]  overflow-x-auto overflow-y-scroll"
                      style={{ padding: "10px", height: "100%" }}
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
                          onClick={() => handleButtonClick("Evaluation")}
                          className={`main-page-button ${
                            activeButton2 === "Evaluation" ? "active" : ""
                          }`}
                        >
                          Evaluation
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
                          <p className="texl-2xl flex items-center justify-center font-bold text-black">
                            {selectedModel} Actual v/s Prediction
                          </p>
                          <div
                            style={{
                              width: "100%",
                              margin: "2rem auto",
                              height: "200px",
                            }}
                            ref={chartRef2}
                          >
                            <LineGraph1
                              data={graphDataValidation}
                              data1={graphDataValidation1}
                              ModelName={selectedModel1}
                            />
                          </div>
                        </>
                      )}
                      {activeButton2 === "Evaluation" && (
                        <>
                          <div
                            className="flex items-center justify-center  bg-white"
                            style={{ marginTop: "-%" }}
                          >
                            <table className="nice-table w-[40%]">
                              <thead>
                                <tr className="bg-blue-400">
                                  <th className="px-4 py-2 text-center border-b">
                                    Evaluation Metric
                                  </th>
                                  <th className="px-4 py-2 text-center border-b">
                                    Value
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(evaluationData).map(
                                  ([metric, value]) => (
                                    <tr
                                      key={metric}
                                      className="hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-2 capitalize border-b">
                                        {metric}
                                      </td>
                                      <td className="px-4 py-2 border-b">
                                        {value}
                                      </td>
                                    </tr>
                                  )
                                )}
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
                          <p className="texl-2xl flex items-center justify-center font-bold text-black">
                            {selectedModel} Actual v/s Prediction
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
                                {graphDataValidation.map((row, idx) => (
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
                                {graphDataValidation.map((row, idx) => (
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
                <div className=" top-0 right-0 mt-1  h-14 rounded-lg w-full">
                  {validation && (
                    <button className="next-btn  " onClick={handleNext}>
                      Forecast
                    </button>
                  )}
                </div>
              </>
            )}
            {taskIndex == 3 && (
              <>
                <div className="flex items-center justify-center gap-2 ">
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

                  <button
                    className={`fancy-3d-btn h-12`}
                    onClick={handleResult}
                  >
                    Forecast
                  </button>
                </div>
                <div
                  className=" mt-1 rounded-lg overflow-x-auto overflow-y-scroll "
                  style={{ padding: "10px", height: "73%" }}
                >
                  {" "}
                  {loading && !forecast && (
                    <p
                      className=" shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg text-center text-3xl"
                      style={{ padding: "20px", height: "100%" }}
                    >
                      Generating Forecast...
                    </p>
                  )}
                  {!loading && forecast && (
                    <div
                      className="shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg overflow-x-auto overflow-y-scroll"
                      style={{ padding: "10px", height: "100%" }}
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
                          <p className="texl-2xl flex items-center justify-center font-bold text-black">
                            {selectedModel1} Forecast
                          </p>

                          <div
                            style={{
                              width: "100%",
                              margin: "2rem auto",
                              height: "200px",
                            }}
                            ref={chartRef3}
                          >
                            <LineGraph2
                              data={graphDataForecast}
                              ModelName={selectedModel1}
                            />
                          </div>
                        </>
                      )}
                      {activeButton2 === "Table" && (
                        <div
                          className="scroll-table-container"
                          style={{ marginTop: "10px" }}
                        >
                          <p className="texl-2xl flex items-center justify-center font-bold text-black">
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
                                {graphDataForecast.map((row, idx) => (
                                  <tr key={idx}>
                                    <td>{row.time}</td>
                                    <td>
                                      {row["total load actual_prediction"]}
                                    </td>
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
                <div className=" top-0 right-0 mt-1  h-14 rounded-lg w-full">
                  {forecast && (
                    <button className="next-btn  " onClick={() => handleNext()}>
                      Generate Report
                    </button>
                  )}
                </div>
              </>
            )}
            {taskIndex == 4 && (
              <>
                <div
                  className="button-container"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <button
                    onClick={() => handleButtonClick("EDA")}
                    className={`main-page-button1 ${
                      activeButton2 === "EDA" ? "active" : ""
                    }`}
                  >
                    EDA Report
                  </button>
                  <button
                    onClick={() => handleButtonClick("Model")}
                    className={`main-page-button1 ${
                      activeButton2 === "Model" ? "active" : ""
                    }`}
                  >
                    Model Report
                  </button>
                  <button
                    onClick={() => handleButtonClick("Forecast")}
                    className={`main-page-button1  ${
                      activeButton2 === "Forecast" ? "active" : ""
                    }`}
                  >
                    Forecast Report
                  </button>
                </div>
                <div>
                  {getBlobUrl() ? (
                    <iframe
                      key={activeButton2}
                      src={getBlobUrl()}
                      width="100%"
                      height="500px"
                      style={{ border: "1px solid #ccc", borderRadius: "4px" }}
                      title="PDF Preview"
                    />
                  ) : (
                    <div style={{ textAlign: "center", color: "#888" }}>
                      No PDF generated yet.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage1;
