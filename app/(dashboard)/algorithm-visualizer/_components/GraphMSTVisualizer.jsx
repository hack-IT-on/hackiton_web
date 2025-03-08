"use client";
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
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, StepForward, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Constants
const DEFAULT_SPEED = 500;

// Pseudo Code
const pseudoCode = {
  prim: `ALGORITHM Prim(G, start)
  // G is a weighted connected graph
  // Returns a Minimum Spanning Tree
  
  let MST = empty set
  let PQ = empty PriorityQueue // priority by weight
  let visited = empty set
  
  // Add all edges from start vertex to PQ
  Add start to visited
  for each edge (start, v) in G
    PQ.insert(edge(start, v))
  
  while PQ is not empty and |MST| < |V| - 1
    edge(u, v) = PQ.extractMin()
    if v not in visited
      Add v to visited
      Add edge(u, v) to MST
      for each edge (v, w) in G
        if w not in visited
          PQ.insert(edge(v, w))
  
  return MST`,

  kruskal: `ALGORITHM Kruskal(G)
  // G is a weighted connected graph
  // Returns a Minimum Spanning Tree
  
  let MST = empty set
  let edges = all edges in G sorted by weight
  let DS = DisjointSet(all vertices in G)
  
  for each edge (u, v) in edges
    if DS.Find(u) != DS.Find(v)
      Add edge(u, v) to MST
      DS.Union(u, v)
      if |MST| == |V| - 1
        break
  
  return MST`,
};

