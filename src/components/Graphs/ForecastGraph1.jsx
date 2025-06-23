import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

const ForecastGraph1 = ({ csvData }) => {
  // Check if csvData is a valid string before parsing
  if (typeof csvData !== 'string' || csvData.trim() === '') {
    console.error('Invalid CSV data provided');
    return null;
  }

  try {
    // Parse the CSV data
    const results = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    const parsedData = results.data.map(item => ({
      time: item.time,
      totalLoadActual: parseFloat(item['total load actual']),
    }));

    console.log('Parsed data for chart:', parsedData);

    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={parsedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={(str) => str.slice(0, 10)} />
          <YAxis domain={[0, 36000]} ticks={[0, 18000, 36000]} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="tota load actual"
            name="Actual Data"
            stroke="#1976d2"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  } catch (error) {
    console.error('Error parsing CSV data:', error);
    return null;
  }
};

export default ForecastGraph1;
