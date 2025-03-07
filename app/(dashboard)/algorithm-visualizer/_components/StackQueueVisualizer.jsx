import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Minus, Info, ArrowUp, ArrowDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Code snippets for each data structure
const codeSnippets = {
  stack: `// Stack implementation in C
#include <stdio.h>
#include <stdlib.h>

#define MAX_SIZE 100

struct Stack {
    int items[MAX_SIZE];
    int top;
};

void initialize(struct Stack *s) {
    s->top = -1;
}

// Time Complexity: O(1)
void push(struct Stack *s, int value) {
    if (s->top == MAX_SIZE - 1) {
        printf("Stack Overflow\\n");
        return;
    }
    s->items[++(s->top)] = value;
}

// Time Complexity: O(1)
int pop(struct Stack *s) {
    if (s->top == -1) {
        printf("Stack Underflow\\n");
        return -1;
    }
    return s->items[(s->top)--];
}`,

  queue: `// Queue implementation in C
#include <stdio.h>
#include <stdlib.h>

#define MAX_SIZE 100

struct Queue {
    int items[MAX_SIZE];
    int front, rear;
};

void initialize(struct Queue *q) {
    q->front = -1;
    q->rear = -1;
}

// Time Complexity: O(1)
void enqueue(struct Queue *q, int value) {
    if (q->rear == MAX_SIZE - 1) {
        printf("Queue Overflow\\n");
        return;
    }
    if (q->front == -1)
        q->front = 0;
    q->items[++(q->rear)] = value;
}

// Time Complexity: O(1)
int dequeue(struct Queue *q) {
    if (q->front == -1) {
        printf("Queue Underflow\\n");
        return -1;
    }
    int item = q->items[q->front];
    if (q->front == q->rear)
        q->front = q->rear = -1;
    else
        q->front++;
    return item;
}`,

  circularQueue: `// Circular Queue implementation in C
#include <stdio.h>
#include <stdlib.h>

#define MAX_SIZE 5

struct CircularQueue {
    int items[MAX_SIZE];
    int front, rear;
};

void initialize(struct CircularQueue *q) {
    q->front = -1;
    q->rear = -1;
}

// Time Complexity: O(1)
int isFull(struct CircularQueue *q) {
    return (q->front == 0 && q->rear == MAX_SIZE - 1) || 
           (q->front == q->rear + 1);
}

// Time Complexity: O(1)
int isEmpty(struct CircularQueue *q) {
    return q->front == -1;
}

// Time Complexity: O(1)
void enqueue(struct CircularQueue *q, int value) {
    if (isFull(q)) {
        printf("Queue Overflow\\n");
        return;
    }
    
    if (q->front == -1)
        q->front = 0;
    
    q->rear = (q->rear + 1) % MAX_SIZE;
    q->items[q->rear] = value;
}

// Time Complexity: O(1)
int dequeue(struct CircularQueue *q) {
    if (isEmpty(q)) {
        printf("Queue Underflow\\n");
        return -1;
    }
    
    int item = q->items[q->front];
    
    if (q->front == q->rear)
        q->front = q->rear = -1;
    else
        q->front = (q->front + 1) % MAX_SIZE;
        
    return item;
}`,

  priorityQueue: `// Priority Queue implementation in C
#include <stdio.h>
#include <stdlib.h>

// Node structure for priority queue
struct Node {
    int data;
    int priority;
    struct Node* next;
};

// Time Complexity: O(n) - Need to find correct position
void enqueue(struct Node** head, int data, int priority) {
    struct Node* newNode = (struct Node*)malloc(sizeof(struct Node));
    newNode->data = data;
    newNode->priority = priority;
    
    // If queue is empty or new node has higher priority
    if (*head == NULL || priority < (*head)->priority) {
        newNode->next = *head;
        *head = newNode;
    } else {
        struct Node* temp = *head;
        // Find position to insert new node
        while (temp->next != NULL && 
               temp->next->priority <= priority) {
            temp = temp->next;
        }
        newNode->next = temp->next;
        temp->next = newNode;
    }
}

// Time Complexity: O(1) - Always remove from front
int dequeue(struct Node** head) {
    if (*head == NULL) {
        printf("Queue Underflow\\n");
        return -1;
    }
    
    struct Node* temp = *head;
    int item = temp->data;
    *head = (*head)->next;
    free(temp);
    
    return item;
}`,
};

// Time complexity explanations
const timeComplexity = {
  stack: {
    operations: {
      push: "O(1)",
      pop: "O(1)",
      peek: "O(1)",
    },
    explanation:
      "Stack operations (push, pop, peek) all have O(1) time complexity because they only operate on the top element, requiring a constant number of steps regardless of stack size.",
  },
  queue: {
    operations: {
      enqueue: "O(1)",
      dequeue: "O(1)",
    },
    explanation:
      "Basic queue operations have O(1) time complexity because they operate directly on the front or rear pointers, taking constant time regardless of queue size.",
  },
  circularQueue: {
    operations: {
      enqueue: "O(1)",
      dequeue: "O(1)",
      isEmpty: "O(1)",
      isFull: "O(1)",
    },
    explanation:
      "Circular queue operations maintain O(1) time complexity while efficiently using fixed-size memory by wrapping around to the beginning when the end is reached.",
  },
  priorityQueue: {
    operations: {
      enqueue: "O(n)",
      dequeue: "O(1)",
    },
    explanation:
      "In this linked list implementation, enqueue is O(n) because we need to find the correct position based on priority. Dequeue remains O(1) since we always remove from the front.",
  },
};

