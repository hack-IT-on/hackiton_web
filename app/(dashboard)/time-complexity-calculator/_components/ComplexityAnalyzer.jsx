"use client";

import ComplexityBadge from "./ComplexityBadge";
import ComplexityExplanation from "./ComplexityExplanation";

export default function ComplexityAnalyzer({ complexity, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Analyzing code complexity...
        </p>
      </div>
    );
  }

  if (!complexity) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <svg
          className="w-16 h-16 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          ></path>
        </svg>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Enter your code and click "Analyze" to see the time complexity
        </p>
      </div>
    );
  }

  if (complexity.error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <svg
          className="w-16 h-16 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <p className="mt-4 text-red-500">Error: {complexity.error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-center mb-6">
        <ComplexityBadge
          notation={complexity.notation}
          color={complexity.color}
        />
      </div>

      <ComplexityExplanation complexity={complexity} />

      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
        <h3 className="font-medium text-gray-800 dark:text-white mb-2">
          What This Means
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {complexity.explanation}
        </p>
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          {complexity.details}
        </div>
      </div>
    </div>
  );
}
