"use client";
import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import LangInfo from "@/components/LangInfo";
import { toast } from "react-hot-toast";
import {
  Loader2,
  Play,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Layout,
  Maximize2,
  BracesIcon,
  FileCode,
  Settings,
} from "lucide-react";

const LANGUAGES = [
  { value: "py", label: "Python", monacoId: "python", icon: "🐍" },
  { value: "js", label: "JavaScript", monacoId: "javascript", icon: "⚡" },
  { value: "cpp", label: "C / C++", monacoId: "cpp", icon: "⚙️" },
  { value: "java", label: "Java", monacoId: "java", icon: "☕" },
  { value: "cs", label: "C#", monacoId: "csharp", icon: "#️⃣" },
  // { value: "go", label: "GoLang", monacoId: "go", icon: "🐭" },
];

const THEMES = [
  { value: "vs-dark", label: "Dark Theme" },
  { value: "light", label: "Light Theme" },
  { value: "hc-black", label: "High Contrast" },
];

const FONT_SIZES = [12, 14, 16, 18, 20];

export default function CodeEditor() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("py");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [layout, setLayout] = useState("horizontal");

  const getMonacoLanguage = useCallback((langValue) => {
    const lang = LANGUAGES.find((l) => l.value === langValue);
    return lang ? lang.monacoId : "plaintext";
  }, []);

  const handleRun = async () => {
    if (!code.trim()) {
      setError("Please enter some code before running.");
      return;
    }

    setLoading(true);
    setError("");
    setOutput("");

    try {
      const response = await fetch("/api/code-execute/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, input }),
      });
      if (!response.ok) throw new Error("Failed to execute code");
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setOutput(
          data.output || "Program executed successfully with no output"
        );
      }
    } catch (error) {
      setError("Failed to execute code. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied successfully");
  };

  const handleDownloadCode = () => {
    const extension =
      LANGUAGES.find((l) => l.value === language)?.value || "txt";
    const blob = new Blob([code], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${extension}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target?.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div
      className={`flex flex-col gap-4 p-4 ${
        isFullScreen
          ? "fixed inset-0 z-50 bg-background"
          : "h-screen max-h-screen"
      }`}
    >
      <Card className="flex-grow">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="h-6 w-6" />
              <CardTitle>Hack It On Online Compiler</CardTitle>
              <Badge variant="secondary">Beta</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setLayout((l) =>
                    l === "horizontal" ? "vertical" : "horizontal"
                  )
                }
              >
                <Layout className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullScreen((f) => !f)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="editor" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="editor" className="flex items-center gap-2">
                  <BracesIcon className="h-4 w-4" />
                  Editor
                </TabsTrigger>
                {/* <TabsTrigger
                  value="terminal"
                  className="flex items-center gap-2"
                >
                  <Terminal className="h-4 w-4" />
                  Terminal
                </TabsTrigger> */}
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".txt,.py,.js,.cpp,.java"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadCode}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyCode}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCode("")}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <LangInfo />
              </div>
            </div>

            <TabsContent value="editor" className="m-0">
              <div
                className={`grid ${
                  layout === "horizontal"
                    ? "grid-cols-1 lg:grid-cols-2"
                    : "grid-cols-1"
                } gap-4`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 mb-4">
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            <span className="flex items-center gap-2">
                              {lang.icon} {lang.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={handleRun}
                      disabled={loading}
                      className="w-24"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Run
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden h-[60vh]">
                    <Editor
                      height="100%"
                      language={getMonacoLanguage(language)}
                      theme={theme}
                      value={code}
                      onChange={(value) => setCode(value || "")}
                      options={{
                        minimap: { enabled: false },
                        fontSize,
                        lineNumbers: "on",
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        readOnly: false,
                        automaticLayout: true,
                        wordWrap: "on",
                        tabSize: 2,
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <Textarea
                    placeholder="Enter program input (optional). For multiple inputs, enter each value on a new line."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="h-32 font-mono text-sm"
                  />

                  <Card className="flex-grow">
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Output</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {error && (
                        <Alert variant="destructive" className="mb-4">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      {output && (
                        <pre className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
                          {output}
                        </pre>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Theme</h3>
                      <Select value={theme} onValueChange={setTheme}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          {THEMES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Font Size</h3>
                      <Select
                        value={fontSize.toString()}
                        onValueChange={(v) => setFontSize(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select font size" />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_SIZES.map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                              {size}px
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
