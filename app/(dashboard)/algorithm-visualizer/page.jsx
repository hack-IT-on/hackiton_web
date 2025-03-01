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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TreeVisualizer from "./_components/TreeVisualizer";
import { Play, Pause, RotateCcw, StepForward, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SearchAlgorithmVisualizer from "./_components/SearchAlgorithmVisualizer";
import EnhancedLinkedListVisualizer from "./_components/EnhancedLinkedListVisualizer";

// Constants
const ARRAY_SIZE = 30;
const MIN_VALUE = 8;
const MAX_VALUE = 99;
const DEFAULT_SPEED = 500;

const pseudoCode = {
  bubble: `ALGORITHM BubbleSort(A[1...n])
  for i = 1 to n-1
    for j = 1 to n-i
      if A[j] > A[j+1]
        swap A[j] and A[j+1]
  return A`,

  selection: `ALGORITHM SelectionSort(A[1...n])
  for i = 1 to n-1
    minIndex = i
    for j = i+1 to n
      if A[j] < A[minIndex]
        minIndex = j
    swap A[i] and A[minIndex]
  return A`,

  insertion: `ALGORITHM InsertionSort(A[1...n])
  for i = 2 to n
    key = A[i]
    j = i - 1
    while j > 0 and A[j] > key
      A[j+1] = A[j]
      j = j - 1
    A[j+1] = key
  return A`,

  quick: `ALGORITHM QuickSort(A, low, high)
  if low < high
    pivot = partition(A, low, high)
    QuickSort(A, low, pivot-1)
    QuickSort(A, pivot+1, high)
  return A
  
ALGORITHM Partition(A, low, high)
  pivot = A[high]
  i = low - 1
  for j = low to high-1
    if A[j] ≤ pivot
      i = i + 1
      swap A[i] and A[j]
  swap A[i+1] and A[high]
  return i+1`,

  merge: `ALGORITHM MergeSort(A, left, right)
  if left < right
    mid = (left + right) / 2
    MergeSort(A, left, mid)
    MergeSort(A, mid+1, right)
    Merge(A, left, mid, right)
  return A
  
ALGORITHM Merge(A, left, mid, right)
  create L[1...n1], R[1...n2]
  copy A[left...mid] to L
  copy A[mid+1...right] to R
  i = j = 1, k = left
  while i ≤ n1 and j ≤ n2
    if L[i] ≤ R[j]
      A[k] = L[i]; i++
    else
      A[k] = R[j]; j++
    k++
  copy remaining elements`,
};

// Sorting algorithms implementation
const sortingAlgorithms = {
  bubble: {
    name: "Bubble Sort",
    generate: (arr) => {
      const steps = [];
      const auxiliaryArray = [...arr];
      const n = arr.length;
      let passes = 0;

      for (let i = 0; i < n - 1; i++) {
        passes++;
        for (let j = 0; j < n - i - 1; j++) {
          steps.push({
            array: [...auxiliaryArray],
            comparing: [j, j + 1],
            swapping: [],
            passes,
          });

          if (auxiliaryArray[j] > auxiliaryArray[j + 1]) {
            [auxiliaryArray[j], auxiliaryArray[j + 1]] = [
              auxiliaryArray[j + 1],
              auxiliaryArray[j],
            ];
            steps.push({
              array: [...auxiliaryArray],
              comparing: [],
              swapping: [j, j + 1],
              passes,
            });
          }
        }
      }
      return steps;
    },
  },
  selection: {
    name: "Selection Sort",
    generate: (arr) => {
      const steps = [];
      const auxiliaryArray = [...arr];
      const n = arr.length;
      let passes = 0;

      for (let i = 0; i < n - 1; i++) {
        passes++;
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
          steps.push({
            array: [...auxiliaryArray],
            comparing: [minIdx, j],
            swapping: [],
            passes,
          });

          if (auxiliaryArray[j] < auxiliaryArray[minIdx]) {
            minIdx = j;
          }
        }
        if (minIdx !== i) {
          [auxiliaryArray[i], auxiliaryArray[minIdx]] = [
            auxiliaryArray[minIdx],
            auxiliaryArray[i],
          ];
          steps.push({
            array: [...auxiliaryArray],
            comparing: [],
            swapping: [i, minIdx],
            passes,
          });
        }
      }
      return steps;
    },
  },
  insertion: {
    name: "Insertion Sort",
    generate: (arr) => {
      const steps = [];
      const auxiliaryArray = [...arr];
      const n = arr.length;
      let passes = 0;

      for (let i = 1; i < n; i++) {
        let key = auxiliaryArray[i];
        let j = i - 1;
        passes++;

        while (j >= 0 && auxiliaryArray[j] > key) {
          steps.push({
            array: [...auxiliaryArray],
            comparing: [j, j + 1],
            swapping: [],
            passes,
          });

          auxiliaryArray[j + 1] = auxiliaryArray[j];
          steps.push({
            array: [...auxiliaryArray],
            comparing: [],
            swapping: [j, j + 1],
            passes,
          });
          j--;
        }
        auxiliaryArray[j + 1] = key;
      }
      return steps;
    },
  },
  quick: {
    name: "Quick Sort",
    generate: (arr) => {
      const steps = [];
      const auxiliaryArray = [...arr];
      let passes = 0;

      const partition = (low, high) => {
        passes++;
        const pivot = auxiliaryArray[high];
        let i = low - 1;

        steps.push({
          array: [...auxiliaryArray],
          comparing: [],
          swapping: [],
          passes,
          pivot: high,
          partitionRange: [low, high],
        });

        for (let j = low; j < high; j++) {
          steps.push({
            array: [...auxiliaryArray],
            comparing: [j, high],
            swapping: [],
            passes,
            pivot: high,
            partitionRange: [low, high],
          });

          if (auxiliaryArray[j] < pivot) {
            i++;
            [auxiliaryArray[i], auxiliaryArray[j]] = [
              auxiliaryArray[j],
              auxiliaryArray[i],
            ];
            steps.push({
              array: [...auxiliaryArray],
              comparing: [],
              swapping: [i, j],
              passes,
              pivot: high,
              partitionRange: [low, high],
            });
          }
        }

        [auxiliaryArray[i + 1], auxiliaryArray[high]] = [
          auxiliaryArray[high],
          auxiliaryArray[i + 1],
        ];
        steps.push({
          array: [...auxiliaryArray],
          comparing: [],
          swapping: [i + 1, high],
          passes,
          pivot: i + 1,
          partitionRange: [low, high],
        });

        return i + 1;
      };

      const quickSort = (low, high) => {
        if (low < high) {
          const pi = partition(low, high);
          quickSort(low, pi - 1);
          quickSort(pi + 1, high);
        }
      };

      quickSort(0, auxiliaryArray.length - 1);
      return steps;
    },
  },

  merge: {
    name: "Merge Sort",
    generate: (arr) => {
      const steps = [];
      const auxiliaryArray = [...arr];
      let passes = 0;

      const merge = (left, mid, right) => {
        passes++;
        const leftArray = auxiliaryArray.slice(left, mid + 1);
        const rightArray = auxiliaryArray.slice(mid + 1, right + 1);
        let i = 0,
          j = 0,
          k = left;

        steps.push({
          array: [...auxiliaryArray],
          comparing: [],
          swapping: [],
          passes,
          subArrays: {
            left: [left, mid],
            right: [mid + 1, right],
          },
        });

        while (i < leftArray.length && j < rightArray.length) {
          steps.push({
            array: [...auxiliaryArray],
            comparing: [left + i, mid + 1 + j],
            swapping: [],
            passes,
            subArrays: {
              left: [left, mid],
              right: [mid + 1, right],
            },
          });

          if (leftArray[i] <= rightArray[j]) {
            auxiliaryArray[k] = leftArray[i];
            i++;
          } else {
            auxiliaryArray[k] = rightArray[j];
            j++;
          }

          steps.push({
            array: [...auxiliaryArray],
            comparing: [],
            swapping: [k],
            passes,
            subArrays: {
              left: [left, mid],
              right: [mid + 1, right],
            },
          });
          k++;
        }

        // Copy remaining elements
        while (i < leftArray.length || j < rightArray.length) {
          if (i < leftArray.length) {
            auxiliaryArray[k] = leftArray[i];
            steps.push({
              array: [...auxiliaryArray],
              comparing: [],
              swapping: [k],
              passes,
              subArrays: {
                left: [left, mid],
                right: [mid + 1, right],
              },
            });
            i++;
            k++;
          } else {
            auxiliaryArray[k] = rightArray[j];
            steps.push({
              array: [...auxiliaryArray],
              comparing: [],
              swapping: [k],
              passes,
              subArrays: {
                left: [left, mid],
                right: [mid + 1, right],
              },
            });
            j++;
            k++;
          }
        }
      };

      const mergeSort = (left, right) => {
        if (left < right) {
          const mid = Math.floor((left + right) / 2);
          mergeSort(left, mid);
          mergeSort(mid + 1, right);
          merge(left, mid, right);
        }
      };

      mergeSort(0, auxiliaryArray.length - 1);
      return steps;
    },
  },
};

