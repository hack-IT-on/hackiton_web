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
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Code,
  Clock,
  Info,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  sortingAlgorithms,
  pseudoCode,
  ARRAY_SIZE,
  MIN_VALUE,
  MAX_VALUE,
  DEFAULT_SPEED,
} from "@/lib/sorting-algorithms";

// Add C code implementations and time complexity information
const cCodeImplementations = {
  bubble: `void bubbleSort(int arr[], int n) {
  for (int i = 0; i < n - 1; i++) {
    // Track if any swaps were made in this pass
    int swapped = 0;
    
    // Last i elements are already in place
    for (int j = 0; j < n - i - 1; j++) {
      // Compare adjacent elements
      if (arr[j] > arr[j + 1]) {
        // Swap arr[j] and arr[j+1]
        int temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = 1;
      }
    }
    
    // If no swaps were made in this pass, array is sorted
    if (swapped == 0)
      break;
  }
}`,
  selection: `void selectionSort(int arr[], int n) {
  for (int i = 0; i < n - 1; i++) {
    // Find the minimum element in unsorted array
    int min_idx = i;
    for (int j = i + 1; j < n; j++) {
      if (arr[j] < arr[min_idx])
        min_idx = j;
    }
    
    // Swap the found minimum element with the first element
    if (min_idx != i) {
      int temp = arr[min_idx];
      arr[min_idx] = arr[i];
      arr[i] = temp;
    }
  }
}`,
  insertion: `void insertionSort(int arr[], int n) {
  for (int i = 1; i < n; i++) {
    int key = arr[i];
    int j = i - 1;
    
    // Move elements of arr[0..i-1] that are greater than key
    // to one position ahead of their current position
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j = j - 1;
    }
    arr[j + 1] = key;
  }
}`,
  merge: `// Merge two subarrays L and R into arr
void merge(int arr[], int l, int m, int r) {
  int i, j, k;
  int n1 = m - l + 1;
  int n2 = r - m;
  
  // Create temp arrays
  int L[n1], R[n2];
  
  // Copy data to temp arrays L[] and R[]
  for (i = 0; i < n1; i++)
    L[i] = arr[l + i];
  for (j = 0; j < n2; j++)
    R[j] = arr[m + 1 + j];
  
  // Merge the temp arrays back into arr[l..r]
  i = 0;
  j = 0;
  k = l;
  while (i < n1 && j < n2) {
    if (L[i] <= R[j]) {
      arr[k] = L[i];
      i++;
    } else {
      arr[k] = R[j];
      j++;
    }
    k++;
  }
  
  // Copy the remaining elements of L[], if there are any
  while (i < n1) {
    arr[k] = L[i];
    i++;
    k++;
  }
  
  // Copy the remaining elements of R[], if there are any
  while (j < n2) {
    arr[k] = R[j];
    j++;
    k++;
  }
}

// Main function that sorts arr[l..r] using merge()
void mergeSort(int arr[], int l, int r) {
  if (l < r) {
    // Same as (l+r)/2, but avoids overflow for large l and r
    int m = l + (r - l) / 2;
    
    // Sort first and second halves
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    
    merge(arr, l, m, r);
  }
}`,
  quick: `// Function to swap two elements
void swap(int* a, int* b) {
  int t = *a;
  *a = *b;
  *b = t;
}

// Partition the array using the last element as pivot
int partition(int arr[], int low, int high) {
  int pivot = arr[high]; // pivot
  int i = (low - 1); // Index of smaller element
  
  for (int j = low; j <= high - 1; j++) {
    // If current element is smaller than the pivot
    if (arr[j] < pivot) {
      i++; // increment index of smaller element
      swap(&arr[i], &arr[j]);
    }
  }
  swap(&arr[i + 1], &arr[high]);
  return (i + 1);
}

// The main function that implements QuickSort
void quickSort(int arr[], int low, int high) {
  if (low < high) {
    // pi is partitioning index, arr[p] is now at right place
    int pi = partition(arr, low, high);
    
    // Separately sort elements before and after partition
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}`,
  heap: `// To heapify a subtree rooted with node i
void heapify(int arr[], int n, int i) {
  int largest = i; // Initialize largest as root
  int l = 2 * i + 1; // left = 2*i + 1
  int r = 2 * i + 2; // right = 2*i + 2
  
  // If left child is larger than root
  if (l < n && arr[l] > arr[largest])
    largest = l;
  
  // If right child is larger than largest so far
  if (r < n && arr[r] > arr[largest])
    largest = r;
  
  // If largest is not root
  if (largest != i) {
    swap(&arr[i], &arr[largest]);
    
    // Recursively heapify the affected sub-tree
    heapify(arr, n, largest);
  }
}

// Main function to do heap sort
void heapSort(int arr[], int n) {
  // Build heap (rearrange array)
  for (int i = n / 2 - 1; i >= 0; i--)
    heapify(arr, n, i);
  
  // One by one extract an element from heap
  for (int i = n - 1; i > 0; i--) {
    // Move current root to end
    swap(&arr[0], &arr[i]);
    
    // Call max heapify on the reduced heap
    heapify(arr, i, 0);
  }
}`,
};

