"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Search,
  Code,
  BarChart,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Constants
const ARRAY_SIZE = 20;
const MIN_VALUE = 1;
const MAX_VALUE = 99;
const DEFAULT_SPEED = 500;

const pseudoCode = {
  linear: `ALGORITHM LinearSearch(A[1...n], target)
  for i = 1 to n
    if A[i] == target
      return i
  return -1`,

  binary: `ALGORITHM BinarySearch(A[1...n], target)
  left = 1
  right = n
  while left <= right
    mid = (left + right) / 2
    if A[mid] == target
      return mid
    else if A[mid] < target
      left = mid + 1
    else
      right = mid - 1
  return -1`,
};

const cCode = {
  linear: `#include <stdio.h>

int linearSearch(int arr[], int n, int target) {
    // Time complexity: O(n)
    for (int i = 0; i < n; i++) {
        // One comparison per element
        if (arr[i] == target) {
            return i; // Found the target
        }
    }
    return -1; // Target not found
}

int main() {
    int arr[] = {/* array values */};
    int n = sizeof(arr) / sizeof(arr[0]);
    int target = /* target value */;
    
    int result = linearSearch(arr, n, target);
    
    if (result != -1) {
        printf("Element found at index %d\\n", result);
    } else {
        printf("Element not found\\n");
    }
    
    return 0;
}`,

  binary: `#include <stdio.h>

int binarySearch(int arr[], int left, int right, int target) {
    // Time complexity: O(log n)
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        // Check if target is present at mid
        if (arr[mid] == target)
            return mid;
            
        // If target greater, ignore left half
        if (arr[mid] < target)
            left = mid + 1;
            
        // If target is smaller, ignore right half
        else
            right = mid - 1;
    }
    
    // Target not found
    return -1;
}

int main() {
    int arr[] = {/* sorted array values */};
    int n = sizeof(arr) / sizeof(arr[0]);
    int target = /* target value */;
    
    int result = binarySearch(arr, 0, n-1, target);
    
    if (result != -1) {
        printf("Element found at index %d\\n", result);
    } else {
        printf("Element not found\\n");
    }
    
    return 0;
}`,
};

const timeComplexities = {
  linear: {
    best: "O(1)",
    average: "O(n/2)",
    worst: "O(n)",
    explanation:
      "Linear search examines each element sequentially until it finds the target or reaches the end. In the best case (target at the beginning), it takes O(1) time. In the worst case (target at the end or not present), it examines all n elements, resulting in O(n) time complexity.",
  },
  binary: {
    best: "O(1)",
    average: "O(log n)",
    worst: "O(log n)",
    explanation:
      "Binary search divides the search interval in half with each comparison. This logarithmic search process results in O(log n) worst-case time complexity. Even with n = 1,000,000 elements, binary search requires at most 20 comparisons, making it significantly faster than linear search for large datasets.",
  },
};

