import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from "recharts";

// Helper to generate hourly dummy data
function generateEnergyData(startDate, hours, base, amp, noise = 800) {
  const data = [];
  for (let i = 0; i < hours; i++) {
    const dateObj = new Date(new Date(startDate).getTime() + i * 3600 * 1000);
    const hourOfDay = dateObj.getHours();
    const value = Math.round(
      base +
        amp * Math.sin((2 * Math.PI * hourOfDay) / 24) +
        (Math.random() - 0.5) * noise
    );
    // Format: 'YYYY-MM-DD HH:MM'
    const dStr =
      dateObj.toISOString().slice(0, 10) +
      " " +
      dateObj.toISOString().slice(11, 16);
    data.push({ date: dStr, value });
  }
  return data;
}

// Generate data
const trainData = generateEnergyData("2018-12-28T00:00:00", 96, 25000, 6000);
const predictedData = generateEnergyData("2019-01-01T00:00:00", 96, 30000, 2000);
const sepDate = trainData[trainData.length - 1].date; // Ensure exact match

// Merge data
const dataMap = {};
trainData.forEach((d) => {
  dataMap[d.date] = { date: d.date, train: d.value };
});
predictedData.forEach((d) => {
  if (!dataMap[d.date]) dataMap[d.date] = { date: d.date };
  dataMap[d.date].predicted = d.value;
});
const mergedData = Object.values(dataMap).sort((a, b) =>
  a.date.localeCompare(b.date)
);

// Custom X Axis tick: show every Nth date, rotate labels
const N = 24; // Show every 24th label (once per day)
const CustomXAxisTick = ({ x, y, payload, index }) => {
  if (index % N === 0) {
    // Show only date part
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
          {payload.value.split(" ")[0]}
        </text>
      </g>
    );
  }
  return null;
};

export default function LineGraph2() {
  return (
    <div style={{ width: "100%", height: 250 }}>
   
      <ResponsiveContainer width="100%" height="80%">
        <LineChart data={mergedData}>
          <XAxis
            dataKey="date"
            tick={CustomXAxisTick}
            interval={0}
            height={60}
          />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="bottom" align="right" wrapperStyle={{ fontSize: 16 }} />
          <Line
            type="monotone"
            dataKey="train"
            name="Train"
            stroke="#1f77b4"
            dot={false}
            isAnimationActive={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            name="Predicted"
            stroke="#ff7f0e"
            strokeDasharray="8 8"
            dot={false}
            isAnimationActive={false}
            strokeWidth={2}
          />
          <ReferenceLine
            x={sepDate}
            stroke="red"
            strokeDasharray="3 3"
            label={{
              value: sepDate.split(" ")[0],
              position: "top",
              fontSize: 18,
              fill: "black",
            }}
            ifOverflow="visible"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