// MST Algorithms
const mstAlgorithms = {
  prim: {
    name: "Prim's Algorithm",
    generate: (graph) => {
      const steps = [];
      const nodes = [...graph.nodes];
      const edges = [...graph.edges];
      const mst = [];
      const visited = new Set();
      const edgesInMST = new Set();
      let stepCount = 0;

      // Start with the first node
      const startNode = nodes[0];
      visited.add(startNode.id);

      // Add first step - initial state
      steps.push({
        nodes: [...nodes],
        edges: [...edges],
        mst: [...mst],
        visited: Array.from(visited), // Explicitly convert Set to Array
        considering: [],
        added: null,
        stepCount: stepCount++,
        description: `Starting Prim's algorithm from node ${startNode.id}`,
      });

      // Find all edges connected to start node
      const availableEdges = edges.filter(
        (edge) =>
          (edge.source === startNode.id && !visited.has(edge.target)) ||
          (edge.target === startNode.id && !visited.has(edge.source))
      );

      // Priority queue simulation - sorting by weight
      while (visited.size < nodes.length) {
        // Sort available edges by weight
        availableEdges.sort((a, b) => a.weight - b.weight);

        if (availableEdges.length === 0) break;

        // Get the minimum weight edge
        const minEdge = availableEdges.shift();

        // Determine the node to visit
        const nextNode = visited.has(minEdge.source)
          ? minEdge.target
          : minEdge.source;

        // Add step - considering the min edge
        steps.push({
          nodes: [...nodes],
          edges: [...edges],
          mst: [...mst],
          visited: [...visited],
          considering: [minEdge],
          added: null,
          stepCount: stepCount++,
          description: `Considering edge (${minEdge.source}-${minEdge.target}) with weight ${minEdge.weight}`,
        });

        // Check if the destination node has been visited
        if (!visited.has(nextNode)) {
          // Add to MST
          mst.push(minEdge);
          edgesInMST.add(`${minEdge.source}-${minEdge.target}`);
          visited.add(nextNode);

          // Add step - after adding edge to MST
          steps.push({
            nodes: [...nodes],
            edges: [...edges],
            mst: [...mst],
            visited: [...visited],
            considering: [],
            added: minEdge,
            stepCount: stepCount++,
            description: `Added edge (${minEdge.source}-${
              minEdge.target
            }) to MST. Total weight: ${mst.reduce(
              (sum, e) => sum + e.weight,
              0
            )}`,
          });

          // Find new available edges
          const newEdges = edges.filter(
            (edge) =>
              ((edge.source === nextNode && !visited.has(edge.target)) ||
                (edge.target === nextNode && !visited.has(edge.source))) &&
              !edgesInMST.has(`${edge.source}-${edge.target}`) &&
              !edgesInMST.has(`${edge.target}-${edge.source}`)
          );

          // Add new edges to available edges
          availableEdges.push(...newEdges);

          // Add step - updated available edges
          steps.push({
            nodes: [...nodes],
            edges: [...edges],
            mst: [...mst],
            visited: [...visited],
            considering: availableEdges,
            added: null,
            stepCount: stepCount++,
            description: `Updated available edges from node ${nextNode}`,
          });
        }
      }

      // Final step
      steps.push({
        nodes: [...nodes],
        edges: [...edges],
        mst: [...mst],
        visited: [...visited],
        considering: [],
        added: null,
        stepCount: stepCount++,
        description: `MST complete! Total weight: ${mst.reduce(
          (sum, e) => sum + e.weight,
          0
        )}`,
      });

      return steps;
    },
  },

  kruskal: {
    name: "Kruskal's Algorithm",
    generate: (graph) => {
      const steps = [];
      const nodes = [...graph.nodes];
      const edges = [...graph.edges].sort((a, b) => a.weight - b.weight);
      const mst = [];
      let stepCount = 0;

      // Initialize disjoint set
      const parent = {};
      const rank = {};

      // Make Set
      for (const node of nodes) {
        parent[node.id] = node.id;
        rank[node.id] = 0;
      }

      // Find with path compression
      const find = (x) => {
        if (parent[x] !== x) {
          parent[x] = find(parent[x]);
        }
        return parent[x];
      };

      // Union by rank
      const union = (x, y) => {
        const rootX = find(x);
        const rootY = find(y);

        if (rootX === rootY) return false;

        if (rank[rootX] < rank[rootY]) {
          parent[rootX] = rootY;
        } else if (rank[rootX] > rank[rootY]) {
          parent[rootY] = rootX;
        } else {
          parent[rootY] = rootX;
          rank[rootX]++;
        }

        return true;
      };

      // Initial step
      steps.push({
        nodes: [...nodes],
        edges: [...edges],
        mst: [...mst],
        sortedEdges: [...edges],
        considering: [],
        added: null,
        rejected: null,
        stepCount: stepCount++,
        description: `Starting Kruskal's algorithm with ${edges.length} edges sorted by weight`,
      });

      // Go through each edge
      for (const edge of edges) {
        // Add step - considering the current edge
        steps.push({
          nodes: [...nodes],
          edges: [...edges],
          mst: [...mst],
          sortedEdges: [...edges],
          considering: [edge],
          added: null,
          rejected: null,
          stepCount: stepCount++,
          description: `Considering edge (${edge.source}-${edge.target}) with weight ${edge.weight}`,
        });

        // Check if adding edge creates a cycle
        if (union(edge.source, edge.target)) {
          // Add to MST
          mst.push(edge);

          // Add step - after adding edge to MST
          steps.push({
            nodes: [...nodes],
            edges: [...edges],
            mst: [...mst],
            sortedEdges: [...edges],
            considering: [],
            added: edge,
            rejected: null,
            stepCount: stepCount++,
            description: `Added edge (${edge.source}-${
              edge.target
            }) to MST. Total weight: ${mst.reduce(
              (sum, e) => sum + e.weight,
              0
            )}`,
          });
        } else {
          // Add step - rejected edge (would create cycle)
          steps.push({
            nodes: [...nodes],
            edges: [...edges],
            mst: [...mst],
            sortedEdges: [...edges],
            considering: [],
            added: null,
            rejected: edge,
            stepCount: stepCount++,
            description: `Rejected edge (${edge.source}-${edge.target}) - would create a cycle`,
          });
        }

        // Check if MST is complete
        if (mst.length === nodes.length - 1) {
          break;
        }
      }

      // Final step
      steps.push({
        nodes: [...nodes],
        edges: [...edges],
        mst: [...mst],
        sortedEdges: [...edges],
        considering: [],
        added: null,
        rejected: null,
        stepCount: stepCount++,
        description: `MST complete! Total weight: ${mst.reduce(
          (sum, e) => sum + e.weight,
          0
        )}`,
      });

      return steps;
    },
  },
};

