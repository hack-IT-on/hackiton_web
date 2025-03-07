// components/BlocklyWorkspace.jsx
"use client";

import { useEffect, forwardRef, useImperativeHandle, useState } from "react";

const BlocklyWorkspace = forwardRef(
  ({ onWorkspaceChange, onInitialized }, ref) => {
    const [isInitialized, setIsInitialized] = useState(false);
    let workspace = null;
    let Blockly = null;

    useImperativeHandle(ref, () => ({
      get workspace() {
        return workspace;
      },
      get Blockly() {
        return Blockly;
      },
      generateCode() {
        if (!workspace || !Blockly?.JavaScript) return "";
        return Blockly.JavaScript.workspaceToCode(workspace);
      },
    }));

    useEffect(() => {
      let mounted = true;

      const initBlockly = async () => {
        try {
          console.log("Initializing Blockly...");

          // Dynamically import Blockly
          const blocklyModule = await import("blockly");
          console.log("Blockly module loaded:", blocklyModule);

          // Import JavaScript generator first and specifically
          const jsGenModule = await import("blockly/javascript");
          console.log("JavaScript generator loaded:", jsGenModule);

          // Then import other generators
          const [pythonGen, phpGen, luaGen, dartGen] = await Promise.all([
            import("blockly/python"),
            import("blockly/php"),
            import("blockly/lua"),
            import("blockly/dart"),
          ]);

          if (!mounted) return;

          // Create the Blockly object with all needed components
          Blockly = {
            ...blocklyModule,
            JavaScript: jsGenModule.javascriptGenerator,
            Python: pythonGen.pythonGenerator,
            PHP: phpGen.phpGenerator,
            Lua: luaGen.luaGenerator,
            Dart: dartGen.dartGenerator,
          };

          console.log("Assembled Blockly object:", Blockly);
          console.log("JavaScript generator available:", !!Blockly.JavaScript);

          // Make sure the container exists
          const blocklyDiv = document.getElementById("blocklyDiv");
          if (!blocklyDiv) {
            throw new Error("Blockly container element not found");
          }

          // Define the toolbox categories and blocks
          const toolbox = {
            kind: "categoryToolbox",
            contents: [
              {
                kind: "category",
                name: "Logic",
                colour: "%{BKY_LOGIC_HUE}",
                contents: [
                  { kind: "block", type: "controls_if" },
                  { kind: "block", type: "logic_compare" },
                  { kind: "block", type: "logic_operation" },
                  { kind: "block", type: "logic_negate" },
                  { kind: "block", type: "logic_boolean" },
                  { kind: "block", type: "logic_null" },
                  { kind: "block", type: "logic_ternary" },
                ],
              },
              {
                kind: "category",
                name: "Loops",
                colour: "%{BKY_LOOPS_HUE}",
                contents: [
                  { kind: "block", type: "controls_repeat_ext" },
                  { kind: "block", type: "controls_whileUntil" },
                  { kind: "block", type: "controls_for" },
                  { kind: "block", type: "controls_forEach" },
                  { kind: "block", type: "controls_flow_statements" },
                ],
              },
              {
                kind: "category",
                name: "Math",
                colour: "%{BKY_MATH_HUE}",
                contents: [
                  { kind: "block", type: "math_number" },
                  { kind: "block", type: "math_arithmetic" },
                  { kind: "block", type: "math_single" },
                  { kind: "block", type: "math_trig" },
                  { kind: "block", type: "math_constant" },
                  { kind: "block", type: "math_number_property" },
                  { kind: "block", type: "math_round" },
                  { kind: "block", type: "math_on_list" },
                  { kind: "block", type: "math_modulo" },
                  { kind: "block", type: "math_constrain" },
                  { kind: "block", type: "math_random_int" },
                  { kind: "block", type: "math_random_float" },
                ],
              },
              {
                kind: "category",
                name: "Text",
                colour: "%{BKY_TEXTS_HUE}",
                contents: [
                  { kind: "block", type: "text" },
                  { kind: "block", type: "text_join" },
                  { kind: "block", type: "text_append" },
                  { kind: "block", type: "text_length" },
                  { kind: "block", type: "text_isEmpty" },
                  { kind: "block", type: "text_indexOf" },
                  { kind: "block", type: "text_charAt" },
                  { kind: "block", type: "text_getSubstring" },
                  { kind: "block", type: "text_changeCase" },
                  { kind: "block", type: "text_trim" },
                  { kind: "block", type: "text_print" },
                  { kind: "block", type: "text_prompt_ext" },
                ],
              },
              {
                kind: "category",
                name: "Lists",
                colour: "%{BKY_LISTS_HUE}",
                contents: [
                  { kind: "block", type: "lists_create_with" },
                  { kind: "block", type: "lists_create_empty" },
                  { kind: "block", type: "lists_repeat" },
                  { kind: "block", type: "lists_length" },
                  { kind: "block", type: "lists_isEmpty" },
                  { kind: "block", type: "lists_indexOf" },
                  { kind: "block", type: "lists_getIndex" },
                  { kind: "block", type: "lists_setIndex" },
                  { kind: "block", type: "lists_getSublist" },
                  { kind: "block", type: "lists_split" },
                  { kind: "block", type: "lists_sort" },
                ],
              },
              {
                kind: "category",
                name: "Variables",
                colour: "%{BKY_VARIABLES_HUE}",
                custom: "VARIABLE",
              },
              {
                kind: "category",
                name: "Functions",
                colour: "%{BKY_PROCEDURES_HUE}",
                custom: "PROCEDURE",
              },
            ],
          };

          // Initialize the Blockly workspace
          workspace = Blockly.inject("blocklyDiv", {
            toolbox: toolbox,
            grid: {
              spacing: 20,
              length: 3,
              colour: "#ccc",
              snap: true,
            },
            zoom: {
              controls: true,
              wheel: true,
              startScale: 1.0,
              maxScale: 3,
              minScale: 0.3,
              scaleSpeed: 1.2,
            },
            trashcan: true,
          });

          console.log("Workspace created:", workspace);

          // Add a simple test block to verify code generation
          Blockly.serialization.workspaces.load(
            {
              blocks: {
                languageVersion: 0,
                blocks: [
                  {
                    type: "text_print",
                    id: "test_block",
                    x: 50,
                    y: 50,
                    inputs: {
                      TEXT: {
                        shadow: {
                          type: "text",
                          id: "test_text",
                          fields: { TEXT: "Hello from <Hack-IT-on>" },
                        },
                      },
                    },
                  },
                ],
              },
            },
            workspace
          );

          // Add event listener for workspace changes with debounce
          let debounceTimeout;
          workspace.addChangeListener(() => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
              if (onWorkspaceChange) {
                console.log("Workspace changed, calling onWorkspaceChange");
                onWorkspaceChange();
              }
            }, 300);
          });

          // Try to load saved workspace if exists
          try {
            const savedWorkspace = localStorage.getItem("blocklyWorkspace");
            if (savedWorkspace) {
              const serialized = JSON.parse(savedWorkspace);
              Blockly.serialization.workspaces.load(serialized, workspace);
            }
          } catch (error) {
            console.error("Error loading saved workspace:", error);
          }

          // Set initialized state and notify parent
          setIsInitialized(true);
          if (onInitialized) {
            console.log("Calling onInitialized callback");
            onInitialized();
          }

          // Test code generation
          console.log(
            "Test code generation:",
            Blockly.JavaScript.workspaceToCode(workspace)
          );
        } catch (error) {
          console.error("Error initializing Blockly:", error);
        }
      };

      initBlockly();

      return () => {
        mounted = false;
        if (workspace) {
          console.log("Disposing workspace");
          workspace.dispose();
        }
      };
    }, [onWorkspaceChange, onInitialized]);

    return (
      <>
        <div id="blocklyDiv" className="w-full h-full" />
        {!isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-opacity-75">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2">Loading Blocks...</p>
            </div>
          </div>
        )}
      </>
    );
  }
);

BlocklyWorkspace.displayName = "BlocklyWorkspace";

export default BlocklyWorkspace;
