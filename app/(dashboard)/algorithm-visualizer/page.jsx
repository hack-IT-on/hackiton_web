"use client";
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

// Import all component modules
import SortingVisualizer from "./_components/SortingVisualizer";
import SearchAlgorithmVisualizer from "./_components/SearchAlgorithmVisualizer";
import EnhancedLinkedListVisualizer from "./_components/EnhancedLinkedListVisualizer";
import BFS_DFS_Visualizer from "./_components/BFS_DFS_Visualizer";
import GraphMSTVisualizer from "./_components/GraphMSTVisualizer";
import DijkstraVisualizer from "./_components/DijkstraVisualizer";
import TreeVisualizer from "./_components/TreeVisualizer";
import StackQueueVisualizer from "./_components/StackQueueVisualizer";

const AlgorithmVisualizer = () => {
  const [currentTab, setCurrentTab] = useState("sorting");

  // Initialize tree nodes for the TreeVisualizer
  const [treeNodes, setTreeNodes] = useState([[1], [2, 3], [4, 5, 6, 7]]);
  const [activeTreeNode, setActiveTreeNode] = useState(null);

  // Initialize graph data for the GraphVisualizer
  const [graphNodes, setGraphNodes] = useState([
    { value: 1, x: 200, y: 150 },
    { value: 2, x: 150, y: 200 },
    { value: 3, x: 250, y: 200 },
  ]);
  const [graphEdges, setGraphEdges] = useState([
    { source: { x: 200, y: 150 }, target: { x: 150, y: 200 } },
    { source: { x: 200, y: 150 }, target: { x: 250, y: 200 } },
  ]);
  const [activeGraphNode, setActiveGraphNode] = useState(null);

  // Visualization renderer based on the selected tab
  const renderVisualization = () => {
    switch (currentTab) {
      case "sorting":
        return <SortingVisualizer />;
      case "linkedList":
        return <EnhancedLinkedListVisualizer />;
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
      case "bfs_dfs":
        return <BFS_DFS_Visualizer />;
      case "mst_algo":
        return <GraphMSTVisualizer />;
      case "dijkstra":
        return <DijkstraVisualizer />;
      case "stackQueue":
        return <StackQueueVisualizer />;
      default:
        return <div>Select a data structure or algorithm to visualize</div>;
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Algorithm Visualizer</h1>
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
            <TabsTrigger value="stackQueue">Stack & Queue</TabsTrigger>
            <TabsTrigger value="tree">Tree</TabsTrigger>
            <TabsTrigger value="bfs_dfs">BFS & DFS</TabsTrigger>
            <TabsTrigger value="mst_algo">MST Algos</TabsTrigger>
            <TabsTrigger value="dijkstra">Dijkstra's Algo</TabsTrigger>
          </TabsList>

          <Card className="mt-4 p-6">{renderVisualization()}</Card>
        </Tabs>
      </main>
    </div>
  );
};

export default AlgorithmVisualizer;
