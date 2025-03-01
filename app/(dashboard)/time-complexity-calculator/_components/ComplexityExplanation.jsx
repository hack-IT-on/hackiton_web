import React from "react";

const complexityDescriptions = {
  "O(1)": {
    efficiency: "Excellent",
    name: "Constant Time",
    description:
      "Operations that always take the same amount of time, regardless of input size.",
    examples: "Array access by index, simple calculations, hash table lookups.",
  },
  "O(log n)": {
    efficiency: "Very Good",
    name: "Logarithmic Time",
    description: "Algorithms that divide the problem in half each time.",
    examples:
      "Binary search, balanced binary search trees, certain divide and conquer algorithms.",
  },
  "O(n)": {
    efficiency: "Good",
    name: "Linear Time",
    description: "Performance grows linearly with input size.",
    examples: "Simple iteration, linear search, counting elements.",
  },
  "O(n log n)": {
    efficiency: "Fair",
    name: "Linearithmic Time",
    description: "Better than quadratic but slower than linear.",
    examples: "Efficient sorting algorithms (mergesort, heapsort, quicksort).",
  },
  "O(n²)": {
    efficiency: "Poor",
    name: "Quadratic Time",
    description: "Performance is proportional to the square of the input size.",
    examples: "Nested loops, bubble sort, insertion sort, selection sort.",
  },
  "O(n³)": {
    efficiency: "Very Poor",
    name: "Cubic Time",
    description: "Performance is proportional to the cube of the input size.",
    examples: "Triple nested loops, certain matrix operations.",
  },
  "O(2ⁿ)": {
    efficiency: "Terrible",
    name: "Exponential Time",
    description: "Performance doubles with each additional element.",
    examples:
      "Recursive Fibonacci, brute force solutions to NP-complete problems.",
  },
  "O(n!)": {
    efficiency: "Horrible",
    name: "Factorial Time",
    description: "Performance grows factorially with input size.",
    examples:
      "Generating all permutations, traveling salesman problem (brute force).",
  },
};

export default function ComplexityExplanation({ complexity }) {
  const description = complexityDescriptions[complexity.notation] || {
    efficiency: "Unknown",
    name: "Indeterminate",
    description: "Could not determine a clear pattern.",
    examples: "Complex or unusual algorithm structures.",
  };

  return (
    <div>
      <h3 className="font-medium text-lg text-gray-800 dark:text-white mb-2">
        {description.name}
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Efficiency
          </div>
          <div className="font-medium text-gray-800 dark:text-white mt-1">
            {description.efficiency}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Classification
          </div>
          <div className="font-medium text-gray-800 dark:text-white mt-1">
            {complexity.category}
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <strong>Common Examples:</strong> {description.examples}
        </div>
      </div>
    </div>
  );
}
