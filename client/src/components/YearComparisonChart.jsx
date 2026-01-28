import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import axios from "axios";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-xl">
        <p className="text-slate-300 font-bold mb-2 text-sm">Year {label}</p>
        <div className="space-y-1">
          <p className="text-xs text-slate-400">
            Budget:{" "}
            <span className="text-accent font-mono font-bold">
              RM {payload[0].value}
            </span>
          </p>
          <p className="text-xs text-slate-400">
            Spent:{" "}
            <span className="text-emerald-400 font-mono font-bold">
              RM {payload[1].value}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const YearComparisonChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const res = await axios.get("/api/summary/comparison");
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchComparison();
  }, []);

  if (loading || data.length === 0) return null;

  return (
    <div className="glass-premium rounded-3xl p-6 relative overflow-hidden group mt-6 opacity-0 animate-fade-in-up animation-delay-500">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-900/20 opacity-50" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800/50 border border-white/5">
              <ArrowTrendingUpIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold dark:text-slate-200 light:text-slate-700">
                Yearly Comparison
              </h3>
              <p className="text-[10px] text-slate-500">
                Budget vs Actual Distribution
              </p>
            </div>
          </div>
        </div>

        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dy={10}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.05)", radius: 8 }}
              />
              <Bar
                dataKey="total_budget"
                name="Budget"
                radius={[4, 4, 4, 4]}
                maxBarSize={40}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill="url(#colorBudget)"
                    className="opacity-80 hover:opacity-100 transition-opacity"
                  />
                ))}
              </Bar>
              <Bar
                dataKey="total_distributed"
                name="Distributed"
                radius={[4, 4, 4, 4]}
                maxBarSize={40}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill="url(#colorDist)"
                    className="opacity-80 hover:opacity-100 transition-opacity"
                  />
                ))}
              </Bar>

              <defs>
                <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default YearComparisonChart;
