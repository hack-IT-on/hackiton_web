import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, StepForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";

// Constants
const DEFAULT_SPEED = 500;
const NODE_COUNT = 10;

const pseudoCode = {
  bfs: `ALGORITHM BFS(graph, start)
  queue = new Queue()
  visited = new Set()
  
  queue.enqueue(start)
  visited.add(start)
  
  while !queue.isEmpty()
    node = queue.dequeue()
    // process node
    
    for neighbor in graph.neighbors(node)
      if neighbor not in visited
        queue.enqueue(neighbor)
        visited.add(neighbor)`,

  dfs: `ALGORITHM DFS(graph, start)
  stack = new Stack()
  visited = new Set()
  
  stack.push(start)
  
  while !stack.isEmpty()
    node = stack.pop()
    
    if node not in visited
      // process node
      visited.add(node)
      
      for neighbor in graph.neighbors(node)
        if neighbor not in visited
          stack.push(neighbor)`,
};

const BFS_DFS_Visualizer = () => {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("bfs");
  const [showPseudocode, setShowPseudocode] = useState(false);
  const [graph, setGraph] = useState([]);
  const [startNode, setStartNode] = useState(0);
  const [dataStructureItems, setDataStructureItems] = useState([]);
  const [nodePositions, setNodePositions] = useState([]);
  const animationRef = useRef(null);
  const svgRef = useRef(null);

  // Initialize graph
  useEffect(() => {
    generateGraph();
  }, []);

  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      animationRef.current = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, speed);

      return () => clearTimeout(animationRef.current);
    } else if (currentStep >= steps.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps, speed]);

  const generateGraph = () => {
    // Create nodes
    const newGraph = [];
    const positions = [];

    // Create nodes in a circular layout
    for (let i = 0; i < NODE_COUNT; i++) {
      const angle = (i * 2 * Math.PI) / NODE_COUNT;
      const radius = 150;
      const x = 200 + radius * Math.cos(angle);
      const y = 200 + radius * Math.sin(angle);

      positions.push({ x, y });

      newGraph.push({
        id: i,
        value: i,
        neighbors: [],
      });
    }

    // Generate random edges (ensuring the graph is connected)
    // First, ensure each node connects to the next one to form a basic cycle
    for (let i = 0; i < NODE_COUNT; i++) {
      const nextNode = (i + 1) % NODE_COUNT;
      newGraph[i].neighbors.push(nextNode);
      newGraph[nextNode].neighbors.push(i);
    }

    // Add some random additional edges
    for (let i = 0; i < NODE_COUNT; i++) {
      // Add 1-2 random connections
      const numConnections = Math.floor(Math.random() * 2) + 1;

      for (let j = 0; j < numConnections; j++) {
        const randomNode = Math.floor(Math.random() * NODE_COUNT);

        // Avoid self-loops and duplicate connections
        if (randomNode !== i && !newGraph[i].neighbors.includes(randomNode)) {
          newGraph[i].neighbors.push(randomNode);
          newGraph[randomNode].neighbors.push(i);
        }
      }
    }

    setGraph(newGraph);
    setNodePositions(positions);
    resetSearch();
  };

  const resetSearch = () => {
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setDataStructureItems([]);
  };

  const bfsSearch = () => {
    const steps = [];
    const visited = new Set();
    const queue = [];

    queue.push(startNode);
    visited.add(startNode);

    steps.push({
      visited: new Set(visited),
      current: null,
      queue: [...queue],
      stack: [],
      neighbors: [],
      processing: startNode,
      adding: [startNode],
    });

    while (queue.length > 0) {
      const node = queue.shift();

      // Process node (mark as visited)
      steps.push({
        visited: new Set(visited),
        current: node,
        queue: [...queue],
        stack: [],
        neighbors: graph[node].neighbors,
        processing: node,
        adding: [],
      });

      // Add neighbors to queue
      const newlyAdded = [];
      for (const neighbor of graph[node].neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
          visited.add(neighbor);
          newlyAdded.push(neighbor);
        }
      }

      if (newlyAdded.length > 0) {
        steps.push({
          visited: new Set(visited),
          current: node,
          queue: [...queue],
          stack: [],
          neighbors: graph[node].neighbors,
          processing: null,
          adding: newlyAdded,
        });
      }
    }

    return steps;
  };

  const dfsSearch = () => {
    const steps = [];
    const visited = new Set();
    const stack = [];

    stack.push(startNode);

    steps.push({
      visited: new Set(visited),
      current: null,
      queue: [],
      stack: [...stack],
      neighbors: [],
      processing: null,
      adding: [startNode],
    });

    while (stack.length > 0) {
      const node = stack.pop();

      if (!visited.has(node)) {
        // Process node (mark as visited)
        visited.add(node);

        steps.push({
          visited: new Set(visited),
          current: node,
          queue: [],
          stack: [...stack],
          neighbors: graph[node].neighbors,
          processing: node,
          adding: [],
        });

        // Add neighbors to stack (in reverse to maintain correct DFS order)
        const newlyAdded = [];
        const neighbors = [...graph[node].neighbors].reverse();

        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
            newlyAdded.push(neighbor);
          }
        }

        if (newlyAdded.length > 0) {
          steps.push({
            visited: new Set(visited),
            current: node,
            queue: [],
            stack: [...stack],
            neighbors: graph[node].neighbors,
            processing: null,
            adding: newlyAdded.reverse(), // Reverse to show the original order
          });
        }
      }
    }

    return steps;
  };

  const startSearch = () => {
    let searchSteps = [];

    if (selectedAlgorithm === "bfs") {
      searchSteps = bfsSearch();
    } else if (selectedAlgorithm === "dfs") {
      searchSteps = dfsSearch();
    }

    setSteps(searchSteps);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!steps.length) {
      startSearch();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReset = () => {
    resetSearch();
  };

  const handleNodeClick = (nodeId) => {
    setStartNode(nodeId);
    resetSearch();
  };

  // Data structure visualization components
  const QueueVisualizer = ({ items }) => (
    <div className="flex flex-col">
      <div className="text-sm font-medium mb-2">Queue (Front → Back)</div>
      <div className="flex items-center gap-2 overflow-x-auto p-2 min-h-16">
        <AnimatePresence>
          {items.length === 0 ? (
            <div className="text-gray-400 italic">Empty</div>
          ) : (
            items.map((item, index) => (
              <motion.div
                key={`${item}-${index}`}
                className="w-10 h-10 border rounded flex items-center justify-center bg-blue-100 dark:bg-blue-900"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {item}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const StackVisualizer = ({ items }) => (
    <div className="flex flex-col">
      <div className="text-sm font-medium mb-2">Stack (Top → Bottom)</div>
      <div className="flex flex-col-reverse items-center gap-1 min-h-32">
        <AnimatePresence>
          {items.length === 0 ? (
            <div className="text-gray-400 italic">Empty</div>
          ) : (
            items.map((item, index) => (
              <motion.div
                key={`${item}-${index}`}
                className="w-10 h-10 border rounded flex items-center justify-center bg-purple-100 dark:bg-purple-900"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                {item}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const GraphVisualizer = () => {
    const currentState = steps[currentStep - 1] || {
      visited: new Set(),
      current: null,
      processing: null,
      adding: [],
    };

    const getEdgeColor = (fromNode, toNode) => {
      if (!graph[fromNode] || !graph[toNode])
        return "stroke-gray-300 dark:stroke-gray-600";

      // If current step is highlighting these nodes in some way
      const isFromVisited = currentState.visited.has(fromNode);
      const isToVisited = currentState.visited.has(toNode);
      const isFromCurrent = currentState.current === fromNode;
      const isToCurrent = currentState.current === toNode;
      const isNeighbor =
        currentState.current === fromNode &&
        graph[fromNode].neighbors.includes(toNode);

      if (
        (isFromCurrent && isNeighbor) ||
        (isToCurrent && graph[toNode].neighbors.includes(fromNode))
      ) {
        return "stroke-yellow-500 dark:stroke-yellow-400 stroke-2";
      } else if (isFromVisited && isToVisited) {
        return "stroke-blue-500 dark:stroke-blue-400";
      } else {
        return "stroke-gray-300 dark:stroke-gray-600";
      }
    };

    return (
      <div className="relative w-full h-96">
        <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 400 400">
          {/* Draw edges first so they appear behind nodes */}
          {graph.map((node, fromIdx) =>
            node.neighbors.map((toIdx, edgeIdx) => {
              // Only draw each edge once
              if (fromIdx < toIdx) {
                return (
                  <line
                    key={`edge-${fromIdx}-${toIdx}`}
                    x1={nodePositions[fromIdx]?.x}
                    y1={nodePositions[fromIdx]?.y}
                    x2={nodePositions[toIdx]?.x}
                    y2={nodePositions[toIdx]?.y}
                    className={getEdgeColor(fromIdx, toIdx)}
                  />
                );
              }
              return null;
            })
          )}

          {/* Draw nodes on top of edges */}
          {graph.map((node, index) => {
            const isVisited = currentState.visited.has(node.id);
            const isCurrent = currentState.current === node.id;
            const isStart = startNode === node.id;
            const isProcessing = currentState.processing === node.id;
            const isBeingAdded = currentState.adding.includes(node.id);

            return (
              <g
                key={`node-${index}`}
                transform={`translate(${nodePositions[index]?.x}, ${nodePositions[index]?.y})`}
                onClick={() => handleNodeClick(node.id)}
                className="cursor-pointer"
              >
                <circle
                  r="20"
                  className={`
                    ${
                      isStart
                        ? "stroke-purple-500 stroke-2"
                        : "stroke-gray-300 dark:stroke-gray-600"
                    }
                    ${
                      isProcessing ? "fill-yellow-300 dark:fill-yellow-700" : ""
                    }
                    ${isBeingAdded ? "fill-green-200 dark:fill-green-800" : ""}
                    ${isCurrent ? "fill-blue-400 dark:fill-blue-700" : ""}
                    ${
                      isVisited && !isCurrent && !isProcessing && !isBeingAdded
                        ? "fill-blue-200 dark:fill-blue-900"
                        : ""
                    }
                    ${
                      !isVisited &&
                      !isCurrent &&
                      !isProcessing &&
                      !isBeingAdded &&
                      !isStart
                        ? "fill-white dark:fill-gray-700"
                        : ""
                    }
                  `}
                />
                <text
                  className="text-xs font-bold fill-current"
                  textAnchor="middle"
                  dy="0.3em"
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // Render the visualization based on the current step
  useEffect(() => {
    if (currentStep > 0 && currentStep <= steps.length) {
      const currentState = steps[currentStep - 1];

      if (selectedAlgorithm === "bfs") {
        setDataStructureItems(currentState.queue);
      } else if (selectedAlgorithm === "dfs") {
        setDataStructureItems(currentState.stack);
      }
    }
  }, [currentStep, selectedAlgorithm, steps]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bfs">Breadth-First Search</SelectItem>
            <SelectItem value="dfs">Depth-First Search</SelectItem>
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

        <Button
          variant="outline"
          onClick={() => setShowPseudocode(!showPseudocode)}
        >
          {showPseudocode ? "Hide" : "Show"} Pseudocode
        </Button>

        <div className="flex items-center gap-4 ml-auto">
          <span className="text-sm">Speed:</span>
          <span className="text-sm">Slow</span>
          <Slider
            className="w-32"
            value={[speed]}
            min={100}
            max={1000}
            step={100}
            onValueChange={(value) => setSpeed(value[0])}
          />
          <span className="text-sm">Fast</span>
        </div>
      </div>

      <Card className="flex-grow">
        <CardHeader>
          <CardTitle>
            {selectedAlgorithm === "bfs"
              ? "Breadth-First Search"
              : "Depth-First Search"}{" "}
            Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[600px]">
            <div
              className={`${showPseudocode ? "w-2/3" : "w-full"} flex flex-col`}
            >
              <p className="mb-4">
                Click on a node to set it as the start node. Current start: Node{" "}
                {startNode}
              </p>

              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <h3 className="text-lg font-medium mb-4">
                    Graph Visualization
                  </h3>
                  <GraphVisualizer />

                  <Button
                    variant="outline"
                    onClick={generateGraph}
                    className="mt-4"
                  >
                    Generate New Graph
                  </Button>
                </div>

                <div className="flex flex-col space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {selectedAlgorithm === "bfs" ? "Queue" : "Stack"}{" "}
                      Visualization
                    </h3>
                    {selectedAlgorithm === "bfs" ? (
                      <QueueVisualizer items={dataStructureItems} />
                    ) : (
                      <StackVisualizer items={dataStructureItems} />
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Traversal Order
                    </h3>
                    <div className="border rounded p-4 min-h-32 overflow-auto">
                      {Array.from(
                        new Set(
                          steps
                            .slice(0, currentStep)
                            .filter((step) => step.current !== null)
                            .map((step) => step.current)
                        )
                      ).map((nodeId, index) => (
                        <span key={index} className="inline-block m-1">
                          <Badge variant="outline">{nodeId}</Badge>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {showPseudocode && (
              <div className="w-1/3 p-4 border-l overflow-auto">
                <h3 className="text-lg font-medium mb-4">Pseudocode</h3>
                <pre className="text-sm whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-4 rounded">
                  {pseudoCode[selectedAlgorithm]}
                </pre>

                <div className="mt-6">
                  <h4 className="font-medium mb-2">How it works:</h4>
                  {selectedAlgorithm === "bfs" ? (
                    <p>
                      BFS uses a <strong>queue</strong> (First-In-First-Out) to
                      explore all nodes at the current depth before moving to
                      nodes at the next depth level. It's ideal for finding the
                      shortest path in unweighted graphs.
                    </p>
                  ) : (
                    <p>
                      DFS uses a <strong>stack</strong> (Last-In-First-Out) to
                      explore as far as possible along each branch before
                      backtracking. It's useful for topological sorting, finding
                      connected components, and maze generation.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BFS_DFS_Visualizer;
