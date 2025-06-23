import React, { useEffect, useState } from "react";
import { GoArrowLeft } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider.jsx";
import { RiFileExcel2Fill } from "react-icons/ri";

export default function HistoryView() {

  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);

  const { history, activeSession, setActiveSession } = useStateContext();
  const navigate = useNavigate(); // Initialize the navigate function
  const handlePageChange = () => {
    navigate("/mainpage"); // Navigate to '/secondPage' when the function is called
  };

  useEffect(() => {
  if (activeSession) {
    const session = history.find(
      s => s.sessionName === activeSession
    );
    // Set csvData to the array of file objects (not just file names)
    setCsvData(session ? session.files : []);
  } else {
    setCsvData([]);
  }
}, [activeSession, history]);


  const handleCsvClick = (fileObject) => {
    if (!fileObject) return;
    setActiveButton("file");
    setLoading(true);
    setCsvData([]); // Reset current data before parsing a new file

    let rowCount = 0; // Initialize a counter to track the number of rows parsed

    Papa.parse(fileObject, {
      header: true,
      skipEmptyLines: true,
      worker: true, // Use a web worker for parsing
      chunk: (results, parser) => {
        const newRows = results.data;
        const remainingRows = 20 - rowCount; // Calculate remaining rows needed to reach 20

        if (remainingRows > 0) {
          // Add only the remaining rows needed to reach 20
          setCsvData((prevData) => [
            ...prevData,
            ...newRows.slice(0, remainingRows),
          ]);
          rowCount += newRows.length;

          if (rowCount >= 20) {
            parser.abort(); // Stop parsing once 20 rows have been processed
          }
        }
      },
      complete: () => {
        setLoading(false);
      },
      error: (error) => {
        console.error("Error parsing CSV file:", error);
        setLoading(false);
      },
    });
  };

//   useEffect(() => {
//     console.log("Updated csvData:", csvData);
//   }, [csvFiles, csvData]); // This will run after pdfFiles state is updated

//   function parseCSV(csv) {
//     const lines = csv.trim().split("\n");
//     const headers = lines[0].split(",").map((h) => h.trim());
//     return lines.slice(1).map((line) => {
//       // This simple parser works for your dummy data, not for complex quoted values
//       const values = line.split(",").map((v) => v.trim());
//       const obj = {};
//       headers.forEach((header, idx) => {
//         obj[header] = values[idx];
//       });
//       return obj;
//     });
//   }

  return (
    <div className="ml-10 mt-5">
      <div
        className="text-blue-500 mt-10 flex cursor-pointer"
        onClick={handlePageChange} // Use the function in the onClick event
      >
        <GoArrowLeft className="text-blue-500 mt-1 ml-1" /> MainPage
      </div>

      <div className="flex">
        {/* {activeSession && (
          <RiFileExcel2Fill
            style={{
              color: "green",
              marginTop: "4px",
              width: "100%", // Use 100% width to fill the allocated space
            }}
          />
        )} */}

        {/* File Name */}
        <p
          className="  truncate dark:text-[#d3d3d3] text-black"
          style={{
            cursor: "pointer",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            width: "40%", // Set width to 20% as specified
            margin: "0",
          }}
        >
          <ul>
            {history.map((session, idx) => (
              <li key={idx}>
                {/* <strong>{session.sessionName}</strong> */}
                <ul>
                  {session.files.map((file, fIdx) => (
                    <li key={fIdx}>{file.name}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <button
            className="ml-1 text-center text-white bg-blue-500 border border-blue-700 rounded "
            style={{
              cursor: "pointer",
              width: "20%", // Set width to 20% for the button
            }}
            onClick={() => handleCsvClick(file)}
          >
            Preview
          </button>
        </p>
      </div>

      {activeSession &&
        (loading ? (
          <p
            className="shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg text-center text-2xl flex items-center justify-center"
            style={{ padding: "10px", height: "80%" }}
          ></p>
        ) : csvData.length > 0 ? (
          <div
            className="shadow-[0_0_24px_4px_theme('colors.blue.200')] rounded-lg overflow-auto"
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

      {/* Graph Tab */}
    </div>
  );
}
