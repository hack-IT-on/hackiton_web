"use client";

import { useState } from "react";

const INTERESTS = [
  "Programming",
  "Design",
  "Marketing",
  "Data Science",
  "Entrepreneurship",
];

export default function EventFilter({ onFilter }) {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    interest: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <div className="flex space-x-4 mb-4">
      <input
        type="date"
        name="startDate"
        onChange={handleChange}
        className="border p-2"
        placeholder="Start Date"
      />
      <input
        type="date"
        name="endDate"
        onChange={handleChange}
        className="border p-2"
        placeholder="End Date"
      />
      <select name="interest" onChange={handleChange} className="border p-2">
        <option value="">All Interests</option>
        {INTERESTS.map((interest) => (
          <option key={interest} value={interest}>
            {interest}
          </option>
        ))}
      </select>
    </div>
  );
}
