"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BlocklyWorkspace from "./_components/BlocklyWorkspace";

export default function Home() {
  const [code, setCode] = useState("// Your JavaScript code will appear here");
  const [error, setError] = useState(null);
  const blocklyRef = useRef(null);
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("block"); // "block" or "javascript"

  const updateCode = () => {
    if (!blocklyRef.current?.workspace || !blocklyRef.current?.Blockly) {
      return;
    }

    try {
      const workspace = blocklyRef.current.workspace;
      const Blockly = blocklyRef.current.Blockly;

      if (!Blockly.JavaScript) {
        console.error("JavaScript generator is undefined");
        setError("JavaScript generator not loaded properly");
        return;
      }

      Blockly.JavaScript.INFINITE_LOOP_TRAP = null;

      const workspaceState = Blockly.serialization.workspaces.save(workspace);

      const topBlocks = workspace.getTopBlocks();

      if (topBlocks.length === 0) {
        setCode("// No blocks in workspace. Add some blocks to generate code!");
        return;
      }

      const generatedCode = Blockly.JavaScript.workspaceToCode(workspace);

      setCode(generatedCode || "// No code generated. Try adding more blocks!");
      setError(null);

      // Save workspace state
      localStorage.setItem("blocklyWorkspace", JSON.stringify(workspaceState));
    } catch (error) {
      console.error("Error generating code:", error);
      setCode(`// Error generating JavaScript code: ${error.message}`);
      setError(error.message);
    }
  };

  // Handle workspace initialization
  const handleWorkspaceInitialized = () => {
    setWorkspaceLoaded(true);

    // Set a small delay to ensure the workspace is fully loaded
    setTimeout(() => {
      updateCode();
    }, 500);
  };

  // Effect for workspace changes
  useEffect(() => {
    if (workspaceLoaded) {
      updateCode();
    }
  }, [workspaceLoaded]);

  return (
    <main className="flex flex-col h-screen">
      <div className="container mx-auto p-4 flex flex-col h-full">
        <header className="mb-4">
          <h1 className="text-2xl font-bold">Block Code</h1>
          <p className="">Build blocks, generate JavaScript</p>
        </header>

        {error && (
          <div className="border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>
              <strong>Error:</strong> {error}
            </p>
            <p className="text-sm">Check console for more details.</p>
          </div>
        )}

        <Card className="flex flex-col flex-1 min-h-0">
          <CardHeader className="pb-0 border-b">
            <div className="flex border-b">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "block"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("block")}
              >
                Visual Block Editor
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "javascript"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("javascript")}
              >
                JavaScript Output
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0 relative">
            {/* Block Editor Tab */}
            <div
              className={`h-full w-full ${
                activeTab === "block" ? "block" : "hidden"
              }`}
            >
              <BlocklyWorkspace
                ref={blocklyRef}
                onWorkspaceChange={updateCode}
                onInitialized={handleWorkspaceInitialized}
              />
            </div>

            {/* JavaScript Output Tab */}
            <div
              className={`h-full w-full ${
                activeTab === "javascript" ? "block" : "hidden"
              }`}
            >
              <pre
                className="h-full w-full overflow-auto p-4 m-0 rounded-b-lg font-mono text-sm"
                style={{ minHeight: "300px" }}
              >
                {code}
              </pre>
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                  onClick={() => {
                    updateCode();
                  }}
                >
                  Refresh Code
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
