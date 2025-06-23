import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LineGraph1 = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="Time" tickFormatter={str => str.slice(0, 10)} />
      <YAxis domain={[0, 36000]} ticks={[0, 18000, 36000]} />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="Predicted Consumption"
        name="Actual Data"
        stroke="#1976d2"
        strokeWidth={3}
        dot={false}
      />
      <Line
        type="monotone"
        dataKey="Actual Consumption"
        name="Pred Data"
        stroke="#ff9800"
        strokeDasharray="5 5"
        strokeWidth={3}
        dot={false}
      />
    </LineChart>
  </ResponsiveContainer>
);

export default LineGraph1;