import * as acorn from "acorn";
import { ancestor } from "acorn-walk";

/**
 * Analyze code for time complexity
 * @param {string} code - JavaScript code to analyze
 * @returns {Object} Complexity analysis result
 */
export function analyzeComplexity(code) {
  try {
    // Parse code to AST
    const ast = acorn.parse(code, {
      ecmaVersion: 2020,
      sourceType: "module",
    });

    // Track loops, recursion, and function calls
    const stats = {
      loops: {
        count: 0,
        nested: 0,
        maxDepth: 0,
      },
      recursion: false,
      functionCalls: new Set(),
      functionNames: new Set(),
    };

    // Current nest level for tracking loop depth
    let currentLoopDepth = 0;

    // Walk the AST to analyze patterns
    ancestor(ast, {
      // Track function declarations to detect recursion
      FunctionDeclaration(node, ancestors) {
        if (node.id && node.id.name) {
          stats.functionNames.add(node.id.name);
        }
      },

      // Track function expressions
      FunctionExpression(node, ancestors) {
        if (node.id && node.id.name) {
          stats.functionNames.add(node.id.name);
        }
      },

      // Track arrow functions
      ArrowFunctionExpression() {
        // Just count them, no names to track
      },

      // Track loops
      ForStatement(node, ancestors) {
        stats.loops.count++;
        currentLoopDepth++;

        // Check for nested loops
        if (currentLoopDepth > 1) {
          stats.loops.nested++;
        }

        stats.loops.maxDepth = Math.max(stats.loops.maxDepth, currentLoopDepth);

        // Process the loop body, then decrement depth
        ancestor(node.body, {
          ForStatement() {
            /* Already counting in outer walk */
          },
          WhileStatement() {
            /* Already counting in outer walk */
          },
          DoWhileStatement() {
            /* Already counting in outer walk */
          },
          ForInStatement() {
            /* Already counting in outer walk */
          },
          ForOfStatement() {
            /* Already counting in outer walk */
          },
        });

        currentLoopDepth--;
      },

      // Track while loops
      WhileStatement(node, ancestors) {
        stats.loops.count++;
        currentLoopDepth++;

        if (currentLoopDepth > 1) {
          stats.loops.nested++;
        }

        stats.loops.maxDepth = Math.max(stats.loops.maxDepth, currentLoopDepth);

        // Process body then decrement
        ancestor(node.body, {
          ForStatement() {
            /* Already counting in outer walk */
          },
          WhileStatement() {
            /* Already counting in outer walk */
          },
          DoWhileStatement() {
            /* Already counting in outer walk */
          },
          ForInStatement() {
            /* Already counting in outer walk */
          },
          ForOfStatement() {
            /* Already counting in outer walk */
          },
        });

        currentLoopDepth--;
      },

      // Track do-while loops
      DoWhileStatement(node, ancestors) {
        stats.loops.count++;
        currentLoopDepth++;

        if (currentLoopDepth > 1) {
          stats.loops.nested++;
        }

        stats.loops.maxDepth = Math.max(stats.loops.maxDepth, currentLoopDepth);

        // Process body then decrement
        ancestor(node.body, {
          ForStatement() {
            /* Already counting in outer walk */
          },
          WhileStatement() {
            /* Already counting in outer walk */
          },
          DoWhileStatement() {
            /* Already counting in outer walk */
          },
          ForInStatement() {
            /* Already counting in outer walk */
          },
          ForOfStatement() {
            /* Already counting in outer walk */
          },
        });

        currentLoopDepth--;
      },

      // Track for-in loops
      ForInStatement(node, ancestors) {
        stats.loops.count++;
        currentLoopDepth++;

        if (currentLoopDepth > 1) {
          stats.loops.nested++;
        }

        stats.loops.maxDepth = Math.max(stats.loops.maxDepth, currentLoopDepth);

        // Process body then decrement
        ancestor(node.body, {
          ForStatement() {
            /* Already counting in outer walk */
          },
          WhileStatement() {
            /* Already counting in outer walk */
          },
          DoWhileStatement() {
            /* Already counting in outer walk */
          },
          ForInStatement() {
            /* Already counting in outer walk */
          },
          ForOfStatement() {
            /* Already counting in outer walk */
          },
        });

        currentLoopDepth--;
      },

      // Track for-of loops
      ForOfStatement(node, ancestors) {
        stats.loops.count++;
        currentLoopDepth++;

        if (currentLoopDepth > 1) {
          stats.loops.nested++;
        }

        stats.loops.maxDepth = Math.max(stats.loops.maxDepth, currentLoopDepth);

        // Process body then decrement
        ancestor(node.body, {
          ForStatement() {
            /* Already counting in outer walk */
          },
          WhileStatement() {
            /* Already counting in outer walk */
          },
          DoWhileStatement() {
            /* Already counting in outer walk */
          },
          ForInStatement() {
            /* Already counting in outer walk */
          },
          ForOfStatement() {
            /* Already counting in outer walk */
          },
        });

        currentLoopDepth--;
      },

      // Track function calls to detect recursion and patterns
      CallExpression(node, ancestors) {
        if (node.callee.type === "Identifier") {
          const functionName = node.callee.name;
          stats.functionCalls.add(functionName);

          // Check for recursive calls
          for (let i = ancestors.length - 1; i >= 0; i--) {
            const ancestor = ancestors[i];
            if (
              (ancestor.type === "FunctionDeclaration" ||
                ancestor.type === "FunctionExpression") &&
              ancestor.id &&
              ancestor.id.name === functionName
            ) {
              stats.recursion = true;
              break;
            }
          }
        }
      },

      // Detect binary divide operations (for divide-and-conquer)
      BinaryExpression(node) {
        // Check for division by 2, which might indicate divide and conquer
      },
    });

    // Determine complexity based on gathered statistics
    return determineComplexity(stats, code);
  } catch (error) {
    console.error("Error during AST analysis:", error);
    return {
      error: "Failed to analyze code: " + error.message,
      notation: null,
      explanation: null,
    };
  }
}

