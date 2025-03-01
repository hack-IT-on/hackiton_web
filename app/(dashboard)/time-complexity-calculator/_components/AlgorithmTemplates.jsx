"use client";

import { useState } from "react";

// Algorithm templates with their code examples
const templates = [
  {
    name: "Constant Time (O(1))",
    code: `function constantTime(arr) {
  // O(1) - Constant time complexity
  // The size of the input doesn't affect the execution time
  return arr[0];
}`,
  },
  {
    name: "Logarithmic Time (O(log n))",
    code: `function binarySearch(arr, target) {
  // O(log n) - Logarithmic time complexity
  // Binary search on a sorted array
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1; // Target not found
}`,
  },
  {
    name: "Linear Time (O(n))",
    code: `function linearSearch(arr, target) {
  // O(n) - Linear time complexity
  // The time grows linearly with the input size
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      return i;
    }
  }
  return -1; // Target not found
}`,
  },
  {
    name: "Linearithmic Time (O(n log n))",
    code: `function mergeSort(arr) {
  // O(n log n) - Linearithmic time complexity
  // Divide and conquer algorithm
  if (arr.length <= 1) {
    return arr;
  }
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let leftIndex = 0;
  let rightIndex = 0;
  
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] < right[rightIndex]) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }
  
  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
}`,
  },
  {
    name: "Quadratic Time (O(n²))",
    code: `function bubbleSort(arr) {
  // O(n²) - Quadratic time complexity
  // Nested loops result in quadratic time
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
  },
  {
    name: "Exponential Time (O(2ⁿ))",
    code: `function fibonacci(n) {
  // O(2ⁿ) - Exponential time complexity
  // Each call branches into two more calls
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
  },
];

export default function AlgorithmTemplates({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("Select a template");

  const handleSelect = (template) => {
    setSelectedTemplate(template.name);
    onSelect(template.code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span>{selectedTemplate}</span>
        <svg
          className="ml-2 h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {templates.map((template, index) => (
            <div
              key={index}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => handleSelect(template)}
            >
              {template.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
