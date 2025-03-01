import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Minus,
  Play,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Search,
  Info,
  XCircle,
  Layers,
  ArrowLeftRight,
  MoreHorizontal,
} from "lucide-react";

const TreeNode = ({
  value,
  isHighlighted,
  isSearchTarget,
  level,
  position,
  parentPosition,
  balance,
  scale,
  onClick,
}) => {
  const nodeSpacing = 40 * scale;
  const levelHeight = 40 * scale;
  const x = position * nodeSpacing;
  const y = level * levelHeight;

  // Determine node appearance based on highlighting and balance
  let nodeClass =
    "transition-all duration-300 transform w-8 h-8 rounded-full border-2 flex items-center justify-center";

  if (isSearchTarget) {
    nodeClass +=
      " border-purple-500 bg-purple-100 text-purple-800 font-bold scale-110";
  } else if (isHighlighted) {
    nodeClass += " border-green-500 bg-green-100 text-green-800 font-bold";
  } else {
    nodeClass += " border-gray-400 bg-white";
  }

  return (
    <div
      className="absolute"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      {parentPosition && (
        <svg
          className="absolute top-0 left-0 -z-10"
          style={{
            width: Math.abs(x - parentPosition.x),
            height: Math.abs(y - parentPosition.y),
            transform: `translate(${
              x < parentPosition.x ? 0 : -Math.abs(x - parentPosition.x)
            }px, ${-levelHeight}px)`,
          }}
        >
          <line
            x1={x < parentPosition.x ? Math.abs(x - parentPosition.x) : 0}
            y1={0}
            x2={x < parentPosition.x ? 0 : Math.abs(x - parentPosition.x)}
            y2={levelHeight}
            stroke={isHighlighted ? "#10b981" : "#d1d5db"}
            strokeWidth="2"
            strokeDasharray={isHighlighted ? "0" : "0"}
            className="transition-all duration-300"
          />
        </svg>
      )}
      <div className="relative">
        <div
          className={nodeClass}
          onClick={() => onClick && onClick(value)}
          style={{ cursor: onClick ? "pointer" : "default" }}
        >
          {value}
        </div>
        {balance !== undefined && (
          <Badge
            variant={
              balance === 0
                ? "outline"
                : Math.abs(balance) > 1
                ? "destructive"
                : "secondary"
            }
            className="absolute -bottom-6 -right-2 text-xs"
          >
            {balance > 0 ? "+" : ""}
            {balance}
          </Badge>
        )}
      </div>
    </div>
  );
};

class AVLNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}