// Data Structure Node Components
const LinkedListNode = ({ value, isHighlighted, isLast }) => (
  <motion.div
    className="flex items-center"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
  >
    <div
      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
        isHighlighted ? "border-green-500 text-green-500" : "border-gray-400"
      }`}
    >
      {value}
    </div>
    {!isLast && <div className="w-8 h-0.5 bg-gray-400" />}
  </motion.div>
);

// Visualization Components
const LinkedListVisualizer = ({ nodes, activeNode }) => (
  <div className="flex flex-col h-full">
    <div className="flex-grow flex items-center justify-center p-4">
      <div className="flex">
        <AnimatePresence>
          {nodes.map((node, index) => (
            <LinkedListNode
              key={index}
              value={node.value}
              isHighlighted={index === activeNode}
              isLast={index === nodes.length - 1}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  </div>
);

const GraphVisualizer = ({ nodes, edges, activeNode }) => (
  <div className="h-full flex items-center justify-center p-4">
    <svg className="w-full h-full">
      {edges.map((edge, index) => (
        <line
          key={index}
          x1={edge.source.x}
          y1={edge.source.y}
          x2={edge.target.x}
          y2={edge.target.y}
          stroke="gray"
          strokeWidth="2"
        />
      ))}
      {nodes.map((node, index) => (
        <g key={index} transform={`translate(${node.x},${node.y})`}>
          <circle
            r="20"
            className={`${
              index === activeNode ? "fill-green-500" : "fill-blue-500"
            }`}
          />
          <text className="fill-white text-sm" textAnchor="middle" dy=".3em">
            {node.value}
          </text>
        </g>
      ))}
    </svg>
  </div>
);

const StackQueueVisualizer = ({ items, activeIndex, type }) => (
  <div className="h-full flex items-center justify-center p-4">
    <div
      className={`flex ${
        type === "stack" ? "flex-col-reverse" : "flex-row"
      } gap-2`}
    >
      <AnimatePresence>
        {items.map((item, index) => (
          <motion.div
            key={index}
            className={`w-12 h-12 rounded border-2 flex items-center justify-center ${
              index === activeIndex
                ? "border-green-500 text-green-500"
                : "border-gray-400"
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  </div>
);

