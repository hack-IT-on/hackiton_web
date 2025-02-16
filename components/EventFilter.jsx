"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

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

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const resetFilter = () => {
    const initialFilters = {
      startDate: "",
      endDate: "",
      interest: "",
    };
    setFilters(initialFilters);
    onFilter(initialFilters);
    router.refresh();
  };

  return (
    <div className="flex space-x-4 mb-4">
      <input
        type="date"
        name="startDate"
        value={filters.startDate}
        onChange={handleChange}
        className="border p-2"
        placeholder="Start Date"
      />
      <input
        type="date"
        name="endDate"
        value={filters.endDate}
        onChange={handleChange}
        className="border p-2"
        placeholder="End Date"
      />
      <select
        name="interest"
        value={filters.interest}
        onChange={handleChange}
        className="border p-2"
      >
        <option value="">All Interests</option>
        {INTERESTS.map((interest) => (
          <option key={interest} value={interest}>
            {interest}
          </option>
        ))}
      </select>

      <Button variant="default" onClick={resetFilter}>
        Reset filters
      </Button>
    </div>
  );
}
