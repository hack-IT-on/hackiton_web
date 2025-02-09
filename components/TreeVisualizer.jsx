import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Plus, Minus, Play, ZoomIn, ZoomOut } from "lucide-react";

const TreeNode = ({
  value,
  isHighlighted,
  level,
  position,
  parentPosition,
  scale,
}) => {
  const nodeSpacing = 40 * scale;
  const levelHeight = 30 * scale;
  const x = position * nodeSpacing;
  const y = level * levelHeight;

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
            stroke="gray"
            strokeWidth="2"
          />
        </svg>
      )}
      <div
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform ${
          isHighlighted ? "border-green-500 text-green-500" : "border-gray-400"
        }`}
        style={{ transform: `scale(${scale})` }}
      >
        {value}
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
  const [message, setMessage] = useState("");
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [treeLayout, setTreeLayout] = useState([]);
  const [scale, setScale] = useState(1);

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

    return x;
  };

  const leftRotate = (x) => {
    const y = x.right;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    updateHeight(x);
    updateHeight(y);

    return y;
  };

  const calculateLayout = (node, level = 0, position = 0, parentPos = null) => {
    if (!node) return [];

    const layout = [];
    layout.push({
      value: node.value,
      level,
      position,
      parentPosition: parentPos,
    });

    const spacing = Math.pow(2, 2 - level);
    const leftSubtree = calculateLayout(
      node.left,
      level + 1,
      position - spacing,
      { x: position * 40 * scale, y: level * 30 * scale }
    );
    const rightSubtree = calculateLayout(
      node.right,
      level + 1,
      position + spacing,
      { x: position * 40 * scale, y: level * 30 * scale }
    );

    return [...layout, ...leftSubtree, ...rightSubtree];
  };

  const insertNode = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage("Please enter a valid number");
      return;
    }

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

    const newRoot = insert(root, value);
    setRoot(newRoot);
    setTreeLayout(calculateLayout(newRoot));
    setInputValue("");
    setMessage(`Inserted ${value}`);
  };

  const deleteNode = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setMessage("Please enter a valid number");
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
      if (!node) return null;

      if (val < node.value) {
        node.left = remove(node.left, val);
      } else if (val > node.value) {
        node.right = remove(node.right, val);
      } else {
        if (!node.left || !node.right) {
          const temp = node.left || node.right;
          if (!temp) {
            return null;
          }
          return temp;
        }

        const temp = findMin(node.right);
        node.value = temp.value;
        node.right = remove(node.right, temp.value);
      }

      updateHeight(node);

      const balance = getBalance(node);

      if (balance > 1 && getBalance(node.left) >= 0) {
        return rightRotate(node);
      }

      if (balance > 1 && getBalance(node.left) < 0) {
        node.left = leftRotate(node.left);
        return rightRotate(node);
      }

      if (balance < -1 && getBalance(node.right) <= 0) {
        return leftRotate(node);
      }

      if (balance < -1 && getBalance(node.right) > 0) {
        node.right = rightRotate(node.right);
        return leftRotate(node);
      }

      return node;
    };

    const newRoot = remove(root, value);
    setRoot(newRoot);
    setTreeLayout(calculateLayout(newRoot));
    setInputValue("");
    setMessage(`Deleted ${value}`);
  };

  const traverse = async (type) => {
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

    switch (type) {
      case "inorder":
        inOrder(root);
        setMessage("In-order traversal: " + path.join(" → "));
        break;
      case "preorder":
        preOrder(root);
        setMessage("Pre-order traversal: " + path.join(" → "));
        break;
      case "postorder":
        postOrder(root);
        setMessage("Post-order traversal: " + path.join(" → "));
        break;
    }

    for (let i = 0; i < path.length; i++) {
      setHighlightedNodes(path.slice(0, i + 1));
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    setTimeout(() => {
      setHighlightedNodes([]);
    }, 1000);
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  useEffect(() => {
    if (root) {
      setTreeLayout(calculateLayout(root));
    }
  }, [scale, root]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter number..."
          className="w-32"
        />
        <Button onClick={insertNode} variant="outline">
          <Plus className="mr-2" />
          Insert
        </Button>
        <Button onClick={deleteNode} variant="outline">
          <Minus className="mr-2" />
          Delete
        </Button>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => traverse("inorder")} variant="outline">
          <Play className="mr-2" />
          In-order
        </Button>
        <Button onClick={() => traverse("preorder")} variant="outline">
          <Play className="mr-2" />
          Pre-order
        </Button>
        <Button onClick={() => traverse("postorder")} variant="outline">
          <Play className="mr-2" />
          Post-order
        </Button>
      </div>

      <div className="flex gap-2">
        <Button onClick={zoomIn} variant="outline">
          <ZoomIn className="mr-2" />
          Zoom In
        </Button>
        <Button onClick={zoomOut} variant="outline">
          <ZoomOut className="mr-2" />
          Zoom Out
        </Button>
      </div>

      {message && <Alert className="w-full max-w-md">{message}</Alert>}

      <div className="w-full overflow-auto h-[400px] border rounded-lg p-4">
        <div
          className="relative w-[800px] h-[400px] mx-auto"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center",
            transition: "transform 0.2s",
          }}
        >
          <div className="absolute left-1/2 top-8">
            {treeLayout.map((node, index) => (
              <TreeNode
                key={index}
                value={node.value}
                level={node.level}
                position={node.position}
                parentPosition={node.parentPosition}
                isHighlighted={highlightedNodes.includes(node.value)}
                scale={1} // Remove scale from individual nodes
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreeVisualizer;
