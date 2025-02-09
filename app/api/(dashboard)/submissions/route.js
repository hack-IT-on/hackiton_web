import { connection } from "@/util/db";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";
import axios from "axios";
import qs from "qs";

const EXECUTION_TIMEOUT_MS = 15000;

class ValidationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

async function executeCode(code, input) {
  try {
    const response = await axios({
      method: "post",
      url: "https://api.codex.jaagrav.in",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify({
        code,
        language: "py",
      }),
      timeout: EXECUTION_TIMEOUT_MS,
    });

    if (response.data.error) {
      return { error: response.data.error };
    }

    return {
      output: response.data.output,
      error: null,
    };
  } catch (error) {
    return {
      error: error.message || "Execution failed",
    };
  }
}

async function validateCode(code, problem) {
  try {
    // Parse test cases
    const testCases = JSON.parse(problem.test_cases);

    // Check if the code contains the required function name
    if (!code.includes(`def ${problem.function_name}`)) {
      throw new ValidationError(
        `Code must contain function named '${problem.function_name}'`
      );
    }

    // Process each test case
    for (const testCase of testCases) {
      // Prepare the complete code with test case input
      const fullCode = `
${code}

import json
input_data = json.loads('${JSON.stringify(testCase.input)}')
result = ${problem.function_name}(**input_data)
print(json.dumps(result))
`;

      // Execute the code
      const executionResult = await executeCode(fullCode);

      if (executionResult.error) {
        return {
          status: "Runtime Error",
          error: executionResult.error,
        };
      }

      // Parse and compare output
      try {
        const actualOutput = JSON.parse(executionResult.output.trim());
        const expectedOutput = testCase.output;

        // Deep equality comparison
        if (JSON.stringify(actualOutput) !== JSON.stringify(expectedOutput)) {
          return {
            status: "Wrong Answer",
            error: "Wrong answer",
            testCase,
            actualOutput,
          };
        }
      } catch (error) {
        return {
          status: "Output Format Error",
          error: "Invalid output format",
          testCase,
          actualOutput: executionResult.output,
        };
      }
    }

    // All test cases passed
    return {
      status: "Accepted",
      error: null,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new Error("Validation failed: " + error.message);
  }
}

export async function POST(request) {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      throw new ValidationError("Unauthorized", 401);
    }

    // Parse request body
    const body = await request.json();
    const { code, problemId } = body;

    if (!code || !problemId) {
      throw new ValidationError("Missing required fields");
    }

    // Fetch problem details
    const [problems] = await connection.execute(
      "SELECT * FROM problems WHERE id = ?",
      [problemId]
    );

    const problem = problems[0];
    if (!problem) {
      throw new ValidationError("Problem not found");
    }

    // Validate code against test cases
    const validationResult = await validateCode(code, problem);

    // If code passed all test cases, save to database
    if (validationResult.status === "Accepted") {
      await connection.execute(
        `INSERT INTO submissions (user_id, problem_id, language, code, status) 
         VALUES (?, ?, ?, ?, ?)`,
        [user.id, problemId, "py", code, "Accepted"]
      );

      return NextResponse.json({
        status: "Accepted",
        message: "All test cases passed!",
      });
    }

    // Return error for failed test cases
    return NextResponse.json({
      status: validationResult.status,
      error: validationResult.error,
      testCase: validationResult.testCase,
      actualOutput: validationResult.actualOutput,
    });
  } catch (error) {
    console.error("Submission error:", error);

    const status = error instanceof ValidationError ? error.status : 500;
    const message =
      error instanceof ValidationError
        ? error.message
        : "An unexpected error occurred";

    return NextResponse.json({ error: message }, { status });
  }
}