/**
 * Determine time complexity based on code statistics
 * @param {Object} stats - Code statistics
 * @param {string} code - Original code
 * @returns {Object} Complexity result
 */
function determineComplexity(stats, code) {
  // Look for specific patterns to determine complexity

  // Check for constant time O(1)
  if (stats.loops.count === 0 && !stats.recursion) {
    return {
      notation: "O(1)",
      category: "constant",
      explanation:
        "Constant time complexity. The code executes in the same amount of time regardless of input size.",
      details: "No loops or recursion were detected in the code.",
      color: "#4ade80", // Green
    };
  }

  // Check for logarithmic time O(log n)
  const hasLogarithmicPattern =
    (code.includes("Math.floor") && code.includes("/= 2")) ||
    code.includes("/ 2") ||
    code.includes(">> 1");

  if (
    (stats.loops.count === 1 && hasLogarithmicPattern) ||
    code.toLowerCase().includes("binary search")
  ) {
    return {
      notation: "O(log n)",
      category: "logarithmic",
      explanation:
        "Logarithmic time complexity. The execution time grows logarithmically with the input size.",
      details:
        "The algorithm appears to divide the problem space in half with each step, typical of binary search or similar divide-and-conquer algorithms.",
      color: "#a3e635", // Light green
    };
  }

  // Check for linear time O(n)
  if (stats.loops.count === 1 && stats.loops.nested === 0 && !stats.recursion) {
    return {
      notation: "O(n)",
      category: "linear",
      explanation:
        "Linear time complexity. The execution time grows linearly with the input size.",
      details:
        "The code contains a single non-nested loop that likely iterates through each element once.",
      color: "#facc15", // Yellow
    };
  }

  // Check for linearithmic time O(n log n)
  const hasMergeSort =
    code.toLowerCase().includes("mergesort") ||
    (stats.recursion && code.includes("slice") && code.includes("concat"));

  const hasQuickSort =
    code.toLowerCase().includes("quicksort") ||
    (stats.recursion && code.includes("pivot"));

  if (
    hasMergeSort ||
    hasQuickSort ||
    (stats.recursion && stats.loops.count === 1)
  ) {
    return {
      notation: "O(n log n)",
      category: "linearithmic",
      explanation:
        "Linearithmic time complexity. Common in efficient sorting algorithms like merge sort or quick sort.",
      details:
        "The code shows patterns of divide-and-conquer with recursion combined with iteration.",
      color: "#fb923c", // Orange
    };
  }

  // Check for quadratic time O(n²)
  if (
    stats.loops.maxDepth === 2 ||
    (stats.loops.count >= 2 && stats.loops.nested > 0)
  ) {
    return {
      notation: "O(n²)",
      category: "quadratic",
      explanation:
        "Quadratic time complexity. The execution time grows with the square of the input size.",
      details:
        "The code contains nested loops, typically processing each element in relation to other elements.",
      color: "#f87171", // Red
    };
  }

  // Check for cubic time O(n³)
  if (stats.loops.maxDepth === 3) {
    return {
      notation: "O(n³)",
      category: "cubic",
      explanation:
        "Cubic time complexity. The execution time grows with the cube of the input size.",
      details: "The code contains three levels of nested loops.",
      color: "#ef4444", // Darker red
    };
  }

  // Check for exponential time O(2ⁿ)
  if (
    stats.recursion &&
    (code.toLowerCase().includes("fibonacci") ||
      code.match(/return.*\(.*n-1.*\).*\(.*n-2.*\)/s) !== null)
  ) {
    return {
      notation: "O(2ⁿ)",
      category: "exponential",
      explanation:
        "Exponential time complexity. The execution time doubles with each additional element.",
      details:
        "The code uses recursion with multiple branches, typical of naive Fibonacci calculation or similar algorithms.",
      color: "#dc2626", // Very dark red
    };
  }

  // Check for factorial time O(n!)
  if (stats.recursion && code.toLowerCase().includes("permutation")) {
    return {
      notation: "O(n!)",
      category: "factorial",
      explanation:
        "Factorial time complexity. The execution time grows factorially with the input size.",
      details:
        "The code appears to generate all permutations, a pattern seen in brute force solutions to problems like the traveling salesman.",
      color: "#b91c1c", // Extremely dark red
    };
  }

  // Default to unknown if no pattern is clearly matched
  return {
    notation: "Undetermined",
    category: "unknown",
    explanation: "Could not determine a clear time complexity pattern.",
    details:
      "The code structure is either too complex or doesn't match common algorithmic patterns.",
    color: "#6b7280", // Gray
  };
}
