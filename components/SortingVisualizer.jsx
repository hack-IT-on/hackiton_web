import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SortingVisualizer = ({ algorithm, speed, isPlaying, onStep }) => {
  const [array, setArray] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [compareIndices, setCompareIndices] = useState([]);
  const [swapIndices, setSwapIndices] = useState([]);

  // Generate random array
  const generateArray = (size = 30) => {
    const newArray = Array.from(
      { length: size },
      () => Math.floor(Math.random() * 100) + 1
    );
    setArray(newArray);
    setCurrentStep(0);
    setSorting(false);
  };

  // Bubble Sort Implementation
  const bubbleSort = async () => {
    const arr = [...array];
    const steps = [];

    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        steps.push({
          type: "compare",
          indices: [j, j + 1],
          array: [...arr],
        });

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push({
            type: "swap",
            indices: [j, j + 1],
            array: [...arr],
          });
        }
      }
    }

    return steps;
  };

  // Execute single step
  const executeStep = (step) => {
    if (!step) return;

    if (step.type === "compare") {
      setCompareIndices(step.indices);
      setSwapIndices([]);
    } else if (step.type === "swap") {
      setSwapIndices(step.indices);
      setCompareIndices([]);
    }

    setArray(step.array);
  };

  useEffect(() => {
    generateArray();
  }, []);

  const getBarColor = (index) => {
    if (compareIndices.includes(index)) return "bg-yellow-500";
    if (swapIndices.includes(index)) return "bg-red-500";
    return "bg-blue-500";
  };

  return (
    <div className="h-full flex items-end justify-center gap-1 p-4">
      {array.map((value, index) => (
        <motion.div
          key={index}
          className={`w-4 ${getBarColor(index)}`}
          style={{
            height: `${value}%`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
};

export default SortingVisualizer;