// Component for rendering code with highlighting
const CodeViewer = ({ code }) => (
  <div className=" p-4 rounded-md overflow-auto text-sm max-h-64">
    <pre>{code}</pre>
  </div>
);

// Component for time complexity information
const TimeComplexityInfo = ({ data }) => (
  <Card className="mt-4">
    <CardHeader className="pb-2">
      <CardTitle className="text-md">Time Complexity</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 gap-2 mb-2">
        {Object.entries(data.operations).map(([op, complexity]) => (
          <div key={op} className="flex justify-between">
            <span className="font-medium">{op}:</span>
            <span className="text-blue-500">{complexity}</span>
          </div>
        ))}
      </div>
      <CardDescription className="text-xs mt-2">
        {data.explanation}
      </CardDescription>
    </CardContent>
  </Card>
);

// Stack visualizer component
const StackVisualizer = () => {
  const [items, setItems] = useState([1, 2, 3, 4]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [showCode, setShowCode] = useState(false);

  const handleOperation = (operation) => {
    switch (operation) {
      case "push":
        setItems([...items, Math.floor(Math.random() * 100)]);
        setActiveIndex(items.length);
        setTimeout(() => setActiveIndex(null), 1000);
        break;
      case "pop":
        if (items.length > 0) {
          setActiveIndex(items.length - 1);
          setTimeout(() => {
            setItems(items.slice(0, -1));
            setActiveIndex(null);
          }, 500);
        }
        break;
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-center gap-4">
        <Button onClick={() => handleOperation("push")}>
          <Plus className="mr-2" />
          Push
        </Button>

        <div className="flex flex-col-reverse gap-2 min-h-32 justify-center">
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

        <Button onClick={() => handleOperation("pop")}>
          <Minus className="mr-2" />
          Pop
        </Button>
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowCode(!showCode)}
          className="flex items-center"
        >
          <Info className="mr-2 h-4 w-4" />
          {showCode ? "Hide" : "Show"} Implementation
        </Button>
      </div>

      {showCode && (
        <div className="mt-4">
          <CodeViewer code={codeSnippets.stack} />
          <TimeComplexityInfo data={timeComplexity.stack} />
        </div>
      )}
    </div>
  );
};

// Queue visualizer component
const QueueVisualizer = () => {
  const [items, setItems] = useState([1, 2, 3, 4]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [showCode, setShowCode] = useState(false);

  const handleOperation = (operation) => {
    switch (operation) {
      case "enqueue":
        setItems([...items, Math.floor(Math.random() * 100)]);
        setActiveIndex(items.length);
        setTimeout(() => setActiveIndex(null), 1000);
        break;
      case "dequeue":
        if (items.length > 0) {
          setActiveIndex(0);
          setTimeout(() => {
            setItems(items.slice(1));
            setActiveIndex(null);
          }, 500);
        }
        break;
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-row gap-2 min-w-64 justify-center">
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

        <div className="flex justify-center gap-2">
          <Button onClick={() => handleOperation("enqueue")}>
            <Plus className="mr-2" />
            Enqueue
          </Button>
          <Button onClick={() => handleOperation("dequeue")}>
            <Minus className="mr-2" />
            Dequeue
          </Button>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowCode(!showCode)}
          className="flex items-center"
        >
          <Info className="mr-2 h-4 w-4" />
          {showCode ? "Hide" : "Show"} Implementation
        </Button>
      </div>

      {showCode && (
        <div className="mt-4">
          <CodeViewer code={codeSnippets.queue} />
          <TimeComplexityInfo data={timeComplexity.queue} />
        </div>
      )}
    </div>
  );
};

// Circular Queue visualizer component
const CircularQueueVisualizer = () => {
  const [items, setItems] = useState(Array(5).fill(null));
  const [front, setFront] = useState(-1);
  const [rear, setRear] = useState(-1);
  const [activeIndex, setActiveIndex] = useState(null);
  const [showCode, setShowCode] = useState(false);

  const isFull = () => {
    return (front === 0 && rear === items.length - 1) || front === rear + 1;
  };

  const isEmpty = () => {
    return front === -1;
  };

  const handleOperation = (operation) => {
    switch (operation) {
      case "enqueue":
        if (!isFull()) {
          const newValue = Math.floor(Math.random() * 100);
          const newItems = [...items];
          if (front === -1) setFront(0);
          const newRear = (rear + 1) % items.length;
          setRear(newRear);
          newItems[newRear] = newValue;
          setItems(newItems);
          setActiveIndex(newRear);
          setTimeout(() => setActiveIndex(null), 1000);
        }
        break;
      case "dequeue":
        if (!isEmpty()) {
          const newItems = [...items];
          setActiveIndex(front);
          setTimeout(() => {
            if (front === rear) {
              newItems[front] = null;
              setFront(-1);
              setRear(-1);
            } else {
              newItems[front] = null;
              setFront((front + 1) % items.length);
            }
            setItems(newItems);
            setActiveIndex(null);
          }, 500);
        }
        break;
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-row gap-2 justify-center relative">
          {items.map((item, index) => (
            <motion.div
              key={index}
              className={`w-12 h-12 rounded border-2 flex items-center justify-center ${
                index === activeIndex
                  ? "border-green-500 text-green-500"
                  : item !== null
                  ? "border-blue-400 "
                  : "border-gray-300 "
              }`}
            >
              {item !== null ? item : ""}
              {index === front && front !== -1 && (
                <div className="absolute -top-6 text-xs text-orange-500 font-bold">
                  Front
                </div>
              )}
              {index === rear && rear !== -1 && (
                <div className="absolute -bottom-6 text-xs text-purple-500 font-bold">
                  Rear
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          <Button
            onClick={() => handleOperation("enqueue")}
            disabled={isFull()}
          >
            <Plus className="mr-2" />
            Enqueue
          </Button>
          <Button
            onClick={() => handleOperation("dequeue")}
            disabled={isEmpty()}
          >
            <Minus className="mr-2" />
            Dequeue
          </Button>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowCode(!showCode)}
          className="flex items-center"
        >
          <Info className="mr-2 h-4 w-4" />
          {showCode ? "Hide" : "Show"} Implementation
        </Button>
      </div>

      {showCode && (
        <div className="mt-4">
          <CodeViewer code={codeSnippets.circularQueue} />
          <TimeComplexityInfo data={timeComplexity.circularQueue} />
        </div>
      )}
    </div>
  );
};

// Priority Queue visualizer component
const PriorityQueueVisualizer = () => {
  const [items, setItems] = useState([
    { value: 15, priority: 3 },
    { value: 23, priority: 2 },
    { value: 42, priority: 1 },
  ]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [showCode, setShowCode] = useState(false);

  const handleEnqueue = () => {
    const newValue = Math.floor(Math.random() * 100);
    const newPriority = Math.floor(Math.random() * 5) + 1;
    const newItem = { value: newValue, priority: newPriority };

    // Insert based on priority (lower number = higher priority)
    let inserted = false;
    const newItems = [...items];
    for (let i = 0; i < newItems.length; i++) {
      if (newPriority < newItems[i].priority) {
        newItems.splice(i, 0, newItem);
        setActiveIndex(i);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      newItems.push(newItem);
      setActiveIndex(newItems.length - 1);
    }

    setItems(newItems);
    setTimeout(() => setActiveIndex(null), 1000);
  };

  const handleDequeue = () => {
    if (items.length > 0) {
      setActiveIndex(0);
      setTimeout(() => {
        setItems(items.slice(1));
        setActiveIndex(null);
      }, 500);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-row gap-2 min-w-64 justify-center">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={index}
                className={`relative w-16 h-16 rounded border-2 flex flex-col items-center justify-center ${
                  index === activeIndex
                    ? "border-green-500 text-green-500"
                    : "border-gray-400"
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div>{item.value}</div>
                <div className="text-xs mt-1 bg-blue-500 px-1 rounded-sm">
                  P:{item.priority}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2">
          <Button onClick={handleEnqueue}>
            <Plus className="mr-2" />
            Enqueue
          </Button>
          <Button onClick={handleDequeue} disabled={items.length === 0}>
            <Minus className="mr-2" />
            Dequeue
          </Button>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowCode(!showCode)}
          className="flex items-center"
        >
          <Info className="mr-2 h-4 w-4" />
          {showCode ? "Hide" : "Show"} Implementation
        </Button>
      </div>

      {showCode && (
        <div className="mt-4">
          <CodeViewer code={codeSnippets.priorityQueue} />
          <TimeComplexityInfo data={timeComplexity.priorityQueue} />
        </div>
      )}
    </div>
  );
};

// Main visualizer component
const StackQueueVisualizer = () => {
  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Stack Queue Visualizer</CardTitle>
          <CardDescription>
            Visualize stack and queue with C implementations and time complexity
            analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stack" className="w-full">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="stack">Stack</TabsTrigger>
              <TabsTrigger value="queue">Queue</TabsTrigger>
              <TabsTrigger value="circularQueue">Circular Queue</TabsTrigger>
              <TabsTrigger value="priorityQueue">Priority Queue</TabsTrigger>
            </TabsList>
            <TabsContent value="stack">
              <StackVisualizer />
            </TabsContent>
            <TabsContent value="queue">
              <QueueVisualizer />
            </TabsContent>
            <TabsContent value="circularQueue">
              <CircularQueueVisualizer />
            </TabsContent>
            <TabsContent value="priorityQueue">
              <PriorityQueueVisualizer />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StackQueueVisualizer;
