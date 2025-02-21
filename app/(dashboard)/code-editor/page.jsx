import CodeEditor from "@/components/CodeEditor";

export default function CodeEditorPage() {
  return (
    <div className="container mx-auto p-4">
      {/* <CodeEditor /> */}
      <iframe
        frameBorder="0"
        height="700px"
        src="https://onecompiler.com/embed/"
        width="100%"
      ></iframe>
    </div>
  );
}
