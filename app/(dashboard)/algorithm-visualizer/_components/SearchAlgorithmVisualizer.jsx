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
import { Play, Pause, RotateCcw, StepForward, Search } from "lucide-react";

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
      <div className="mt-6 p-4  rounded-lg">
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

  return (
    <div className="min-h-screen ">
      {/* <nav className="border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Search Algorithm Visualizer</h1>
        <div className="flex items-center gap-4">
          {currentStep > 0 && steps.length > 0 && (
            <span className="text-sm">
              Step {currentStep} of {steps.length}
            </span>
          )}
        </div>
      </nav> */}

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

          <div className="flex flex-col">
            <div className="flex h-full">
              {showPseudocode && (
                <div className="w-1/3 p-4 border-r overflow-auto">
                  <h3 className="text-lg font-medium mb-2">Pseudocode</h3>
                  <pre className="text-sm whitespace-pre-wrap  p-4 rounded">
                    {pseudoCode[selectedAlgorithm]}
                  </pre>
                </div>
              )}
              <div className={`${showPseudocode ? "w-2/3" : "w-full"} p-6`}>
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-4">
                    {selectedAlgorithm === "binary" ? "Sorted Array" : "Array"}
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
                        Linear Search checks each element sequentially until it
                        finds the target or reaches the end of the array. Time
                        complexity: O(n).
                      </p>
                    ) : (
                      <p>
                        Binary Search requires a sorted array and works by
                        repeatedly dividing the search interval in half. Time
                        complexity: O(log n).
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default SearchAlgorithmVisualizer;
