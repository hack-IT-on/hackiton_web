"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Dynamically import the chart component to avoid SSR issues
// const LineChart = dynamic(
//   () => import("recharts").then((mod) => mod.LineChart),
//   { ssr: false }
// );
// const Line = dynamic(() => import("recharts").then((mod) => mod.Line), {
//   ssr: false,
// });
// const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
//   ssr: false,
// });
// const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
//   ssr: false,
// });
// const CartesianGrid = dynamic(
//   () => import("recharts").then((mod) => mod.CartesianGrid),
//   { ssr: false }
// );
// const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
//   ssr: false,
// });
// const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), {
//   ssr: false,
// });
// const ResponsiveContainer = dynamic(
//   () => import("recharts").then((mod) => mod.ResponsiveContainer),
//   { ssr: false }
// );

// Generate complexity data points
const generateComplexityData = (n) => {
  const data = [];
  for (let i = 1; i <= n; i++) {
    const entry = {
      n: i,
      "O(1)": 1,
      "O(log n)": Math.log2(i) || 0.1,
      "O(n)": i,
      "O(n log n)": i * (Math.log2(i) || 0.1),
      "O(n²)": i * i,
      "O(2ⁿ)": Math.min(1000, Math.pow(2, i)), // Cap to avoid overflow
    };

    // For small values, scale up some complexities to make them visible
    if (i < 5) {
      entry["O(1)"] = 1;
      entry["O(log n)"] = Math.max(0.5, entry["O(log n)"]);
    }

    data.push(entry);
  }
  return data;
};

// Color mapping for different complexity notations
const complexityColors = {
  "O(1)": "#4ade80", // Green
  "O(log n)": "#a3e635", // Light green
  "O(n)": "#facc15", // Yellow
  "O(n log n)": "#fb923c", // Orange
  "O(n²)": "#f87171", // Red
  "O(2ⁿ)": "#dc2626", // Dark red
};

export default function ComplexityChart({ highlightedComplexity }) {
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    setMounted(true);
    setChartData(generateComplexityData(15)); // Generate data points for n=1 to n=15
  }, []);

  // No SSR rendering
  if (!mounted) return null;

  // Get stroke width based on whether this is the highlighted complexity
  const getStrokeWidth = (notation) => {
    return notation === highlightedComplexity ? 3 : 1;
  };

  // Get opacity based on highlighted complexity
  const getOpacity = (notation) => {
    if (!highlightedComplexity) return 1;
    return notation === highlightedComplexity ? 1 : 0.3;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="n"
            label={{
              value: "Input Size (n)",
              position: "insideBottomRight",
              offset: -10,
            }}
          />
          <YAxis
            label={{ value: "Operations", angle: -90, position: "insideLeft" }}
          />
          <Tooltip formatter={(value) => Math.round(value * 100) / 100} />
          <Legend />

          <Line
            type="monotone"
            dataKey="O(1)"
            name="O(1) - Constant"
            stroke={complexityColors["O(1)"]}
            strokeWidth={getStrokeWidth("O(1)")}
            opacity={getOpacity("O(1)")}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="O(log n)"
            name="O(log n) - Logarithmic"
            stroke={complexityColors["O(log n)"]}
            strokeWidth={getStrokeWidth("O(log n)")}
            opacity={getOpacity("O(log n)")}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="O(n)"
            name="O(n) - Linear"
            stroke={complexityColors["O(n)"]}
            strokeWidth={getStrokeWidth("O(n)")}
            opacity={getOpacity("O(n)")}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="O(n log n)"
            name="O(n log n) - Linearithmic"
            stroke={complexityColors["O(n log n)"]}
            strokeWidth={getStrokeWidth("O(n log n)")}
            opacity={getOpacity("O(n log n)")}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="O(n²)"
            name="O(n²) - Quadratic"
            stroke={complexityColors["O(n²)"]}
            strokeWidth={getStrokeWidth("O(n²)")}
            opacity={getOpacity("O(n²)")}
            dot={false}
          />

          <Line
            type="monotone"
            dataKey="O(2ⁿ)"
            name="O(2ⁿ) - Exponential"
            stroke={complexityColors["O(2ⁿ)"]}
            strokeWidth={getStrokeWidth("O(2ⁿ)")}
            opacity={getOpacity("O(2ⁿ)")}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