const timeComplexity = {
  bubble: {
    worst: "O(n²)",
    average: "O(n²)",
    best: "O(n)",
    space: "O(1)",
    explanation:
      "In bubble sort, we repeatedly step through the list, compare adjacent elements and swap them if they are in the wrong order. The worst-case scenario occurs when the array is reverse sorted, requiring n² comparisons and swaps. The best case occurs when the array is already sorted, requiring only n comparisons and no swaps.",
  },
  selection: {
    worst: "O(n²)",
    average: "O(n²)",
    best: "O(n²)",
    space: "O(1)",
    explanation:
      "Selection sort always performs the same number of comparisons regardless of the input data arrangement. It finds the minimum element from the unsorted part and puts it at the beginning, making (n-1) + (n-2) + ... + 1 = n(n-1)/2 comparisons, which simplifies to O(n²).",
  },
  insertion: {
    worst: "O(n²)",
    average: "O(n²)",
    best: "O(n)",
    space: "O(1)",
    explanation:
      "Insertion sort builds the final sorted array one item at a time. It's efficient for small data sets and nearly sorted arrays. The worst case occurs with a reverse-sorted array, requiring shifting every element. The best case is an already sorted array, requiring only n-1 comparisons.",
  },
  merge: {
    worst: "O(n log n)",
    average: "O(n log n)",
    best: "O(n log n)",
    space: "O(n)",
    explanation:
      "Merge sort divides the array into halves, sorts them recursively, and then merges the sorted halves. The time complexity is consistent as it always divides the array into halves and merges them. The log n comes from dividing, and the n comes from merging, resulting in O(n log n).",
  },
  quick: {
    worst: "O(n²)",
    average: "O(n log n)",
    best: "O(n log n)",
    space: "O(log n)",
    explanation:
      "Quick sort selects a 'pivot' element and partitions the array around it. The worst case occurs when the pivot is always the smallest or largest element, leading to unbalanced partitions. The average and best cases result in balanced partitions, giving O(n log n) performance.",
  },
  heap: {
    worst: "O(n log n)",
    average: "O(n log n)",
    best: "O(n log n)",
    space: "O(1)",
    explanation:
      "Heap sort converts the array into a heap data structure (a special type of binary tree), then repeatedly extracts the maximum element. Building the heap takes O(n) time, and extracting each element takes O(log n) time, for a total of O(n log n) in all cases.",
  },
};

const SortingVisualizer = () => {
  // State
  const [array, setArray] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [comparing, setComparing] = useState([]);
  const [swapping, setSwapping] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("bubble");
  const animationRef = useRef(null);
  const [showCodeTab, setShowCodeTab] = useState("pseudocode");
  const [currentPasses, setCurrentPasses] = useState(0);
  const [codeHighlight, setCodeHighlight] = useState([]);

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
    setCodeHighlight([]);
  };

  useEffect(() => {
    generateArray();
  }, []);

  // Update code highlighting based on current step
  useEffect(() => {
    if (steps[currentStep]) {
      setCodeHighlight(steps[currentStep].highlightLines || []);
    }
  }, [currentStep, steps]);

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

  // Reset on algorithm change
  useEffect(() => {
    generateArray();
  }, [selectedAlgorithm]);

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

  // Function to highlight code lines
  const renderCodeWithHighlights = (code, highlightLines) => {
    return code.split("\n").map((line, index) => (
      <div
        key={index}
        className={`${
          highlightLines.includes(index + 1)
            ? "bg-yellow-200 dark:bg-yellow-900"
            : ""
        }`}
      >
        <span className="text-gray-500 mr-2">{index + 1}</span>
        {line}
      </div>
    ));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
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
          {isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualization Area */}
        <div className="lg:col-span-2 h-96 border rounded-lg bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex justify-between p-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Passes: {currentPasses}</Badge>
                {currentStep > 0 && steps.length > 0 && (
                  <Badge variant="secondary">
                    Step {currentStep} of {steps.length}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex-1 flex items-end justify-center gap-1 p-4">
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
                        : steps[currentStep]?.subArrays?.right?.[0] <= index &&
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
            <div className="flex p-2 justify-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-xs">Comparing</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs">Swapping</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-xs">Pivot</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-xs">Regular</span>
              </div>
            </div>
          </div>
        </div>

        {/* Code and Complexity Panel */}
        <div className="lg:col-span-1 border rounded-lg overflow-hidden">
          <Tabs
            defaultValue="pseudocode"
            value={showCodeTab}
            onValueChange={setShowCodeTab}
          >
            <div className="border-b px-2 bg-gray-100 dark:bg-gray-800">
              <TabsList className="bg-transparent">
                <TabsTrigger
                  value="pseudocode"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Pseudocode
                </TabsTrigger>
                <TabsTrigger
                  value="ccode"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                >
                  <Code className="w-4 h-4 mr-2" />C Code
                </TabsTrigger>
                <TabsTrigger
                  value="complexity"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Complexity
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="pseudocode" className="m-0">
              <div className="p-4 h-[450px] overflow-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {renderCodeWithHighlights(
                    pseudoCode[selectedAlgorithm],
                    codeHighlight
                  )}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="ccode" className="m-0">
              <div className="p-4 h-[450px] overflow-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {renderCodeWithHighlights(
                    cCodeImplementations[selectedAlgorithm],
                    codeHighlight
                  )}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="complexity" className="m-0">
              <div className="p-4 h-[450px] overflow-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Time & Space Complexity
                    </CardTitle>
                    <CardDescription>
                      {sortingAlgorithms[selectedAlgorithm].name} algorithm
                      analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium">Best Case</h4>
                          <p className="text-2xl font-bold text-green-500">
                            {timeComplexity[selectedAlgorithm].best}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Average Case</h4>
                          <p className="text-2xl font-bold text-yellow-500">
                            {timeComplexity[selectedAlgorithm].average}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Worst Case</h4>
                          <p className="text-2xl font-bold text-red-500">
                            {timeComplexity[selectedAlgorithm].worst}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">
                            Space Complexity
                          </h4>
                          <p className="text-2xl font-bold text-blue-500">
                            {timeComplexity[selectedAlgorithm].space}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-medium flex items-center mb-2">
                          <Info className="w-4 h-4 mr-2" />
                          Explanation
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {timeComplexity[selectedAlgorithm].explanation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SortingVisualizer;
