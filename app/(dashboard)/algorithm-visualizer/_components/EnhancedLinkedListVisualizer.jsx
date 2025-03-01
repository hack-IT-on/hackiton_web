import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ArrowRight, RotateCcw, Search } from "lucide-react";

// Helper function to generate random memory addresses
const generateAddress = () => {
  return `0x${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")
    .toUpperCase()}`;
};

// Node components for different linked list types
const SinglyNode = ({ node, isHighlighted, isHead, isTail }) => (
  <motion.div
    className="flex flex-col items-center mb-4"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center">
      {isHead && (
        <div className="mr-2 text-sm font-semibold text-blue-600">HEAD</div>
      )}
      <div
        className={`flex flex-col p-2 rounded-md border-2 w-40 ${
          isHighlighted ? "border-green-500 bg-green-100" : "border-gray-400"
        }`}
      >
        <div className="text-xs text-gray-500">Address: {node.address}</div>
        <div className="text-xl font-bold text-center">{node.value}</div>
        <div className="text-xs text-gray-500 mt-1">
          Next: {node.next || "NULL"}
        </div>
      </div>
      {isTail && (
        <div className="ml-2 text-sm font-semibold text-blue-600">TAIL</div>
      )}
    </div>
    {!isTail && (
      <div className="flex items-center h-8">
        <ArrowRight className="text-gray-400" />
      </div>
    )}
  </motion.div>
);

const DoublyNode = ({ node, isHighlighted, isHead, isTail }) => (
  <motion.div
    className="flex flex-col items-center mb-4"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center">
      {isHead && (
        <div className="mr-2 text-sm font-semibold text-blue-600">HEAD</div>
      )}
      <div
        className={`flex flex-col p-2 rounded-md border-2 w-48 ${
          isHighlighted ? "border-green-500 bg-green-100" : "border-gray-400"
        }`}
      >
        <div className="text-xs text-gray-500">Address: {node.address}</div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Prev: {node.prev || "NULL"}</span>
        </div>
        <div className="text-xl font-bold text-center my-1">{node.value}</div>
        <div className="text-xs text-gray-500">Next: {node.next || "NULL"}</div>
      </div>
      {isTail && (
        <div className="ml-2 text-sm font-semibold text-blue-600">TAIL</div>
      )}
    </div>
    {!isTail && (
      <div className="flex flex-col items-center h-8">
        <div className="flex w-16 justify-between">
          <ArrowRight className="text-gray-400 transform rotate-180" />
          <ArrowRight className="text-gray-400" />
        </div>
      </div>
    )}
  </motion.div>
);

const CircularNode = ({ node, isHighlighted, isHead, showReturn }) => (
  <motion.div
    className="flex flex-col items-center mb-4"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center">
      {isHead && (
        <div className="mr-2 text-sm font-semibold text-blue-600">HEAD</div>
      )}
      <div
        className={`flex flex-col p-2 rounded-md border-2 w-40 ${
          isHighlighted ? "border-green-500 bg-green-100" : "border-gray-400"
        }`}
      >
        <div className="text-xs text-gray-500">Address: {node.address}</div>
        <div className="text-xl font-bold text-center">{node.value}</div>
        <div className="text-xs text-gray-500 mt-1">Next: {node.next}</div>
      </div>
    </div>
    {!showReturn ? (
      <div className="flex items-center h-8">
        <ArrowRight className="text-gray-400" />
      </div>
    ) : (
      <div className="flex items-center justify-center w-full h-8 relative">
        <div className="absolute left-0 w-full h-8 border-b-2 border-gray-400 rounded-b-lg"></div>
        <div className="absolute left-0 h-16 border-l-2 border-gray-400"></div>
        <div className="absolute bottom-0 w-full flex justify-center">
          <ArrowRight className="text-gray-400 transform -rotate-90" />
        </div>
      </div>
    )}
  </motion.div>
);

