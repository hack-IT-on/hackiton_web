import React from "react";
export default function ComplexityBadge({ notation, color }) {
  return (
    <div
      className="inline-flex items-center px-4 py-2 rounded-full text-lg font-bold"
      style={{
        backgroundColor: `${color}20`, // Add transparency to color
        color: color,
        border: `2px solid ${color}`,
      }}
    >
      {notation}
    </div>
  );
}
