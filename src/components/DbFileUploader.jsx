import React, { useState } from 'react';
import initSqlJs from 'sql.js';

// Component to upload and preview a .db file with multiple tables
const DbFileUploader = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [error, setError] = useState(null);
  const [arrayBuffer, setArrayBuffer] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        setArrayBuffer(arrayBuffer);

        const SQL = await initSqlJs({ locateFile: fileName => `https://sql.js.org/dist/${fileName}` });
        const db = new SQL.Database(new Uint8Array(arrayBuffer));

        const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table';");

        if (tablesResult.length > 0) {
          const tableNames = tablesResult[0].values.map(row => row[0]);
          setTables(tableNames);
          setError(null);
          console.log("Tables found:", tableNames);
        } else {
          setError('No tables found in the database.');
          console.log("No tables found.");
        }
      } catch (err) {
        setError('Error reading the database file. Please ensure it is a valid SQLite database.');
        console.error("Error reading database:", err);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleTableSelect = (tableName) => {
    console.log("Selected table:", tableName);
    setSelectedTable(tableName);
    fetchTableData(tableName);
  };

  const fetchTableData = async (tableName) => {
    if (!tableName || !arrayBuffer) {
      console.log("Invalid table name or arrayBuffer missing.");
      return;
    }

    try {
      const SQL = await initSqlJs({ locateFile: fileName => `https://sql.js.org/dist/${fileName}` });
      const db = new SQL.Database(new Uint8Array(arrayBuffer));

      const tableDataResult = db.exec(`SELECT * FROM ${tableName};`);
      if (tableDataResult.length > 0) {
        setTableData(tableDataResult[0]);
        console.log(`Data for table ${tableName}:`, tableDataResult[0]);
      } else {
        setTableData(null);
        console.log(`No data found for table ${tableName}.`);
      }
    } catch (err) {
      setError('Error fetching table data.');
      console.error("Error fetching table data:", err);
    }
  };

  return (
    <div className='mt-10 ml-10'>
      <input type="file" accept=".db" onChange={handleFileUpload} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {tables.length > 0 && (
        <div>
          <h2>Select a table to preview:</h2>
          <ul>
            {tables.map((tableName, index) => (
              <li key={index}>
                <button onClick={() => handleTableSelect(tableName)}>
                  {tableName}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedTable && tableData && (
        <div>
          <h3>Previewing table: {selectedTable}</h3>
          <table border="1">
            <thead>
              <tr>
                {tableData.columns.map((col, index) => (
                  <th key={index}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.values.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((value, colIndex) => (
                    <td key={colIndex}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DbFileUploader;