// Searching algorithms implementation
const searchingAlgorithms = {
  linear: {
    name: "Linear Search",
    generate: (arr, target) => {
      const steps = [];
      const auxArray = [...arr];
      let found = false;

      for (let i = 0; i < auxArray.length; i++) {
        steps.push({
          array: [...auxArray],
          current: i,
          found: false,
          range: [],
          comparisons: i + 1,
        });

        if (auxArray[i] === target) {
          found = true;
          steps.push({
            array: [...auxArray],
            current: i,
            found: true,
            range: [],
            comparisons: i + 1,
          });
          break;
        }
      }

      if (!found) {
        steps.push({
          array: [...auxArray],
          current: -1,
          found: false,
          range: [],
          comparisons: auxArray.length,
          notFound: true,
        });
      }

      return steps;
    },
  },
  binary: {
    name: "Binary Search",
    generate: (arr, target) => {
      // Binary search requires a sorted array
      const sortedArr = [...arr].sort((a, b) => a - b);
      const steps = [];
      let left = 0;
      let right = sortedArr.length - 1;
      let found = false;
      let comparisons = 0;

      while (left <= right) {
        comparisons++;
        const mid = Math.floor((left + right) / 2);

        steps.push({
          array: [...sortedArr],
          current: mid,
          range: [left, right],
          found: false,
          comparisons,
        });

        if (sortedArr[mid] === target) {
          found = true;
          steps.push({
            array: [...sortedArr],
            current: mid,
            range: [left, right],
            found: true,
            comparisons,
          });
          break;
        } else if (sortedArr[mid] < target) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      if (!found) {
        steps.push({
          array: [...sortedArr],
          current: -1,
          range: [],
          found: false,
          notFound: true,
          comparisons,
        });
      }

      return { steps, sortedArray: sortedArr };
    },
  },
};

// Complex time complexity visual component
const TimeComplexityVisual = ({ algorithm }) => {
  const complexityData = timeComplexities[algorithm];

  const renderComplexityCurve = () => {
    if (algorithm === "linear") {
      return (
        <svg width="100%" height="200" viewBox="0 0 400 200" className="mt-4">
          <defs>
            <linearGradient
              id="linearGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* Axes */}
          <line
            x1="50"
            y1="150"
            x2="350"
            y2="150"
            stroke="#666"
            strokeWidth="2"
          />
          <line
            x1="50"
            y1="150"
            x2="50"
            y2="20"
            stroke="#666"
            strokeWidth="2"
          />

          {/* Labels */}
          <text x="200" y="180" textAnchor="middle" fill="#666">
            Input Size (n)
          </text>
          <text
            x="30"
            y="85"
            textAnchor="middle"
            fill="#666"
            transform="rotate(-90, 20, 85)"
          >
            Time
          </text>

          {/* O(n) line */}
          <path
            d="M50,150 L350,30"
            stroke="#3b82f6"
            strokeWidth="3"
            fill="none"
          />
          <text x="360" y="30" fill="#3b82f6" fontWeight="bold">
            O(n)
          </text>

          {/* Data points */}
          <circle cx="50" cy="150" r="4" fill="#3b82f6" />
          <circle cx="100" cy="130" r="4" fill="#3b82f6" />
          <circle cx="150" cy="110" r="4" fill="#3b82f6" />
          <circle cx="200" cy="90" r="4" fill="#3b82f6" />
          <circle cx="250" cy="70" r="4" fill="#3b82f6" />
          <circle cx="300" cy="50" r="4" fill="#3b82f6" />
          <circle cx="350" cy="30" r="4" fill="#3b82f6" />
        </svg>
      );
    } else {
      return (
        <svg width="100%" height="200" viewBox="0 0 400 200" className="mt-4">
          <defs>
            <linearGradient id="logGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {/* Axes */}
          <line
            x1="50"
            y1="150"
            x2="350"
            y2="150"
            stroke="#666"
            strokeWidth="2"
          />
          <line
            x1="50"
            y1="150"
            x2="50"
            y2="20"
            stroke="#666"
            strokeWidth="2"
          />

          {/* Labels */}
          <text x="200" y="180" textAnchor="middle" fill="#666">
            Input Size (n)
          </text>
          <text
            x="30"
            y="85"
            textAnchor="middle"
            fill="#666"
            transform="rotate(-90, 20, 85)"
          >
            Time
          </text>

          {/* O(log n) curve */}
          <path
            d="M50,150 Q100,100 350,60"
            stroke="#8b5cf6"
            strokeWidth="3"
            fill="none"
          />
          <text x="360" y="60" fill="#8b5cf6" fontWeight="bold">
            O(log n)
          </text>

          {/* O(n) reference line (lighter) */}
          <path
            d="M50,150 L350,30"
            stroke="#ccc"
            strokeWidth="2"
            strokeDasharray="5,5"
            fill="none"
          />
          <text x="360" y="30" fill="#ccc">
            O(n)
          </text>

          {/* Data points */}
          <circle cx="50" cy="150" r="4" fill="#8b5cf6" />
          <circle cx="100" cy="120" r="4" fill="#8b5cf6" />
          <circle cx="150" cy="100" r="4" fill="#8b5cf6" />
          <circle cx="200" cy="90" r="4" fill="#8b5cf6" />
          <circle cx="250" cy="80" r="4" fill="#8b5cf6" />
          <circle cx="300" cy="70" r="4" fill="#8b5cf6" />
          <circle cx="350" cy="60" r="4" fill="#8b5cf6" />
        </svg>
      );
    }
  };

  return (
    <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Time Complexity Analysis</h3>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <h4 className="font-medium text-sm">Best Case</h4>
          <p className="text-xl font-bold">{complexityData.best}</p>
        </div>
        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
          <h4 className="font-medium text-sm">Average Case</h4>
          <p className="text-xl font-bold">{complexityData.average}</p>
        </div>
        <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
          <h4 className="font-medium text-sm">Worst Case</h4>
          <p className="text-xl font-bold">{complexityData.worst}</p>
        </div>
      </div>

      <p className="mb-4">{complexityData.explanation}</p>

      {renderComplexityCurve()}
    </div>
  );
};

const SearchAlgorithmVisualizer = () => {
  // State
  const [array, setArray] = useState([]);
  const [sortedArray, setSortedArray] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [target, setTarget] = useState(42);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("linear");
  const [showPseudocode, setShowPseudocode] = useState(false);
  const [currentComparisons, setCurrentComparisons] = useState(0);
  const [searchResult, setSearchResult] = useState({ found: false, index: -1 });
  const [currentTab, setCurrentTab] = useState("visualization");
  const animationRef = useRef(null);

  // Initialize array
  const generateArray = () => {
    const newArray = Array.from(
      { length: ARRAY_SIZE },
      () => Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
    );
    setArray(newArray);
    setSortedArray([...newArray].sort((a, b) => a - b));
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setSearchResult({ found: false, index: -1 });
  };

  useEffect(() => {
    generateArray();
  }, []);

  // Animation control
  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      animationRef.current = setTimeout(() => {
        const step = steps[currentStep];
        setCurrentComparisons(step.comparisons);

        if (step.found) {
          setSearchResult({ found: true, index: step.current });
        } else if (step.notFound) {
          setSearchResult({ found: false, index: -1 });
        }

        setCurrentStep(currentStep + 1);
      }, speed);

      return () => clearTimeout(animationRef.current);
    } else if (currentStep >= steps.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps, speed]);

  // Searching controls
  const startSearch = () => {
    setSearchResult({ found: false, index: -1 });
    const arrayToSearch = selectedAlgorithm === "linear" ? array : sortedArray;

    if (selectedAlgorithm === "binary") {
      const { steps: binarySteps, sortedArray: newSortedArray } =
        searchingAlgorithms[selectedAlgorithm].generate(array, target);
      setSteps(binarySteps);
      setSortedArray(newSortedArray);
    } else {
      const linearSteps = searchingAlgorithms[selectedAlgorithm].generate(
        array,
        target
      );
      setSteps(linearSteps);
    }

    setCurrentStep(0);
    setIsPlaying(true);
  };

  const handleStep = () => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      setCurrentComparisons(step.comparisons);

      if (step.found) {
        setSearchResult({ found: true, index: step.current });
      } else if (step.notFound) {
        setSearchResult({ found: false, index: -1 });
      }

      setCurrentStep(currentStep + 1);
    }
  };

  const handleReset = () => {
    generateArray();
    setSearchResult({ found: false, index: -1 });
  };

  const togglePlay = () => {
    if (!steps.length) {
      startSearch();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleTargetChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setTarget(value);
    } else {
      setTarget("");
    }
  };

  const renderArrayVisualization = () => {
    const displayArray = selectedAlgorithm === "binary" ? sortedArray : array;
    const currentStepData = steps[currentStep - 1];

    return (
      <div className="flex flex-wrap gap-2 items-center justify-center">
        {displayArray.map((value, index) => {
          let itemStyle = "bg-blue-500";
          let textColor = "text-white";

          // Highlight based on current step
          if (currentStepData) {
            if (index === currentStepData.current) {
              itemStyle = currentStepData.found
                ? "bg-green-500"
                : "bg-yellow-500";
            } else if (
              currentStepData.range &&
              index >= currentStepData.range[0] &&
              index <= currentStepData.range[1]
            ) {
              itemStyle = "bg-purple-200";
              textColor = "text-gray-800";
            } else if (
              currentStepData.range &&
              (index < currentStepData.range[0] ||
                index > currentStepData.range[1])
            ) {
              itemStyle = "bg-gray-300";
              textColor = "text-gray-800";
            }
          }

          return (
            <motion.div
              key={index}
              className={`flex items-center justify-center w-12 h-12 rounded-lg ${itemStyle} ${textColor} font-medium shadow-md`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {value}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderStatusInfo = () => {
    const currentStepData = steps[currentStep - 1];

    if (!currentStepData) return null;

    return (
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Search Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>
              <span className="font-medium">Comparisons:</span>{" "}
              {currentComparisons}
            </p>
            {currentStepData.range && (
              <p>
                <span className="font-medium">Search Range:</span> [
                {currentStepData.range[0]}, {currentStepData.range[1]}]
              </p>
            )}
          </div>
          <div>
            {searchResult.found ? (
              <p className="text-green-600">
                Found target {target} at index {searchResult.index}
              </p>
            ) : currentStepData.notFound ? (
              <p className="text-red-600">Target {target} not found in array</p>
            ) : (
              <p>Searching for {target}...</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // In the renderCodeVisualizer function, move the displayArray declaration above where it's used

  const renderCodeVisualizer = () => {
    const code = cCode[selectedAlgorithm];
    const currentStepData = steps[currentStep - 1];
    const displayArray = selectedAlgorithm === "binary" ? sortedArray : array;

    // Determine which lines to highlight based on the current step
    let highlightLine = 0;

    if (currentStepData) {
      if (selectedAlgorithm === "linear") {
        if (currentStepData.found) {
          highlightLine = 5; // return i
        } else if (currentStepData.notFound) {
          highlightLine = 8; // return -1
        } else {
          highlightLine = 4; // if comparison
        }
      } else if (selectedAlgorithm === "binary") {
        if (currentStepData.found) {
          highlightLine = 8; // return mid
        } else if (currentStepData.notFound) {
          highlightLine = 20; // return -1
        } else if (currentStepData.current < displayArray.indexOf(target)) {
          highlightLine = 12; // left = mid + 1
        } else {
          highlightLine = 16; // right = mid - 1
        }
      }
    }

    // Replace placeholders in code with actual values
    const populatedCode = code
      .replace("/* array values */", displayArray.join(", "))
      .replace("/* sorted array values */", sortedArray.join(", "))
      .replace("/* target value */", target);

    // Split code into lines for syntax highlighting
    const codeLines = populatedCode.split("\n");

    return (
      <div className="mt-6 bg-gray-900 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-800 text-white font-medium flex items-center">
          <Code className="mr-2 h-4 w-4" />
          <span>C Implementation</span>
        </div>
        <div className="p-4 overflow-auto max-h-96">
          <pre className="text-sm font-mono">
            {codeLines.map((line, index) => (
              <div
                key={index}
                className={`py-1 px-2 ${
                  index === highlightLine
                    ? "bg-yellow-500 bg-opacity-30 -mx-2 rounded"
                    : ""
                }`}
                style={{ transition: "background-color 0.3s" }}
              >
                <span className="text-gray-500 inline-block w-8">
                  {index + 1}
                </span>
                <span className="text-white">{line}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto p-4">
        <Card className="mt-4 p-6">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Select
              value={selectedAlgorithm}
              onValueChange={(value) => {
                setSelectedAlgorithm(value);
                setSteps([]);
                setCurrentStep(0);
                setSearchResult({ found: false, index: -1 });
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Algorithm" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(searchingAlgorithms).map(([key, algo]) => (
                  <SelectItem key={key} value={key}>
                    {algo.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span>Target:</span>
              <Input
                type="number"
                value={target}
                onChange={handleTargetChange}
                className="w-20"
                min={1}
                max={99}
              />
            </div>

            <Button onClick={togglePlay} className="w-24">
              {isPlaying ? (
                <Pause className="mr-2 h-4 w-4" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {isPlaying ? "Pause" : "Play"}
            </Button>

            <Button
              variant="outline"
              onClick={handleStep}
              disabled={currentStep >= steps.length}
            >
              <StepForward className="mr-2 h-4 w-4" />
              Step
            </Button>

            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowPseudocode(!showPseudocode)}
            >
              {showPseudocode ? "Hide" : "Show"} Pseudocode
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm">Speed:</span>
              <Badge variant="secondary">+</Badge>
              <Slider
                className="w-32"
                value={[speed]}
                min={100}
                max={1000}
                step={100}
                onValueChange={(value) => setSpeed(value[0])}
              />
              <Badge variant="secondary">-</Badge>
            </div>
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="visualization">
                <Search className="mr-2 h-4 w-4" />
                Visualization
              </TabsTrigger>
              <TabsTrigger value="code">
                <Code className="mr-2 h-4 w-4" />C Code
              </TabsTrigger>
              <TabsTrigger value="complexity">
                <BarChart className="mr-2 h-4 w-4" />
                Time Complexity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="visualization" className="mt-0">
              <div className="flex flex-col">
                <div className="flex h-full">
                  {showPseudocode && (
                    <div className="w-1/3 p-4 border-r overflow-auto">
                      <h3 className="text-lg font-medium mb-2">Pseudocode</h3>
                      <pre className="text-sm whitespace-pre-wrap p-4 rounded">
                        {pseudoCode[selectedAlgorithm]}
                      </pre>
                    </div>
                  )}
                  <div className={`${showPseudocode ? "w-2/3" : "w-full"} p-6`}>
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-4">
                        {selectedAlgorithm === "binary"
                          ? "Sorted Array"
                          : "Array"}
                      </h3>
                      {renderArrayVisualization()}
                    </div>

                    {currentStep > 0 && renderStatusInfo()}

                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">
                        Algorithm Explanation
                      </h3>
                      <div className="p-4 rounded-lg">
                        {selectedAlgorithm === "linear" ? (
                          <p>
                            Linear Search checks each element sequentially until
                            it finds the target or reaches the end of the array.
                            Time complexity: O(n).
                          </p>
                        ) : (
                          <p>
                            Binary Search requires a sorted array and works by
                            repeatedly dividing the search interval in half.
                            Time complexity: O(log n).
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="mt-0">
              {renderCodeVisualizer()}
              {currentStep > 0 && renderStatusInfo()}
            </TabsContent>

            <TabsContent value="complexity" className="mt-0">
              <TimeComplexityVisual algorithm={selectedAlgorithm} />
              {currentStep > 0 && renderStatusInfo()}
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
};

export default SearchAlgorithmVisualizer;
