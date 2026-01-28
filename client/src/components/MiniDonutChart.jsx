import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const MiniDonutChart = ({ distributed, total, size = 80 }) => {
  const remaining = total - distributed;
  const distributedPercentage = total > 0 ? (distributed / total) * 100 : 0;

  const data = [
    { name: "Distributed", value: distributed },
    { name: "Remaining", value: remaining },
  ];

  const COLORS = {
    distributed: "#10b981", // emerald-500
    remaining: "#fbbf24", // accent gold
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="90%"
          paddingAngle={2}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
          animationDuration={800}
          animationBegin={200}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={index === 0 ? COLORS.distributed : COLORS.remaining}
              stroke="none"
            />
          ))}
        </Pie>
      </PieChart>

      {/* Center percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs font-bold text-emerald-400 leading-none">
            {distributedPercentage.toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniDonutChart;
