import React, { useState, useContext, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameContext } from "./CodingQuestApp";

export const CodeEditor = ({ challenge }) => {
  const { updatePlayerProgress } = useContext(GameContext);
  const [code, setCode] = useState(challenge.initialCode || "");
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState([]);
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const runCode = () => {
    try {
      // Basic code execution and testing
      const results = challenge.testCases.map((testCase) => {
        try {
          const userFunction = new Function("return " + code)();
          const result = userFunction(...testCase.inputs);
          const passed = result === testCase.expectedOutput;
          return {
            inputs: testCase.inputs,
            result,
            passed,
            expectedOutput: testCase.expectedOutput,
          };
        } catch (err) {
          return {
            inputs: testCase.inputs,
            error: err.message,
            passed: false,
          };
        }
      });

      setTestResults(results);

      // Check if all tests passed
      const allPassed = results.every((result) => result.passed);
      if (allPassed) {
        updatePlayerProgress(challenge.xpReward, [challenge.skillUnlocked]);
        setOutput("All tests passed! 🎉 XP Earned: " + challenge.xpReward);
      } else {
        setOutput("Some tests failed. Keep trying!");
      }
    } catch (error) {
      setOutput("Error: " + error.message);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-[#112240]">
        <CardHeader>
          <CardTitle>{challenge.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{challenge.description}</p>
          <MonacoEditor
            height="400px"
            language="javascript"
            theme="vs-dark"
            value={code}
            onChange={setCode}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineHeight: 24,
              automaticLayout: true,
            }}
          />
          <div className="mt-4 flex space-x-2">
            <Button
              onClick={runCode}
              className="bg-green-600 hover:bg-green-700"
            >
              Run Code
            </Button>
            <Button
              variant="secondary"
              onClick={() => setCode(challenge.initialCode)}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#112240]">
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-black/50 p-4 rounded">{output}</pre>
          {testResults.map((test, index) => (
            <div
              key={index}
              className={`p-2 mt-2 rounded ${
                test.passed ? "bg-green-900" : "bg-red-900"
              }`}
            >
              Test {index + 1}:{test.passed ? " Passed ✅" : " Failed ❌"}
              <p>Inputs: {JSON.stringify(test.inputs)}</p>
              <p>Expected: {JSON.stringify(test.expectedOutput)}</p>
              <p>Result: {JSON.stringify(test.result)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