// Sample Graphs
const sampleGraphs = {
  simple: {
    name: "Simple Graph (5 nodes)",
    data: {
      nodes: [
        { id: 1, label: "A", x: 100, y: 100 },
        { id: 2, label: "B", x: 300, y: 100 },
        { id: 3, label: "C", x: 200, y: 300 },
        { id: 4, label: "D", x: 100, y: 400 },
        { id: 5, label: "E", x: 300, y: 400 },
      ],
      edges: [
        { source: 1, target: 2, weight: 10 },
        { source: 1, target: 3, weight: 6 },
        { source: 2, target: 3, weight: 5 },
        { source: 2, target: 5, weight: 15 },
        { source: 3, target: 4, weight: 8 },
        { source: 3, target: 5, weight: 4 },
        { source: 4, target: 5, weight: 12 },
      ],
    },
  },
  medium: {
    name: "Medium Graph (7 nodes)",
    data: {
      nodes: [
        { id: 1, label: "A", x: 150, y: 100 },
        { id: 2, label: "B", x: 300, y: 100 },
        { id: 3, label: "C", x: 400, y: 200 },
        { id: 4, label: "D", x: 300, y: 300 },
        { id: 5, label: "E", x: 150, y: 300 },
        { id: 6, label: "F", x: 50, y: 200 },
        { id: 7, label: "G", x: 250, y: 200 },
      ],
      edges: [
        { source: 1, target: 2, weight: 7 },
        { source: 1, target: 6, weight: 5 },
        { source: 2, target: 3, weight: 8 },
        { source: 2, target: 7, weight: 9 },
        { source: 3, target: 4, weight: 7 },
        { source: 3, target: 7, weight: 5 },
        { source: 4, target: 5, weight: 8 },
        { source: 4, target: 7, weight: 6 },
        { source: 5, target: 6, weight: 9 },
        { source: 5, target: 7, weight: 7 },
        { source: 6, target: 7, weight: 8 },
        { source: 6, target: 1, weight: 5 },
      ],
    },
  },
  large: {
    name: "Large Graph (10 nodes)",
    data: {
      nodes: [
        { id: 1, label: "A", x: 200, y: 50 },
        { id: 2, label: "B", x: 350, y: 100 },
        { id: 3, label: "C", x: 400, y: 200 },
        { id: 4, label: "D", x: 350, y: 300 },
        { id: 5, label: "E", x: 200, y: 350 },
        { id: 6, label: "F", x: 50, y: 300 },
        { id: 7, label: "G", x: 0, y: 200 },
        { id: 8, label: "H", x: 50, y: 100 },
        { id: 9, label: "I", x: 150, y: 150 },
        { id: 10, label: "J", x: 250, y: 250 },
      ],
      edges: [
        { source: 1, target: 2, weight: 4 },
        { source: 1, target: 8, weight: 8 },
        { source: 2, target: 3, weight: 8 },
        { source: 2, target: 9, weight: 11 },
        { source: 3, target: 4, weight: 7 },
        { source: 3, target: 10, weight: 4 },
        { source: 4, target: 5, weight: 9 },
        { source: 4, target: 10, weight: 14 },
        { source: 5, target: 6, weight: 10 },
        { source: 5, target: 10, weight: 2 },
        { source: 6, target: 7, weight: 2 },
        { source: 6, target: 9, weight: 7 },
        { source: 7, target: 8, weight: 1 },
        { source: 7, target: 9, weight: 6 },
        { source: 8, target: 1, weight: 8 },
        { source: 8, target: 9, weight: 7 },
        { source: 9, target: 10, weight: 2 },
      ],
    },
  },
  complete: {
    name: "Complete Graph (6 nodes)",
    data: {
      nodes: [
        { id: 1, label: "A", x: 200, y: 50 },
        { id: 2, label: "B", x: 350, y: 150 },
        { id: 3, label: "C", x: 300, y: 300 },
        { id: 4, label: "D", x: 100, y: 300 },
        { id: 5, label: "E", x: 50, y: 150 },
        { id: 6, label: "F", x: 200, y: 200 },
      ],
      edges: [
        { source: 1, target: 2, weight: 3 },
        { source: 1, target: 3, weight: 5 },
        { source: 1, target: 4, weight: 9 },
        { source: 1, target: 5, weight: 7 },
        { source: 1, target: 6, weight: 4 },
        { source: 2, target: 3, weight: 4 },
        { source: 2, target: 4, weight: 11 },
        { source: 2, target: 5, weight: 9 },
        { source: 2, target: 6, weight: 6 },
        { source: 3, target: 4, weight: 8 },
        { source: 3, target: 5, weight: 12 },
        { source: 3, target: 6, weight: 3 },
        { source: 4, target: 5, weight: 4 },
        { source: 4, target: 6, weight: 5 },
        { source: 5, target: 6, weight: 6 },
      ],
    },
  },
  sparse: {
    name: "Sparse Graph (8 nodes)",
    data: {
      nodes: [
        { id: 1, label: "A", x: 100, y: 100 },
        { id: 2, label: "B", x: 300, y: 100 },
        { id: 3, label: "C", x: 400, y: 200 },
        { id: 4, label: "D", x: 350, y: 300 },
        { id: 5, label: "E", x: 200, y: 350 },
        { id: 6, label: "F", x: 50, y: 300 },
        { id: 7, label: "G", x: 50, y: 200 },
        { id: 8, label: "H", x: 200, y: 200 },
      ],
      edges: [
        { source: 1, target: 2, weight: 6 },
        { source: 2, target: 3, weight: 4 },
        { source: 3, target: 4, weight: 8 },
        { source: 4, target: 5, weight: 5 },
        { source: 5, target: 6, weight: 7 },
        { source: 6, target: 7, weight: 3 },
        { source: 7, target: 1, weight: 9 },
        { source: 8, target: 1, weight: 4 },
        { source: 8, target: 3, weight: 6 },
        { source: 8, target: 5, weight: 7 },
        { source: 8, target: 7, weight: 5 },
      ],
    },
  },
};