const TreeVisualizer = () => {
  const [root, setRoot] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [message, setMessage] = useState({ text: "", type: "info" });
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [searchTarget, setSearchTarget] = useState(null);
  const [treeLayout, setTreeLayout] = useState([]);
  const [scale, setScale] = useState(1);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  const [operationHistory, setOperationHistory] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [insertionMode, setInsertionMode] = useState("single");
  const [activeTab, setActiveTab] = useState("operations");

  const getHeight = (node) => {
    return node ? node.height : 0;
  };

  const getBalance = (node) => {
    return node ? getHeight(node.left) - getHeight(node.right) : 0;
  };

  const updateHeight = (node) => {
    if (node) {
      node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1;
    }
  };

  const rightRotate = (y) => {
    const x = y.left;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    updateHeight(y);
    updateHeight(x);

    addToHistory(`Right rotation performed on node ${y.value}`);
    return x;
  };

  const leftRotate = (x) => {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    updateHeight(x);
    updateHeight(y);

    addToHistory(`Left rotation performed on node ${x.value}`);
    return y;
  };

  const calculateLayout = useCallback(
    (node, level = 0, position = 0, parentPos = null) => {
      if (!node) return [];

      const layout = [];
      layout.push({
        value: node.value,
        level,
        position,
        parentPosition: parentPos,
        balance: getBalance(node),
      });

      const spacing = Math.pow(2, 3 - level);
      const leftSubtree = calculateLayout(
        node.left,
        level + 1,
        position - spacing,
        { x: position * 40 * scale, y: level * 40 * scale }
      );
      const rightSubtree = calculateLayout(
        node.right,
        level + 1,
        position + spacing,
        { x: position * 40 * scale, y: level * 40 * scale }
      );

      return [...layout, ...leftSubtree, ...rightSubtree];
    },
    [scale]
  );

  const addToHistory = (operation) => {
    setOperationHistory((prev) => [operation, ...prev.slice(0, 9)]);
  };

  const insertNode = () => {
    if (insertionMode === "single") {
      insertSingleNode();
    } else {
      insertMultipleNodes();
    }
  };

  const insertSingleNode = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage({ text: "Please enter a valid number", type: "error" });
      return;
    }

    const insert = (node, val) => {
      if (!node) {
        addToHistory(`Inserted node ${val}`);
        return new AVLNode(val);
      }

      if (val < node.value) {
        node.left = insert(node.left, val);
      } else if (val > node.value) {
        node.right = insert(node.right, val);
      } else {
        setMessage({
          text: `Value ${val} already exists in the tree`,
          type: "warning",
        });
        return node;
      }

      updateHeight(node);

      const balance = getBalance(node);

      if (balance > 1 && val < node.left.value) {
        addToHistory(
          `Imbalance detected at node ${node.value} (balance: ${balance})`
        );
        return rightRotate(node);
      }

      if (balance < -1 && val > node.right.value) {
        addToHistory(
          `Imbalance detected at node ${node.value} (balance: ${balance})`
        );
        return leftRotate(node);
      }

      if (balance > 1 && val > node.left.value) {
        addToHistory(
          `Imbalance detected at node ${node.value} (balance: ${balance})`
        );
        node.left = leftRotate(node.left);
        return rightRotate(node);
      }

      if (balance < -1 && val < node.right.value) {
        addToHistory(
          `Imbalance detected at node ${node.value} (balance: ${balance})`
        );
        node.right = rightRotate(node.right);
        return leftRotate(node);
      }

      return node;
    };

    const newRoot = insert(root, value);
    setRoot(newRoot);
    setTreeLayout(calculateLayout(newRoot));
    setInputValue("");
    setMessage({ text: `Inserted ${value}`, type: "success" });
  };

  const insertMultipleNodes = () => {
    const values = inputValue
      .split(/[\s,]+/)
      .map((val) => parseInt(val.trim()))
      .filter((val) => !isNaN(val));

    if (values.length === 0) {
      setMessage({
        text: "Please enter valid numbers separated by commas or spaces",
        type: "error",
      });
      return;
    }

    let newRoot = root;

    for (const value of values) {
      const insert = (node, val) => {
        if (!node) {
          return new AVLNode(val);
        }

        if (val < node.value) {
          node.left = insert(node.left, val);
        } else if (val > node.value) {
          node.right = insert(node.right, val);
        } else {
          return node;
        }

        updateHeight(node);

        const balance = getBalance(node);

        if (balance > 1 && val < node.left.value) {
          return rightRotate(node);
        }

        if (balance < -1 && val > node.right.value) {
          return leftRotate(node);
        }

        if (balance > 1 && val > node.left.value) {
          node.left = leftRotate(node.left);
          return rightRotate(node);
        }

        if (balance < -1 && val < node.right.value) {
          node.right = rightRotate(node.right);
          return leftRotate(node);
        }

        return node;
      };

      newRoot = insert(newRoot, value);
    }

    setRoot(newRoot);
    setTreeLayout(calculateLayout(newRoot));
    setInputValue("");
    setMessage({
      text: `Inserted ${values.length} values: ${values.join(", ")}`,
      type: "success",
    });
    addToHistory(`Bulk insertion: ${values.join(", ")}`);
  };

  const deleteNode = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage({ text: "Please enter a valid number", type: "error" });
      return;
    }

    const findMin = (node) => {
      let current = node;
      while (current.left) {
        current = current.left;
      }
      return current;
    };

    const remove = (node, val) => {
      if (!node) {
        setMessage({
          text: `Value ${val} not found in the tree`,
          type: "warning",
        });
        return null;
      }

      if (val < node.value) {
        node.left = remove(node.left, val);
      } else if (val > node.value) {
        node.right = remove(node.right, val);
      } else {
        if (!node.left || !node.right) {
          addToHistory(`Deleting node ${val}`);
          const temp = node.left || node.right;
          if (!temp) {
            return null;
          }
          return temp;
        }

        const temp = findMin(node.right);
        addToHistory(
          `Replacing node ${node.value} with successor ${temp.value}`
        );
        node.value = temp.value;
        node.right = remove(node.right, temp.value);
      }

      updateHeight(node);

      const balance = getBalance(node);

      if (balance > 1 && getBalance(node.left) >= 0) {
        addToHistory(
          `Imbalance detected at node ${node.value} (balance: ${balance})`
        );
        return rightRotate(node);
      }

      if (balance > 1 && getBalance(node.left) < 0) {
        addToHistory(
          `Imbalance detected at node ${node.value} (balance: ${balance})`
        );
        node.left = leftRotate(node.left);
        return rightRotate(node);
      }

      if (balance < -1 && getBalance(node.right) <= 0) {
        addToHistory(
          `Imbalance detected at node ${node.value} (balance: ${balance})`
        );
        return leftRotate(node);
      }

      if (balance < -1 && getBalance(node.right) > 0) {
        addToHistory(
          `Imbalance detected at node ${node.value} (balance: ${balance})`
        );
        node.right = rightRotate(node.right);
        return leftRotate(node);
      }

      return node;
    };

    const newRoot = remove(root, value);
    setRoot(newRoot);
    setTreeLayout(calculateLayout(newRoot));
    setInputValue("");
  };

  const traverse = async (type) => {
    setHighlightedNodes([]);
    const path = [];

    const inOrder = (node) => {
      if (!node) return;
      inOrder(node.left);
      path.push(node.value);
      inOrder(node.right);
    };

    const preOrder = (node) => {
      if (!node) return;
      path.push(node.value);
      preOrder(node.left);
      preOrder(node.right);
    };

    const postOrder = (node) => {
      if (!node) return;
      postOrder(node.left);
      postOrder(node.right);
      path.push(node.value);
    };

    const levelOrder = (root) => {
      if (!root) return [];

      const result = [];
      const queue = [root];

      while (queue.length > 0) {
        const node = queue.shift();
        result.push(node.value);

        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
      }

      return result;
    };

    let traversalName = "";

    switch (type) {
      case "inorder":
        inOrder(root);
        traversalName = "In-order";
        break;
      case "preorder":
        preOrder(root);
        traversalName = "Pre-order";
        break;
      case "postorder":
        postOrder(root);
        traversalName = "Post-order";
        break;
      case "levelorder":
        path.push(...levelOrder(root));
        traversalName = "Level-order";
        break;
    }

    setMessage({
      text: `${traversalName} traversal: ${path.join(" → ")}`,
      type: "info",
    });
    addToHistory(`${traversalName} traversal executed`);

    for (let i = 0; i < path.length; i++) {
      setHighlightedNodes(path.slice(0, i + 1));
      await new Promise((resolve) => setTimeout(resolve, animationSpeed));
    }

    setTimeout(() => {
      setHighlightedNodes([]);
    }, animationSpeed);
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.5));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  const resetTree = () => {
    setRoot(null);
    setTreeLayout([]);
    setHighlightedNodes([]);
    setInputValue("");
    setMessage({ text: "Tree has been reset", type: "info" });
    addToHistory("Tree reset");
  };

  const searchTree = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage({
        text: "Please enter a valid number to search",
        type: "error",
      });
      return;
    }

    setHighlightedNodes([]);
    setSearchTarget(null);

    const search = async (node, val, path = []) => {
      if (!node) {
        setMessage({
          text: `Value ${val} not found in the tree`,
          type: "warning",
        });
        return false;
      }

      path.push(node.value);
      setHighlightedNodes([...path]);
      await new Promise((resolve) => setTimeout(resolve, animationSpeed));

      if (val === node.value) {
        setMessage({ text: `Found ${val} in the tree!`, type: "success" });
        setSearchTarget(val);
        addToHistory(`Searched and found value ${val}`);
        return true;
      }

      if (val < node.value) {
        return search(node.left, val, path);
      } else {
        return search(node.right, val, path);
      }
    };

    search(root, value, []).then((found) => {
      if (!found) {
        addToHistory(`Searched for value ${value} - not found`);
      }

      setTimeout(() => {
        setHighlightedNodes([]);
        setTimeout(() => {
          setSearchTarget(null);
        }, animationSpeed);
      }, animationSpeed * 2);
    });
  };

  const generateRandomTree = () => {
    setRoot(null);
    setTreeLayout([]);

    const numNodes = 7 + Math.floor(Math.random() * 8); // 7-15 nodes
    const values = new Set();

    while (values.size < numNodes) {
      values.add(Math.floor(Math.random() * 100) + 1);
    }

    let newRoot = null;

    values.forEach((value) => {
      const insert = (node, val) => {
        if (!node) return new AVLNode(val);

        if (val < node.value) {
          node.left = insert(node.left, val);
        } else if (val > node.value) {
          node.right = insert(node.right, val);
        } else {
          return node;
        }

        updateHeight(node);

        const balance = getBalance(node);

        if (balance > 1 && val < node.left.value) {
          return rightRotate(node);
        }

        if (balance < -1 && val > node.right.value) {
          return leftRotate(node);
        }

        if (balance > 1 && val > node.left.value) {
          node.left = leftRotate(node.left);
          return rightRotate(node);
        }

        if (balance < -1 && val < node.right.value) {
          node.right = rightRotate(node.right);
          return leftRotate(node);
        }

        return node;
      };

      newRoot = insert(newRoot, value);
    });

    setRoot(newRoot);
    setTreeLayout(calculateLayout(newRoot));
    setMessage({
      text: `Generated a random AVL tree with ${numNodes} nodes`,
      type: "success",
    });
    addToHistory(`Generated random tree with ${numNodes} nodes`);
  };

  const nodeClickHandler = (value) => {
    setInputValue(value.toString());
  };

  useEffect(() => {
    if (root) {
      setTreeLayout(calculateLayout(root));
    }
  }, [scale, root, calculateLayout]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">AVL Tree Visualizer</CardTitle>
              <CardDescription>
                Interactive visualization of self-balancing binary search trees
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
              >
                <Info className="h-4 w-4 mr-1" />
                Help
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showHelp && (
            <Alert className="mb-4">
              <AlertTitle className="flex items-center">
                <Info className="h-4 w-4 mr-2" />
                How to use this visualizer
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto p-0 h-6 w-6"
                  onClick={() => setShowHelp(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Insert numbers to build an AVL tree</li>
                  <li>Delete nodes to see auto-balancing in action</li>
                  <li>
                    Run traversals to see different tree exploration methods
                  </li>
                  <li>Search for values to visualize the search path</li>
                  <li>
                    Click on any node to copy its value to the input field
                  </li>
                  <li>The badge below each node shows its balance factor</li>
                  <li>
                    Use zoom controls to adjust the tree visualization size
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="operations">
                <Layers className="h-4 w-4 mr-2" />
                Operations
              </TabsTrigger>
              <TabsTrigger value="traversal">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Traversal & Utilities
              </TabsTrigger>
            </TabsList>

            <TabsContent value="operations" className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center flex-1 min-w-[200px]">
                  <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter number..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && insertNode()}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2"
                    onClick={() =>
                      setInsertionMode((prev) =>
                        prev === "single" ? "multiple" : "single"
                      )
                    }
                    title={
                      insertionMode === "single"
                        ? "Switch to multiple insertion mode"
                        : "Switch to single insertion mode"
                    }
                  >
                    {insertionMode === "single" ? (
                      <Plus className="h-4 w-4" />
                    ) : (
                      <MoreHorizontal className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={insertNode} variant="default">
                    <Plus className="mr-2 h-4 w-4" />
                    {insertionMode === "single" ? "Insert" : "Insert Multiple"}
                  </Button>
                  <Button onClick={deleteNode} variant="outline">
                    <Minus className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                  <Button onClick={searchTree} variant="outline">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </Button>
                </div>
              </div>

              {insertionMode === "multiple" && (
                <Alert variant="default" className="bg-blue-50 border-blue-200">
                  <AlertDescription>
                    Multiple insertion mode: Enter values separated by commas or
                    spaces (e.g., "10, 20, 30" or "5 15 25")
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="traversal" className="space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Button onClick={() => traverse("inorder")} variant="outline">
                  <Play className="mr-2 h-4 w-4" />
                  In-order
                </Button>
                <Button onClick={() => traverse("preorder")} variant="outline">
                  <Play className="mr-2 h-4 w-4" />
                  Pre-order
                </Button>
                <Button onClick={() => traverse("postorder")} variant="outline">
                  <Play className="mr-2 h-4 w-4" />
                  Post-order
                </Button>
                <Button
                  onClick={() => traverse("levelorder")}
                  variant="outline"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Level-order
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={generateRandomTree} variant="outline">
                  <RotateCw className="mr-2 h-4 w-4" />
                  Random Tree
                </Button>
                <Button
                  onClick={resetTree}
                  variant="outline"
                  className="text-red-500 hover:text-red-700"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <div className="ml-auto flex items-center gap-2">
                  <Button onClick={zoomOut} variant="outline" size="icon">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">{Math.round(scale * 100)}%</span>
                  <Button onClick={zoomIn} variant="outline" size="icon">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Animation Speed</label>
                  <span className="text-xs text-gray-500">
                    {animationSpeed}ms
                  </span>
                </div>
                <Slider
                  value={[animationSpeed]}
                  min={100}
                  max={2000}
                  step={100}
                  onValueChange={(values) => setAnimationSpeed(values[0])}
                />
              </div>
            </TabsContent>
          </Tabs>

          {message.text && (
            <Alert
              className={`w-full mb-4 ${
                message.type === "error"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : message.type === "warning"
                  ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                  : message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              {message.text}
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 border rounded-lg p-2 overflow-hidden">
              <div className="w-full overflow-auto h-[500px] bg-gray-50 rounded-lg relative">
                <div
                  className="absolute min-w-[800px] h-[500px] transition-transform duration-300"
                  style={{ transformOrigin: "center" }}
                >
                  <div className="absolute left-1/2 top-10">
                    {treeLayout.map((node, index) => (
                      <TreeNode
                        key={`${node.value}-${index}`}
                        value={node.value}
                        level={node.level}
                        position={node.position}
                        parentPosition={node.parentPosition}
                        isHighlighted={highlightedNodes.includes(node.value)}
                        isSearchTarget={searchTarget === node.value}
                        balance={node.balance}
                        scale={scale}
                        onClick={nodeClickHandler}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 h-[500px] overflow-auto">
              <h3 className="font-medium mb-2 text-sm text-gray-700 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Operation History
              </h3>
              {operationHistory.length > 0 ? (
                <div className="space-y-2">
                  {operationHistory.map((op, i) => (
                    <div
                      key={i}
                      className="text-sm p-2 bg-gray-50 rounded border-l-4 border-blue-500"
                    >
                      {op}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No operations performed yet
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TreeVisualizer;
