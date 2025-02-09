import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Graph Node Component
const GraphNode = ({ id, x, y, isVisited, isActive, onClick }) => (
  <motion.div
    className={`absolute w-12 h-12 rounded-full flex items-center justify-center cursor-pointer
      ${
        isVisited ? "bg-green-500" : isActive ? "bg-yellow-500" : "bg-blue-500"
      }`}
    style={{ left: x, top: y }}
    whileHover={{ scale: 1.1 }}
    onClick={onClick}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {id}
  </motion.div>
);

// Graph Edge Component
const GraphEdge = ({ start, end, isActive }) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const length = Math.sqrt(dx * dx + dy * dy);

  return (
    <motion.div
      className={`absolute h-0.5 origin-left ${
        isActive ? "bg-yellow-500" : "bg-gray-400"
      }`}
      style={{
        left: start.x + 24,
        top: start.y + 24,
        width: length,
        transform: `rotate(${angle}deg)`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    />
  );
};

// Tree Node Component
const TreeNode = ({ value, x, y, isVisited, isActive }) => (
  <motion.div
    className={`absolute w-12 h-12 rounded-full flex items-center justify-center
      ${
        isVisited ? "bg-green-500" : isActive ? "bg-yellow-500" : "bg-blue-500"
      }`}
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    {value}
  </motion.div>
);

// Stack Component
export const StackVisualizer = ({ items, activeIndex }) => (
  <div className="h-full flex flex-col-reverse items-center justify-end p-4 gap-2">
    <AnimatePresence>
      {items.map((item, index) => (
        <motion.div
          key={index}
          className={`w-48 h-12 flex items-center justify-center rounded 
            ${index === activeIndex ? "bg-yellow-500" : "bg-blue-500"}`}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
        >
          {item}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// Queue Component
export const QueueVisualizer = ({ items, activeIndex }) => (
  <div className="h-full flex items-center justify-start p-4 gap-2 overflow-x-auto">
    <AnimatePresence>
      {items.map((item, index) => (
        <motion.div
          key={index}
          className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded 
            ${index === activeIndex ? "bg-yellow-500" : "bg-blue-500"}`}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
        >
          {item}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

// Graph Visualizer Component
export const GraphVisualizer = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [activeNodes, setActiveNodes] = useState(new Set());
  const [activeEdges, setActiveEdges] = useState(new Set());

  useEffect(() => {
    // Initialize graph
    const initialNodes = [
      { id: 1, x: 200, y: 100 },
      { id: 2, x: 300, y: 200 },
      { id: 3, x: 100, y: 200 },
      { id: 4, x: 200, y: 300 },
      { id: 5, x: 300, y: 300 },
    ];

    const initialEdges = [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 4 },
      { from: 4, to: 5 },
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  const bfs = async (startNodeId) => {
    const visited = new Set();
    const queue = [startNodeId];
    const adjacencyList = edges.reduce((acc, { from, to }) => {
      if (!acc[from]) acc[from] = [];
      if (!acc[to]) acc[to] = [];
      acc[from].push(to);
      acc[to].push(from);
      return acc;
    }, {});

    while (queue.length > 0) {
      const nodeId = queue.shift();
      if (!visited.has(nodeId)) {
        visited.add(nodeId);
        setVisitedNodes(new Set(visited));
        setActiveNodes(new Set([nodeId]));

        const neighbors = adjacencyList[nodeId] || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            queue.push(neighbor);
            setActiveEdges(new Set([`${nodeId}-${neighbor}`]));
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }
    }
  };

  return (
    <div className="relative h-full">
      {edges.map(({ from, to }, index) => {
        const startNode = nodes.find((n) => n.id === from);
        const endNode = nodes.find((n) => n.id === to);
        return (
          <GraphEdge
            key={index}
            start={startNode}
            end={endNode}
            isActive={activeEdges.has(`${from}-${to}`)}
          />
        );
      })}
      {nodes.map((node) => (
        <GraphNode
          key={node.id}
          {...node}
          isVisited={visitedNodes.has(node.id)}
          isActive={activeNodes.has(node.id)}
          onClick={() => bfs(node.id)}
        />
      ))}
    </div>
  );
};

// Tree Visualizer Component
export const TreeVisualizer = () => {
  const [nodes, setNodes] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [activeNode, setActiveNode] = useState(null);

  useEffect(() => {
    // Initialize binary tree
    const initialNodes = [
      { id: 1, value: 1, x: 200, y: 50 },
      { id: 2, value: 2, x: 100, y: 150 },
      { id: 3, value: 3, x: 300, y: 150 },
      { id: 4, value: 4, x: 50, y: 250 },
      { id: 5, value: 5, x: 150, y: 250 },
      { id: 6, value: 6, x: 250, y: 250 },
      { id: 7, value: 7, x: 350, y: 250 },
    ];
    setNodes(initialNodes);
  }, []);

  const inorderTraversal = async (nodeId = 1, visited = new Set()) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Left subtree
    await inorderTraversal(nodeId * 2, visited);

    // Visit current node
    visited.add(nodeId);
    setVisitedNodes(new Set(visited));
    setActiveNode(nodeId);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Right subtree
    await inorderTraversal(nodeId * 2 + 1, visited);
  };

  return (
    <div className="relative h-full">
      {nodes.map((node) => (
        <React.Fragment key={node.id}>
          {node.id > 1 && (
            <div
              className="absolute h-0.5 bg-gray-400"
              style={{
                left: nodes[Math.floor(node.id / 2) - 1].x + 24,
                top: nodes[Math.floor(node.id / 2) - 1].y + 24,
                width: Math.abs(node.x - nodes[Math.floor(node.id / 2) - 1].x),
                transform:
                  node.id % 2 === 0 ? "rotate(45deg)" : "rotate(-45deg)",
              }}
            />
          )}
          <TreeNode
            {...node}
            isVisited={visitedNodes.has(node.id)}
            isActive={activeNode === node.id}
          />
        </React.Fragment>
      ))}
    </div>
  );
};
