import React, { useState, useEffect, useRef } from "react";
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
import { Play, Pause, RotateCcw, StepForward, Code, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEFAULT_SPEED = 500;

// Pseudocode for Dijkstra's algorithm
const pseudoCode = `ALGORITHM Dijkstra(Graph, source)
  create vertex set Q
  
  for each vertex v in Graph:
    dist[v] ← INFINITY
    prev[v] ← UNDEFINED
    add v to Q
  dist[source] ← 0
  
  while Q is not empty:
    u ← vertex in Q with min dist[u]
    remove u from Q
    
    for each neighbor v of u:
      alt ← dist[u] + length(u, v)
      if alt < dist[v]:
        dist[v] ← alt
        prev[v] ← u
  
  return dist[], prev[]`;

const DijkstraVisualizer = () => {
  // Graph state
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [sourceNode, setSourceNode] = useState(null);
  const [targetNode, setTargetNode] = useState(null);

  // Algorithm state
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [distances, setDistances] = useState({});
  const [previous, setPrevious] = useState({});
  const [showPseudocode, setShowPseudocode] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [shortestPath, setShortestPath] = useState([]);

  const animationRef = useRef(null);
  const svgRef = useRef(null);

  // Initialize graph
  useEffect(() => {
    generateRandomGraph();
  }, []);

  const generateRandomGraph = () => {
    // Create a smaller grid-based graph for better visualization
    const gridSize = 4; // Reduced from 5 to 4
    const width = 500; // Reduced from 600 to 500
    const height = 300; // Reduced from 400 to 300
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;

    const newNodes = [];
    const newEdges = [];

    // Generate nodes in a grid pattern with some randomness
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const nodeId = i * gridSize + j;
        // Add some randomness to node positions
        const xOffset = Math.random() * 15 - 7.5; // Reduced randomness
        const yOffset = Math.random() * 15 - 7.5;

        newNodes.push({
          id: nodeId,
          x: j * cellWidth + cellWidth / 2 + xOffset,
          y: i * cellHeight + cellHeight / 2 + yOffset,
          label: String.fromCharCode(65 + nodeId), // A, B, C, ...
        });
      }
    }

    // Generate edges with weights
    // Connect to adjacent nodes (up, down, left, right) and some diagonals
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const nodeId = i * gridSize + j;

        // Connect to right neighbor
        if (j < gridSize - 1) {
          const weight = Math.floor(Math.random() * 9) + 1;
          newEdges.push({
            source: nodeId,
            target: nodeId + 1,
            weight,
          });
        }

        // Connect to bottom neighbor
        if (i < gridSize - 1) {
          const weight = Math.floor(Math.random() * 9) + 1;
          newEdges.push({
            source: nodeId,
            target: nodeId + gridSize,
            weight,
          });
        }

        // Add some diagonal edges (about 25% chance - reduced from 30%)
        if (i < gridSize - 1 && j < gridSize - 1 && Math.random() < 0.25) {
          const weight = Math.floor(Math.random() * 9) + 1;
          newEdges.push({
            source: nodeId,
            target: nodeId + gridSize + 1,
            weight,
          });
        }
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);

    // Set default source and target nodes
    setSourceNode(0);
    setTargetNode(newNodes.length - 1);

    // Reset algorithm state
    resetAlgorithm();
  };

  const resetAlgorithm = () => {
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setVisitedNodes([]);
    setCurrentNode(null);
    setShortestPath([]);
    setDistances({});
    setPrevious({});
  };

  // Run Dijkstra's algorithm to generate steps
  const generateDijkstraSteps = () => {
    if (sourceNode === null) return [];

    const algorithmSteps = [];
    const dist = {};
    const prev = {};
    const unvisited = new Set();

    // Initialize distances
    nodes.forEach((node) => {
      dist[node.id] = node.id === sourceNode ? 0 : Infinity;
      prev[node.id] = null;
      unvisited.add(node.id);
    });

    // Record initial state
    algorithmSteps.push({
      distances: { ...dist },
      previous: { ...prev },
      visited: [],
      currentNode: null,
      evaluatingEdge: null,
      shortestPath: [],
    });

    // Continue as long as there are unvisited nodes
    while (unvisited.size > 0) {
      // Find the unvisited node with minimum distance
      let currentNode = null;
      let minDist = Infinity;

      unvisited.forEach((nodeId) => {
        if (dist[nodeId] < minDist) {
          minDist = dist[nodeId];
          currentNode = nodeId;
        }
      });

      // If we can't reach any more nodes or we've reached the target
      if (currentNode === null || currentNode === targetNode) break;

      // Remove current node from unvisited set
      unvisited.delete(currentNode);

      // Record state after selecting node
      algorithmSteps.push({
        distances: { ...dist },
        previous: { ...prev },
        visited: [
          ...algorithmSteps[algorithmSteps.length - 1].visited,
          currentNode,
        ],
        currentNode,
        evaluatingEdge: null,
        shortestPath: [],
      });

      // Get all edges from current node
      const nodeEdges = edges.filter((edge) => edge.source === currentNode);

      // Evaluate each neighbor
      for (const edge of nodeEdges) {
        const neighborId = edge.target;

        // Only consider unvisited neighbors
        if (!unvisited.has(neighborId)) continue;

        // Record state when evaluating an edge
        algorithmSteps.push({
          distances: { ...dist },
          previous: { ...prev },
          visited: [...algorithmSteps[algorithmSteps.length - 1].visited],
          currentNode,
          evaluatingEdge: edge,
          shortestPath: [],
        });

        // Calculate potential new distance
        const alt = dist[currentNode] + edge.weight;

        // If new path is shorter, update distance and previous
        if (alt < dist[neighborId]) {
          dist[neighborId] = alt;
          prev[neighborId] = currentNode;

          // Record state after update
          algorithmSteps.push({
            distances: { ...dist },
            previous: { ...prev },
            visited: [...algorithmSteps[algorithmSteps.length - 1].visited],
            currentNode,
            evaluatingEdge: edge,
            shortestPath: [],
          });
        }
      }
    }

    // Reconstruct path for final state if target is reachable
    let pathToTarget = [];
    if (targetNode !== null && dist[targetNode] !== Infinity) {
      pathToTarget = reconstructPath(prev, targetNode);
    }

    // Add final state with shortest path
    algorithmSteps.push({
      distances: { ...dist },
      previous: { ...prev },
      visited: [...algorithmSteps[algorithmSteps.length - 1].visited],
      currentNode: null,
      evaluatingEdge: null,
      shortestPath: pathToTarget,
    });

    return algorithmSteps;
  };

  // Reconstruct the shortest path from source to target
  const reconstructPath = (prev, target) => {
    const path = [];
    let current = target;

    while (current !== null) {
      path.unshift(current);
      current = prev[current];
    }

    return path;
  };

  // Start algorithm
  const startAlgorithm = () => {
    const dijkstraSteps = generateDijkstraSteps();
    setSteps(dijkstraSteps);
    setCurrentStep(0);
    setIsPlaying(true);
  };

  // Step through algorithm
  const handleStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      const step = steps[currentStep + 1];
      setDistances(step.distances);
      setPrevious(step.previous);
      setVisitedNodes(step.visited);
      setCurrentNode(step.currentNode);
      setShortestPath(step.shortestPath);
    }
  };

  // Animation control
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      animationRef.current = setTimeout(() => {
        handleStep();
      }, speed);

      return () => clearTimeout(animationRef.current);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps, speed]);

  // Toggle play/pause
  const togglePlay = () => {
    if (!steps.length) {
      startAlgorithm();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Reset visualization
  const handleReset = () => {
    resetAlgorithm();
  };

  // Helper to get node coordinates
  const getNodeById = (id) => {
    return nodes.find((node) => node.id === id);
  };

  // Calculate if an edge is part of the shortest path
  const isEdgeInPath = (source, target) => {
    if (shortestPath.length < 2) return false;

    for (let i = 0; i < shortestPath.length - 1; i++) {
      if (
        (shortestPath[i] === source && shortestPath[i + 1] === target) ||
        (shortestPath[i] === target && shortestPath[i + 1] === source)
      ) {
        return true;
      }
    }

    return false;
  };

  // Get node status for styling
  const getNodeStatus = (nodeId) => {
    if (nodeId === sourceNode) return "source";
    if (nodeId === targetNode) return "target";
    if (nodeId === currentNode) return "current";
    if (shortestPath.includes(nodeId)) return "path";
    if (visitedNodes.includes(nodeId)) return "visited";
    return "unvisited";
  };

  // Get edge status for styling
  const getEdgeStatus = (edge) => {
    if (edge === steps[currentStep]?.evaluatingEdge) return "evaluating";
    if (isEdgeInPath(edge.source, edge.target)) return "path";
    if (
      visitedNodes.includes(edge.source) &&
      visitedNodes.includes(edge.target)
    )
      return "visited";
    return "unvisited";
  };

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader className="border-b pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">
            Dijkstra's Algorithm Visualizer
          </CardTitle>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPseudocode(!showPseudocode)}
                  >
                    <Code size={18} /> Pseudocode
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showPseudocode ? "Hide" : "Show"} Pseudocode
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {currentStep > 0 && steps.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                Step {currentStep} of {steps.length - 1}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <div className="flex-1 flex">
        {showPseudocode && (
          <div className="w-1/3 p-4 border-r overflow-auto bg-gray-50 dark:bg-gray-900">
            <h3 className="font-medium mb-2">Pseudocode</h3>
            <pre className="text-sm whitespace-pre-wrap bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              {pseudoCode}
            </pre>
          </div>
        )}

        <div className={`${showPseudocode ? "w-2/3" : "w-full"} flex flex-col`}>
          <div className="flex justify-between p-3 border-b bg-gray-50 dark:bg-gray-900">
            <div className="flex gap-2 items-center">
              <Select
                value={String(sourceNode)}
                onValueChange={(value) => {
                  setSourceNode(Number(value));
                  resetAlgorithm();
                }}
              >
                <SelectTrigger className="w-28 h-8">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem
                      key={`source-${node.id}`}
                      value={String(node.id)}
                    >
                      Node {node.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(targetNode)}
                onValueChange={(value) => {
                  setTargetNode(Number(value));
                  resetAlgorithm();
                }}
              >
                <SelectTrigger className="w-28 h-8">
                  <SelectValue placeholder="Target" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem
                      key={`target-${node.id}`}
                      value={String(node.id)}
                    >
                      Node {node.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span>Speed:</span>
              <Slider
                className="w-28"
                value={[speed]}
                min={100}
                max={1000}
                step={100}
                onValueChange={(value) => setSpeed(value[0])}
              />
              <span>{Math.round(1000 / speed)}x</span>
            </div>
          </div>

          <div className="flex-1 relative p-4 flex justify-center items-center">
            <svg
              ref={svgRef}
              className="max-w-full max-h-full"
              viewBox="0 0 500 300"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Render edges */}
              {edges.map((edge, index) => {
                const sourceNode = getNodeById(edge.source);
                const targetNode = getNodeById(edge.target);
                const edgeStatus = getEdgeStatus(edge);

                return (
                  <g key={`edge-${index}`}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      className={`stroke-2 ${
                        edgeStatus === "path"
                          ? "stroke-green-600"
                          : edgeStatus === "evaluating"
                          ? "stroke-yellow-500"
                          : edgeStatus === "visited"
                          ? "stroke-blue-300"
                          : "stroke-gray-300"
                      } ${
                        edgeStatus === "evaluating" || edgeStatus === "path"
                          ? "stroke-[3px]"
                          : ""
                      }`}
                    />

                    {/* Edge weight */}
                    <rect
                      x={(sourceNode.x + targetNode.x) / 2 - 8}
                      y={(sourceNode.y + targetNode.y) / 2 - 8}
                      width="16"
                      height="16"
                      rx="4"
                      className="fill-white stroke-gray-200"
                    />
                    <text
                      x={(sourceNode.x + targetNode.x) / 2}
                      y={(sourceNode.y + targetNode.y) / 2 + 4}
                      className="text-xs font-bold fill-gray-700"
                      textAnchor="middle"
                    >
                      {edge.weight}
                    </text>
                  </g>
                );
              })}

              {/* Render nodes */}
              {nodes.map((node) => {
                const nodeStatus = getNodeStatus(node.id);
                const distance = distances[node.id];

                return (
                  <g key={`node-${node.id}`}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={16} // Smaller radius
                      className={`
                        ${
                          nodeStatus === "source"
                            ? "fill-purple-600"
                            : nodeStatus === "target"
                            ? "fill-red-600"
                            : nodeStatus === "current"
                            ? "fill-yellow-500"
                            : nodeStatus === "path"
                            ? "fill-green-600"
                            : nodeStatus === "visited"
                            ? "fill-blue-500"
                            : "fill-gray-400"
                        }
                        stroke-2
                        ${
                          nodeStatus === "current"
                            ? "stroke-yellow-300"
                            : "stroke-white"
                        }
                      `}
                    />

                    {/* Node label */}
                    <text
                      x={node.x}
                      y={node.y + 1}
                      className="text-xs font-bold fill-white"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {node.label}
                    </text>

                    {/* Distance label */}
                    {distance !== undefined && (
                      <text
                        x={node.x}
                        y={node.y + 26}
                        className={`text-xs font-medium ${
                          distance === Infinity
                            ? "fill-gray-500"
                            : "fill-gray-900 dark:fill-gray-100"
                        }`}
                        textAnchor="middle"
                      >
                        {distance === Infinity ? "∞" : distance}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="p-2 flex flex-wrap gap-3 justify-center text-xs border-t bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-600 mr-1"></div>
              <span>Source</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-600 mr-1"></div>
              <span>Target</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span>Visited</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-600 mr-1"></div>
              <span>Shortest Path</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-400 mr-1"></div>
              <span>Unvisited</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <CardContent className="border-t p-4 flex flex-wrap gap-2 justify-center">
        <Button
          onClick={togglePlay}
          className="w-24"
          variant={isPlaying ? "secondary" : "default"}
        >
          {isPlaying ? (
            <Pause className="mr-1 h-4 w-4" />
          ) : (
            <Play className="mr-1 h-4 w-4" />
          )}
          {isPlaying ? "Pause" : "Play"}
        </Button>

        <Button
          variant="outline"
          onClick={handleStep}
          disabled={currentStep >= steps.length - 1}
          size="sm"
        >
          <StepForward className="mr-1 h-4 w-4" />
          Step
        </Button>

        <Button variant="outline" onClick={handleReset} size="sm">
          <RotateCcw className="mr-1 h-4 w-4" />
          Reset
        </Button>

        <Button variant="secondary" onClick={generateRandomGraph} size="sm">
          New Graph
        </Button>

        {/* Results display */}
        {currentStep > 0 && currentStep === steps.length - 1 && (
          <div className="w-full mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-blue-500" />
              <h3 className="font-medium text-sm">Results:</h3>
            </div>
            {shortestPath.length > 1 ? (
              <div className="text-sm mt-1">
                <p>
                  Shortest path:{" "}
                  <span className="font-medium">
                    {shortestPath
                      .map((nodeId) => nodes[nodeId]?.label)
                      .join(" → ")}
                  </span>
                </p>
                <p>
                  Total distance:{" "}
                  <span className="font-medium">{distances[targetNode]}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm mt-1">
                No path found from {nodes[sourceNode]?.label} to{" "}
                {nodes[targetNode]?.label}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DijkstraVisualizer;
