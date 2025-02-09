import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  Image,
  Table,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

const RichTextEditor = () => {
  const [showImageInput, setShowImageInput] = useState(false);
  const [showTableInput, setShowTableInput] = useState(false);
  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(2);
  const editorRef = useRef(null);

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleImageInsert = (url) => {
    if (url) {
      document.execCommand("insertImage", false, url);
      setShowImageInput(false);
      editorRef.current?.focus();
    }
  };

  const createTable = () => {
    let tableHTML = '<table class="border-collapse w-full">';
    for (let i = 0; i < rows; i++) {
      tableHTML += "<tr>";
      for (let j = 0; j < cols; j++) {
        tableHTML += '<td class="border border-gray-300 p-2">Cell</td>';
      }
      tableHTML += "</tr>";
    }
    tableHTML += "</table>";
    document.execCommand("insertHTML", false, tableHTML);
    setShowTableInput(false);
    editorRef.current?.focus();
  };

  return (
    <div className="w-full max-w-4xl border border-gray-200 rounded-lg shadow-sm">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex flex-wrap gap-2 bg-gray-50">
        <button
          className="p-2 hover:bg-gray-200 rounded"
          onClick={() => handleFormat("bold")}
          type="button"
        >
          <Bold size={20} />
        </button>
        <button
          className="p-2 hover:bg-gray-200 rounded"
          onClick={() => handleFormat("italic")}
          type="button"
        >
          <Italic size={20} />
        </button>
        <button
          className="p-2 hover:bg-gray-200 rounded"
          onClick={() => handleFormat("underline")}
          type="button"
        >
          <Underline size={20} />
        </button>
        <div className="w-px h-6 bg-gray-300 my-auto" />
        <button
          className="p-2 hover:bg-gray-200 rounded"
          onClick={() => handleFormat("insertUnorderedList")}
          type="button"
        >
          <List size={20} />
        </button>
        <button
          className="p-2 hover:bg-gray-200 rounded"
          onClick={() => setShowImageInput(!showImageInput)}
          type="button"
        >
          <Image size={20} />
        </button>
        <button
          className="p-2 hover:bg-gray-200 rounded"
          onClick={() => setShowTableInput(!showTableInput)}
          type="button"
        >
          <Table size={20} />
        </button>
        <div className="w-px h-6 bg-gray-300 my-auto" />
        <button
          className="p-2 hover:bg-gray-200 rounded"
          onClick={() => handleFormat("justifyLeft")}
          type="button"
        >
          <AlignLeft size={20} />
        </button>
        <button
          className="p-2 hover:bg-gray-200 rounded"
          onClick={() => handleFormat("justifyCenter")}
          type="button"
        >
          <AlignCenter size={20} />
        </button>
        <button
          className="p-2 hover:bg-gray-200 rounded"
          onClick={() => handleFormat("justifyRight")}
          type="button"
        >
          <AlignRight size={20} />
        </button>
      </div>

      {/* Image Input */}
      {showImageInput && (
        <div className="p-2 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter image URL"
              className="flex-1 p-2 border border-gray-300 rounded"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleImageInsert(e.target.value);
                }
              }}
            />
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() =>
                handleImageInsert(document.querySelector("input").value)
              }
              type="button"
            >
              Insert
            </button>
          </div>
        </div>
      )}

      {/* Table Input */}
      {showTableInput && (
        <div className="p-2 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2 items-center">
            <input
              type="number"
              min="1"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value))}
              className="w-20 p-2 border border-gray-300 rounded"
              placeholder="Rows"
            />
            <span>×</span>
            <input
              type="number"
              min="1"
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value))}
              className="w-20 p-2 border border-gray-300 rounded"
              placeholder="Columns"
            />
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={createTable}
              type="button"
            >
              Insert Table
            </button>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div
        ref={editorRef}
        className="p-4 min-h-[200px] focus:outline-none"
        contentEditable
        suppressContentEditableWarning
        onFocus={(e) => {
          const range = document.createRange();
          range.selectNodeContents(e.target);
          range.collapse(false);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }}
      />
    </div>
  );
};

export default RichTextEditor;