// Main Component
const AlgorithmVisualizer = () => {
  // State
  const [currentTab, setCurrentTab] = useState("sorting");
  const [array, setArray] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [comparing, setComparing] = useState([]);
  const [swapping, setSwapping] = useState([]);
  //   const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("bubble");
  const animationRef = useRef(null);

  const [showPseudocode, setShowPseudocode] = useState(false);
  const [currentPasses, setCurrentPasses] = useState(0);

  // Data structure states
  const [stackItems, setStackItems] = useState([1, 2, 3, 4]);
  const [queueItems, setQueueItems] = useState([1, 2, 3, 4]);
  const [activeStackIndex, setActiveStackIndex] = useState(null);
  const [activeQueueIndex, setActiveQueueIndex] = useState(null);
  const [linkedListNodes, setLinkedListNodes] = useState([
    { value: 1 },
    { value: 2 },
    { value: 3 },
    { value: 4 },
  ]);
  const [treeNodes, setTreeNodes] = useState([[1], [2, 3], [4, 5, 6, 7]]);
  const [graphNodes, setGraphNodes] = useState([
    { value: 1, x: 200, y: 150 },
    { value: 2, x: 150, y: 200 },
    { value: 3, x: 250, y: 200 },
  ]);
  const [graphEdges, setGraphEdges] = useState([
    { source: { x: 200, y: 150 }, target: { x: 150, y: 200 } },
    { source: { x: 200, y: 150 }, target: { x: 250, y: 200 } },
  ]);
  const [activeLinkedListNode, setActiveLinkedListNode] = useState(null);
  const [activeTreeNode, setActiveTreeNode] = useState(null);
  const [activeGraphNode, setActiveGraphNode] = useState(null);

  // Initialize array
  const generateArray = () => {
    const newArray = Array.from(
      { length: ARRAY_SIZE },
      () => Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE
    );
    setArray(newArray);
    setSteps([]);
    setCurrentStep(0);
    setComparing([]);
    setSwapping([]);
    setIsPlaying(false);
  };

  useEffect(() => {
    generateArray();
  }, []);

  // Animation control
  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      animationRef.current = setTimeout(() => {
        const step = steps[currentStep];
        setArray(step.array);
        setComparing(step.comparing);
        setSwapping(step.swapping);
        setCurrentStep(currentStep + 1);
        setCurrentPasses(step.passes);
      }, speed);

      return () => clearTimeout(animationRef.current);
    } else if (currentStep >= steps.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps, speed]);

  // Operation handlers for data structures
  const handleLinkedListOperation = (operation) => {
    switch (operation) {
      case "insert":
        setLinkedListNodes([
          ...linkedListNodes,
          { value: Math.floor(Math.random() * 100) },
        ]);
        break;
      case "delete":
        setLinkedListNodes(linkedListNodes.slice(0, -1));
        break;
    }
  };

  const handleStackOperation = (operation) => {
    switch (operation) {
      case "push":
        setStackItems([...stackItems, Math.floor(Math.random() * 100)]);
        break;
      case "pop":
        if (stackItems.length > 0) {
          setStackItems(stackItems.slice(0, -1));
        }
        break;
    }
  };

  const handleQueueOperation = (operation) => {
    switch (operation) {
      case "enqueue":
        setQueueItems([...queueItems, Math.floor(Math.random() * 100)]);
        break;
      case "dequeue":
        if (queueItems.length > 0) {
          setQueueItems(queueItems.slice(1));
        }
        break;
    }
  };

  // Sorting controls
  const startSort = () => {
    const sortingSteps = sortingAlgorithms[selectedAlgorithm].generate([
      ...array,
    ]);
    setSteps(sortingSteps);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const handleStep = () => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      setArray(step.array);
      setComparing(step.comparing);
      setSwapping(step.swapping);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReset = () => {
    generateArray();
  };

  const togglePlay = () => {
    if (!steps.length) {
      startSort();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Visualization renderer
  const renderVisualization = () => {
    switch (currentTab) {
      case "sorting":
        return (
          <div className="h-full flex flex-col">
            <div className="flex justify-between p-4">
              <div>
                <Button
                  variant="outline"
                  onClick={() => setShowPseudocode(!showPseudocode)}
                >
                  {showPseudocode ? "Hide" : "Show"} Pseudocode
                </Button>
                <Badge variant="secondary" className="ml-4">
                  Passes: {currentPasses}
                </Badge>
                <Badge variant="secondary" className="ml-4">
                  {currentStep > 0 && steps.length > 0 && (
                    <span className="text-sm">
                      Step {currentStep} of {steps.length}
                    </span>
                  )}
                </Badge>
              </div>
            </div>
            <div className="flex flex-1 h-[calc(100%-60px)]">
              {showPseudocode && (
                <div className="w-1/3 p-4 border-r overflow-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {pseudoCode[selectedAlgorithm]}
                  </pre>
                </div>
              )}
              <div
                className={`${
                  showPseudocode ? "w-2/3" : "w-full"
                } flex items-end justify-center gap-1 p-4`}
              >
                <AnimatePresence>
                  {array.map((value, index) => (
                    <motion.div
                      key={index}
                      className={`relative w-4 rounded-t-sm ${
                        comparing.includes(index)
                          ? "bg-yellow-500"
                          : swapping.includes(index)
                          ? "bg-red-500"
                          : steps[currentStep]?.pivot === index
                          ? "bg-purple-500"
                          : "bg-blue-500"
                      } ${
                        steps[currentStep]?.subArrays?.left?.[0] <= index &&
                        steps[currentStep]?.subArrays?.left?.[1] >= index
                          ? "border-l-2 border-r-2 border-green-500"
                          : steps[currentStep]?.subArrays?.right?.[0] <=
                              index &&
                            steps[currentStep]?.subArrays?.right?.[1] >= index
                          ? "border-l-2 border-r-2 border-blue-500"
                          : ""
                      }`}
                      style={{
                        height: `${value}%`,
                        width: "25px",
                        color: "#fff",
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <center>{value}</center>
                      {steps[currentStep]?.pivot === index && (
                        <div className="absolute -top-6 left-0 w-full text-center text-xs text-purple-500">
                          Pivot
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        );
      case "linkedList":
        return (
          <EnhancedLinkedListVisualizer />
          // <div className="flex flex-col h-full">
          //   <div className="flex-grow">
          //     <LinkedListVisualizer
          //       nodes={linkedListNodes}
          //       activeNode={activeLinkedListNode}
          //     />
          //   </div>
          //   <div className="flex items-center justify-center gap-4 p-4 border-t">
          //     <Button onClick={() => handleLinkedListOperation("insert")}>
          //       <Plus className="mr-2" />
          //       Insert
          //     </Button>
          //     <Button onClick={() => handleLinkedListOperation("delete")}>
          //       <Minus className="mr-2" />
          //       Delete
          //     </Button>
          //   </div>
          // </div>
        );
      case "searching":
        return <SearchAlgorithmVisualizer />;
      case "tree":
        return <TreeVisualizer nodes={treeNodes} activeNode={activeTreeNode} />;
      case "graph":
        return (
          <GraphVisualizer
            nodes={graphNodes}
            edges={graphEdges}
            activeNode={activeGraphNode}
          />
        );
      case "stackQueue":
        return (
          <Tabs defaultValue="stack" className="w-full">
            <TabsList>
              <TabsTrigger value="stack">Stack</TabsTrigger>
              <TabsTrigger value="queue">Queue</TabsTrigger>
            </TabsList>
            <TabsContent value="stack">
              <div className="flex items-center justify-center gap-4">
                <Button onClick={() => handleStackOperation("push")}>
                  <Plus className="mr-2" />
                  Push
                </Button>

                <StackQueueVisualizer
                  items={stackItems}
                  activeIndex={activeStackIndex}
                  type="stack"
                />

                <Button onClick={() => handleStackOperation("pop")}>
                  <Minus className="mr-2" />
                  Pop
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="queue">
              <StackQueueVisualizer
                items={queueItems}
                activeIndex={activeQueueIndex}
                type="queue"
              />
              <div className="flex justify-center gap-2 mt-4">
                <Button onClick={() => handleQueueOperation("enqueue")}>
                  <Plus className="mr-2" />
                  Enqueue
                </Button>
                <Button onClick={() => handleQueueOperation("dequeue")}>
                  <Minus className="mr-2" />
                  Dequeue
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        );
      default:
        return <div>Select a data structure or algorithm to visualize</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Algorithm Visualizer</h1>
        {/* <div className="flex items-center gap-4">
          {currentStep > 0 && steps.length > 0 && (
            <span className="text-sm">
              Step {currentStep} of {steps.length}
            </span>
          )}
        </div> */}
      </nav>

      <main className="container mx-auto p-4">
        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="sorting">Sorting</TabsTrigger>
            <TabsTrigger value="searching">Searching</TabsTrigger>
            <TabsTrigger value="linkedList">Linked List</TabsTrigger>
            {/* <TabsTrigger value="graph">Graph</TabsTrigger> */}
            <TabsTrigger value="stackQueue">Stack & Queue</TabsTrigger>
            <TabsTrigger value="tree">Tree</TabsTrigger>
          </TabsList>

          <Card className="mt-4 p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              {currentTab === "sorting" && (
                <>
                  <Select
                    value={selectedAlgorithm}
                    onValueChange={setSelectedAlgorithm}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sortingAlgorithms).map(([key, algo]) => (
                        <SelectItem key={key} value={key}>
                          {algo.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button onClick={togglePlay} className="w-24">
                    {isPlaying ? (
                      <Pause className="mr-2" />
                    ) : (
                      <Play className="mr-2" />
                    )}
                    {isPlaying ? "Pause" : "Play"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleStep}
                    disabled={currentStep >= steps.length}
                  >
                    <StepForward className="mr-2" />
                    Step
                  </Button>

                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="mr-2" />
                    Reset
                  </Button>

                  <div className="flex items-center gap-4 ml-auto">
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
                </>
              )}
            </div>

            {currentTab === "sorting" ? (
              <div className="h-96 border rounded-lg bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                {renderVisualization()}
              </div>
            ) : (
              renderVisualization()
            )}
          </Card>
        </Tabs>
      </main>
    </div>
  );
};

export default AlgorithmVisualizer;
