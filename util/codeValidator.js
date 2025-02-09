export function parseTestCase(testCase) {
  try {
    const input = JSON.parse(testCase.input);
    const expectedOutput = JSON.parse(testCase.output);
    return { input, expectedOutput };
  } catch (error) {
    throw new Error(`Invalid test case format: ${error.message}`);
  }
}

export function validateOutput(actualOutput, expectedOutput) {
  // Convert string outputs to JSON if needed
  let parsedActual = actualOutput;
  let parsedExpected = expectedOutput;

  try {
    if (typeof actualOutput === "string") {
      parsedActual = JSON.parse(actualOutput.trim());
    }
    if (typeof expectedOutput === "string") {
      parsedExpected = JSON.parse(expectedOutput.trim());
    }
  } catch (error) {
    return false;
  }

  // Compare arrays
  if (Array.isArray(parsedActual) && Array.isArray(parsedExpected)) {
    return (
      parsedActual.length === parsedExpected.length &&
      parsedActual.every((val, idx) => val === parsedExpected[idx])
    );
  }

  // Compare other types
  return parsedActual === parsedExpected;
}