// Enhanced LinkedList Visualizer
const EnhancedLinkedListVisualizer = () => {
  const [listType, setListType] = useState("singly");
  const [nodes, setNodes] = useState([]);
  const [activeNodeIndex, setActiveNodeIndex] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [insertPosition, setInsertPosition] = useState("end");
  const [deletePosition, setDeletePosition] = useState("end");
  const [operationHistory, setOperationHistory] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  // Initialize with some nodes
  useEffect(() => {
    resetList();
  }, [listType]);

  const resetList = () => {
    const initialNodes = [];

    // Create 3 initial nodes based on list type
    for (let i = 1; i <= 3; i++) {
      const address = generateAddress();
      if (listType === "singly") {
        initialNodes.push({
          value: i * 10,
          address,
          next: i < 3 ? null : null, // Will be set after
        });
      } else if (listType === "doubly") {
        initialNodes.push({
          value: i * 10,
          address,
          next: null,
          prev: null,
        });
      } else if (listType === "circular") {
        initialNodes.push({
          value: i * 10,
          address,
          next: null,
        });
      }
    }

    // Set the next/prev pointers
    for (let i = 0; i < initialNodes.length; i++) {
      if (i < initialNodes.length - 1) {
        initialNodes[i].next = initialNodes[i + 1].address;
      }

      if (listType === "doubly" && i > 0) {
        initialNodes[i].prev = initialNodes[i - 1].address;
      }

      if (listType === "circular" && i === initialNodes.length - 1) {
        initialNodes[i].next = initialNodes[0].address;
      }
    }

    setNodes(initialNodes);
    setActiveNodeIndex(null);
    setOperationHistory([
      { type: "reset", message: `Initialized ${listType} linked list` },
    ]);
    setSearchResult(null);
  };

  const addNode = () => {
    if (!inputValue.trim()) return;

    const newValue = parseInt(inputValue) || Math.floor(Math.random() * 100);
    const newAddress = generateAddress();

    const newNode = {
      value: newValue,
      address: newAddress,
      next: null,
    };

    if (listType === "doubly") {
      newNode.prev = null;
    }

    let updatedNodes = [...nodes];
    let operationMsg = "";

    if (insertPosition === "start") {
      // Insert at beginning
      newNode.next = updatedNodes.length > 0 ? updatedNodes[0].address : null;

      if (listType === "doubly" && updatedNodes.length > 0) {
        updatedNodes[0].prev = newAddress;
      }

      if (listType === "circular" && updatedNodes.length > 0) {
        if (updatedNodes.length > 1) {
          newNode.next = updatedNodes[0].address;
          updatedNodes[updatedNodes.length - 1].next = newAddress;
        } else {
          newNode.next = newAddress; // Points to itself if only node
        }
      }

      updatedNodes = [newNode, ...updatedNodes];
      operationMsg = `Added node with value ${newValue} at the beginning`;
    } else if (insertPosition === "end") {
      // Insert at end
      if (updatedNodes.length > 0) {
        if (listType === "circular") {
          newNode.next = updatedNodes[0].address;
          updatedNodes[updatedNodes.length - 1].next = newAddress;
        } else {
          updatedNodes[updatedNodes.length - 1].next = newAddress;
        }

        if (listType === "doubly") {
          newNode.prev = updatedNodes[updatedNodes.length - 1].address;
        }
      } else if (listType === "circular") {
        newNode.next = newAddress; // Points to itself if only node
      }

      updatedNodes.push(newNode);
      operationMsg = `Added node with value ${newValue} at the end`;
    } else {
      // Insert after specified position
      const position = parseInt(insertPosition);
      if (position >= 0 && position < updatedNodes.length) {
        newNode.next =
          position < updatedNodes.length - 1
            ? updatedNodes[position + 1].address
            : listType === "circular"
            ? updatedNodes[0].address
            : null;
        updatedNodes[position].next = newAddress;

        if (listType === "doubly") {
          newNode.prev = updatedNodes[position].address;
          if (position < updatedNodes.length - 1) {
            updatedNodes[position + 1].prev = newAddress;
          }
        }

        updatedNodes.splice(position + 1, 0, newNode);
        operationMsg = `Added node with value ${newValue} after position ${position}`;
      }
    }

    setNodes(updatedNodes);
    setInputValue("");
    setOperationHistory([
      ...operationHistory,
      { type: "add", message: operationMsg },
    ]);
  };

  const deleteNode = (position) => {
    if (nodes.length === 0) return;

    let updatedNodes = [...nodes];
    let operationMsg = "";

    if (position === "start") {
      // Delete from beginning
      operationMsg = `Deleted node with value ${updatedNodes[0].value} from the beginning`;

      if (updatedNodes.length > 1) {
        if (listType === "doubly") {
          updatedNodes[1].prev = null;
        }

        if (listType === "circular") {
          updatedNodes[updatedNodes.length - 1].next = updatedNodes[1].address;
        }
      }

      updatedNodes.shift();
    } else if (position === "end") {
      // Delete from end
      operationMsg = `Deleted node with value ${
        updatedNodes[updatedNodes.length - 1].value
      } from the end`;

      if (updatedNodes.length > 1) {
        updatedNodes[updatedNodes.length - 2].next =
          listType === "circular" ? updatedNodes[0].address : null;
      }

      updatedNodes.pop();
    } else {
      // Delete at specified position
      const pos = parseInt(position);
      if (pos >= 0 && pos < updatedNodes.length) {
        operationMsg = `Deleted node with value ${updatedNodes[pos].value} at position ${pos}`;

        if (pos > 0 && pos < updatedNodes.length - 1) {
          updatedNodes[pos - 1].next = updatedNodes[pos + 1].address;

          if (listType === "doubly") {
            updatedNodes[pos + 1].prev = updatedNodes[pos - 1].address;
          }
        } else if (pos === 0) {
          if (updatedNodes.length > 1) {
            if (listType === "doubly") {
              updatedNodes[1].prev = null;
            }

            if (listType === "circular" && updatedNodes.length > 2) {
              updatedNodes[updatedNodes.length - 1].next =
                updatedNodes[1].address;
            }
          }
        } else if (pos === updatedNodes.length - 1) {
          updatedNodes[pos - 1].next =
            listType === "circular" ? updatedNodes[0].address : null;
        }

        updatedNodes.splice(pos, 1);
      }
    }

    setNodes(updatedNodes);
    setOperationHistory([
      ...operationHistory,
      { type: "delete", message: operationMsg },
    ]);
  };

  const searchNode = () => {
    const value = parseInt(searchValue);
    if (!value && value !== 0) return;

    const index = nodes.findIndex((node) => node.value === value);
    setSearchResult(
      index >= 0
        ? {
            found: true,
            index,
            message: `Found value ${value} at position ${index}`,
          }
        : { found: false, message: `Value ${value} not found in the list` }
    );

    setActiveNodeIndex(index >= 0 ? index : null);
    setOperationHistory([
      ...operationHistory,
      {
        type: "search",
        message:
          index >= 0
            ? `Searched for value ${value} - found at position ${index}`
            : `Searched for value ${value} - not found`,
      },
    ]);
  };

  const renderNodes = () => {
    if (listType === "singly") {
      return (
        <div className="flex flex-wrap">
          {nodes.map((node, index) => (
            <SinglyNode
              key={node.address}
              node={node}
              isHighlighted={index === activeNodeIndex}
              isHead={index === 0}
              isTail={index === nodes.length - 1}
            />
          ))}
        </div>
      );
    } else if (listType === "doubly") {
      return (
        <div className="flex flex-wrap">
          {nodes.map((node, index) => (
            <DoublyNode
              key={node.address}
              node={node}
              isHighlighted={index === activeNodeIndex}
              isHead={index === 0}
              isTail={index === nodes.length - 1}
            />
          ))}
        </div>
      );
    } else if (listType === "circular") {
      return (
        <div className="flex flex-wrap">
          {nodes.map((node, index) => (
            <CircularNode
              key={node.address}
              node={node}
              isHighlighted={index === activeNodeIndex}
              isHead={index === 0}
              showReturn={index === nodes.length - 1}
            />
          ))}
        </div>
      );
    }
  };

  const getInsertPositionOptions = () => {
    const options = [
      { value: "start", label: "At Beginning" },
      { value: "end", label: "At End" },
    ];

    // Add position-specific options
    nodes.forEach((_, index) => {
      options.push({
        value: `${index}`,
        label: `After Position ${index} (Value: ${nodes[index].value})`,
      });
    });

    return options;
  };

  const getDeletePositionOptions = () => {
    const options = [
      { value: "start", label: "From Beginning" },
      { value: "end", label: "From End" },
    ];

    // Add position-specific options
    nodes.forEach((_, index) => {
      options.push({
        value: `${index}`,
        label: `At Position ${index} (Value: ${nodes[index].value})`,
      });
    });

    return options;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Linked List Visualizer</h2>
            <p className="text-sm text-gray-500">
              Visualize different types of linked lists and their operations
            </p>
          </div>
          <Select value={listType} onValueChange={setListType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="List Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="singly">Singly Linked List</SelectItem>
              <SelectItem value="doubly">Doubly Linked List</SelectItem>
              <SelectItem value="circular">Circular Linked List</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg p-4 mb-6 overflow-x-auto max-h-96">
          <div className="min-w-max">{renderNodes()}</div>
        </div>

        <Tabs defaultValue="insert" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="insert" className="flex-1">
              Insert Node
            </TabsTrigger>
            <TabsTrigger value="delete" className="flex-1">
              Delete Node
            </TabsTrigger>
            <TabsTrigger value="search" className="flex-1">
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insert" className="space-y-4">
            <div className="flex gap-4">
              <Input
                type="number"
                placeholder="Enter value"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-32"
              />

              <Select value={insertPosition} onValueChange={setInsertPosition}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  {getInsertPositionOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={addNode} className="w-32">
                <Plus className="mr-2 h-4 w-4" />
                Insert
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="delete" className="space-y-4">
            <div className="flex gap-4">
              <Select value={deletePosition} onValueChange={setDeletePosition}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  {getDeletePositionOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={() => deleteNode(deletePosition)}
                className="w-32"
              >
                <Minus className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-4">
              <Input
                type="number"
                placeholder="Search value"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex-1"
              />

              <Button onClick={searchNode} className="w-32">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>

            {searchResult && (
              <div
                className={`p-2 rounded-md ${
                  searchResult.found ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {searchResult.message}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Operation History</h3>
            <Button variant="outline" size="sm" onClick={resetList}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset List
            </Button>
          </div>

          <div className="border rounded-md p-2 h-32 overflow-y-auto">
            {operationHistory.length === 0 ? (
              <p className="text-sm text-gray-500">
                No operations performed yet
              </p>
            ) : (
              operationHistory.map((op, index) => (
                <div key={index} className="flex items-center mb-1">
                  <Badge
                    variant="outline"
                    className={
                      op.type === "add"
                        ? "bg-green-100"
                        : op.type === "delete"
                        ? "bg-red-100"
                        : op.type === "search"
                        ? "bg-blue-100"
                        : "bg-gray-100"
                    }
                  >
                    {op.type}
                  </Badge>
                  <span className="text-sm ml-2">{op.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedLinkedListVisualizer;
