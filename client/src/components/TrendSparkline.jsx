import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const TrendSparkline = ({ data, trend = "up", width = 60, height = 30 }) => {
  // If no data provided, generate mock trend data
  const chartData = data || [
    { value: 20 },
    { value: 25 },
    { value: 22 },
    { value: 28 },
    { value: 30 },
    { value: 35 },
    { value: trend === "up" ? 40 : 25 },
  ];

  const color = trend === "up" ? "#10b981" : "#f59e0b"; // emerald or amber

  return (
    <div style={{ width, height }}>
      <LineChart width={width} height={height} data={chartData}>
        <defs>
          <linearGradient id={`gradient-${trend}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          fill={`url(#gradient-${trend})`}
          animationDuration={1000}
          animationBegin={300}
        />
      </LineChart>
    </div>
  );
};

export default TrendSparkline;