// Main Component
const GraphMSTVisualizer = () => {
  // State
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("prim");
  const [selectedGraph, setSelectedGraph] = useState("simple");
  const [currentGraph, setCurrentGraph] = useState(sampleGraphs.simple.data);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [showPseudocode, setShowPseudocode] = useState(false);

  // Animation ref
  const animationRef = useRef(null);

  // Initialize steps when algorithm or graph changes
  useEffect(() => {
    generateSteps();
  }, [selectedAlgorithm, selectedGraph]);

  // Handle animation
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      animationRef.current = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, speed);

      return () => clearTimeout(animationRef.current);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps, speed]);

  // Generate algorithm steps
  const generateSteps = () => {
    const graph = sampleGraphs[selectedGraph].data;
    setCurrentGraph(graph);
    const generatedSteps = mstAlgorithms[selectedAlgorithm].generate({
      nodes: graph.nodes,
      edges: graph.edges,
    });
    setSteps(generatedSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Controls
  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Graph rendering
  const renderGraph = () => {
    if (!steps.length || !steps[currentStep]) return null;

    const step = steps[currentStep];
    const { nodes, edges, mst, considering, added, rejected } = step;

    // Helper function to get edge status class
    const getEdgeClass = (edge) => {
      // Check if edge is in MST
      const inMST = mst.some(
        (e) =>
          (e.source === edge.source && e.target === edge.target) ||
          (e.source === edge.target && e.target === edge.source)
      );

      if (inMST) return "stroke-green-500 stroke-[3px]";

      // Check if edge is being considered
      const isConsidering = considering.some(
        (e) =>
          (e.source === edge.source && e.target === edge.target) ||
          (e.source === edge.target && e.target === edge.source)
      );

      if (isConsidering) return "stroke-yellow-500 stroke-[3px]";

      // Check if edge was just added
      const isAdded =
        added &&
        ((added.source === edge.source && added.target === edge.target) ||
          (added.source === edge.target && added.target === edge.source));

      if (isAdded) return "stroke-green-500 stroke-[3px]";

      // Check if edge was just rejected
      const isRejected =
        rejected &&
        ((rejected.source === edge.source && rejected.target === edge.target) ||
          (rejected.source === edge.target && rejected.target === edge.source));

      if (isRejected) return "stroke-red-500 stroke-[3px]";

      return "stroke-gray-400";
    };

    const getNodeClass = (node) => {
      if (selectedAlgorithm === "prim") {
        // Check if visited exists and if node.id is in the visited array
        const isVisited = step.visited && step.visited.includes(node.id);
        if (isVisited) return "fill-green-500";
      }

      // Check if node is in MST (connected by an edge)
      const inMST = mst.some(
        (e) => e.source === node.id || e.target === node.id
      );
      if (inMST) return "fill-green-500";

      return "fill-blue-500";
    };

    return (
      <div className="h-96 border rounded-lg bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
        <div className="flex justify-between p-4">
          <div>
            <Button
              variant="outline"
              onClick={() => setShowPseudocode(!showPseudocode)}
            >
              {showPseudocode ? "Hide" : "Show"} Pseudocode
            </Button>
            <Badge variant="secondary" className="ml-4">
              Step: {currentStep + 1} of {steps.length}
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
            className={`${showPseudocode ? "w-2/3" : "w-full"} h-full relative`}
          >
            <svg className="w-full h-full" viewBox="0 0 500 500">
              {/* Edges */}
              {edges.map((edge, index) => {
                const sourceNode = nodes.find((n) => n.id === edge.source);
                const targetNode = nodes.find((n) => n.id === edge.target);

                if (!sourceNode || !targetNode) return null;

                return (
                  <g key={`edge-${index}`}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      className={`${getEdgeClass(
                        edge
                      )} transition-all duration-300`}
                      strokeWidth="2"
                    />
                    {/* Edge weight */}
                    <text
                      x={(sourceNode.x + targetNode.x) / 2}
                      y={(sourceNode.y + targetNode.y) / 2}
                      dy="-5"
                      className="fill-black dark:fill-white text-sm font-bold"
                      textAnchor="middle"
                    >
                      {edge.weight}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node, index) => (
                <g
                  key={`node-${index}`}
                  transform={`translate(${node.x},${node.y})`}
                >
                  <circle
                    r="20"
                    className={`${getNodeClass(
                      node
                    )} transition-all duration-300`}
                  />
                  <text
                    className="fill-white text-sm font-bold"
                    textAnchor="middle"
                    dy=".3em"
                  >
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>

            {/* Step description */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
              {step.description}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Algorithm" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(mstAlgorithms).map(([key, algo]) => (
              <SelectItem key={key} value={key}>
                {algo.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedGraph} onValueChange={setSelectedGraph}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Graph" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sampleGraphs).map(([key, graph]) => (
              <SelectItem key={key} value={key}>
                {graph.name}
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
          disabled={currentStep >= steps.length - 1}
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

      {renderGraph()}

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
          <span>Unvisited Node</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span>Visited Node / In MST</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
          <span>Considering Edge</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 mr-2"></div>
          <span>Edge in MST</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 mr-2"></div>
          <span>Rejected Edge</span>
        </div>
      </div>
    </div>
  );
};

export default GraphMSTVisualizer;
