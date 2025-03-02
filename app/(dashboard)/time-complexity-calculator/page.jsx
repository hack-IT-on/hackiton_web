"use client";

import { useState, useEffect } from "react";
import CodeEditor from "./_components/CodeEditor";
import ComplexityAnalyzer from "./_components/ComplexityAnalyzer";
import ComplexityChart from "./_components/ComplexityChart";
import AlgorithmTemplates from "./_components/AlgorithmTemplates";

export default function HomePage() {
  const [code, setCode] = useState("");
  const [complexity, setComplexity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle code change from editor
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    // Reset results when code changes
    if (complexity) {
      setComplexity(null);
    }
  };

  // Load template code
  const handleTemplateSelect = (templateCode) => {
    setCode(templateCode);
    setComplexity(null);
  };

  // Analyze code complexity
  const analyzeComplexity = async () => {
    if (!code.trim()) {
      setError("Please enter some code to analyze");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/time-complexity-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze code");
      }

      const result = await response.json();
      setComplexity(result);
    } catch (err) {
      setError(err.message || "An error occurred during analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen ">
      {/* <Header /> */}

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Code Editor & Templates */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                Algorithm Code
              </h2>

              <AlgorithmTemplates onSelect={handleTemplateSelect} />

              <div className="mt-4">
                <CodeEditor code={code} onChange={handleCodeChange} />
              </div>

              <div className="mt-4">
                <button
                  onClick={analyzeComplexity}
                  disabled={loading || !code.trim()}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Analyzing..." : "Analyze Time Complexity"}
                </button>

                {error && (
                  <div className="mt-3 text-red-500 text-sm">{error}</div>
                )}
              </div>
            </div>
          </div>

          {/* Right column: Results */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                Analysis Results
              </h2>

              <ComplexityAnalyzer complexity={complexity} loading={loading} />
            </div>
          </div>
        </div>

        {/* Complexity Chart (Full Width) */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Big O Complexity Comparison
            </h2>
            <ComplexityChart highlightedComplexity={complexity?.notation} />
          </div>
        </div>
      </div>

      {/* <Footer /> */}
    </main>
  );
}
