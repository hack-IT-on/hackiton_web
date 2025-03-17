import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus, Send, Globe } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false }
);

export default function RequestBuilder({ onSubmit, loading }) {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState(
    "https://jsonplaceholder.typicode.com/posts/1"
  );
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);
  const [queryParams, setQueryParams] = useState([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [activeTab, setActiveTab] = useState("headers");
  const [theme, setTheme] = useState("light");

  // Detect system theme
  useEffect(() => {
    // Check for system dark mode preference
    const isDarkMode =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(isDarkMode ? "vs-dark" : "light");

    // Listen for theme changes
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    const handleThemeChange = (e) => {
      setTheme(e.matches ? "vs-dark" : "light");
    };

    darkModeMediaQuery.addEventListener("change", handleThemeChange);

    return () => {
      darkModeMediaQuery.removeEventListener("change", handleThemeChange);
    };
  }, []);

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index) => {
    const newHeaders = [...headers];
    newHeaders.splice(index, 1);
    setHeaders(newHeaders);
  };

  const updateHeader = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: "", value: "" }]);
  };

  const removeQueryParam = (index) => {
    const newQueryParams = [...queryParams];
    newQueryParams.splice(index, 1);
    setQueryParams(newQueryParams);
  };

  const updateQueryParam = (index, field, value) => {
    const newQueryParams = [...queryParams];
    newQueryParams[index][field] = value;
    setQueryParams(newQueryParams);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert headers array to object
    const headersObject = headers.reduce((acc, header) => {
      if (header.key && header.value) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {});

    // Convert query params array to object
    const queryParamsObject = queryParams.reduce((acc, param) => {
      if (param.key && param.value) {
        acc[param.key] = param.value;
      }
      return acc;
    }, {});

    const requestData = {
      method,
      url,
      headers: headersObject,
      queryParams: queryParamsObject,
      body: body || undefined,
    };

    onSubmit(requestData);
  };

  return (
    <Card className="w-full shadow-lg ">
      <CardHeader className=" border-b ">
        <div className="flex items-center">
          <Globe className="h-5 w-5 text-slate-500 mr-2" />
          <CardTitle>Your Request</CardTitle>
        </div>
        <CardDescription className="text-slate-500">
          Configure your API request details
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-full md:w-28 ">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              className="flex-1 font-mono text-sm"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Send
                </>
              )}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="mb-4  p-1 w-full grid grid-cols-3">
              <TabsTrigger value="headers" className="text-sm">
                Headers
              </TabsTrigger>
              <TabsTrigger value="params" className="text-sm">
                Query Params
              </TabsTrigger>
              <TabsTrigger value="body" className="text-sm">
                Body
              </TabsTrigger>
            </TabsList>

            <TabsContent value="headers" className="border rounded-md p-4 ">
              {headers.map((header, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  <Input
                    value={header.key}
                    onChange={(e) => updateHeader(index, "key", e.target.value)}
                    placeholder="Header name"
                    className="flex-1 text-sm"
                  />
                  <Input
                    value={header.value}
                    onChange={(e) =>
                      updateHeader(index, "value", e.target.value)
                    }
                    placeholder="Header value"
                    className="flex-1 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeHeader(index)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHeader}
                className="mt-2 text-slate-600"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Header
              </Button>
            </TabsContent>

            <TabsContent value="params" className="border rounded-md p-4 ">
              {queryParams.map((param, index) => (
                <div key={index} className="flex gap-2 mb-3">
                  <Input
                    value={param.key}
                    onChange={(e) =>
                      updateQueryParam(index, "key", e.target.value)
                    }
                    placeholder="Parameter name"
                    className="flex-1 text-sm"
                  />
                  <Input
                    value={param.value}
                    onChange={(e) =>
                      updateQueryParam(index, "value", e.target.value)
                    }
                    placeholder="Parameter value"
                    className="flex-1 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeQueryParam(index)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addQueryParam}
                className="mt-2 text-slate-600"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Parameter
              </Button>
            </TabsContent>

            <TabsContent value="body" className="border rounded-md p-4 ">
              <div className="h-64 border rounded-md overflow-hidden">
                <MonacoEditor
                  height="100%"
                  language="json"
                  theme={theme}
                  value={body}
                  onChange={setBody}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    folding: true,
                    lineNumbers: "on",
                    tabSize: 2,
                    automaticLayout: true,
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
    </Card>
  );
}
