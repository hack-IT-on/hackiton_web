import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Editor from "@monaco-editor/react";

export default function ResponseDisplay({ response, loading }) {
  const [activeTab, setActiveTab] = useState("body");
  const [language, setLanguage] = useState("json");

  useEffect(() => {
    // Try to detect language based on content and headers
    if (response?.headers) {
      const contentType = response.headers["content-type"] || "";
      if (contentType.includes("application/json")) {
        setLanguage("json");
      } else if (contentType.includes("text/html")) {
        setLanguage("html");
      } else if (contentType.includes("text/css")) {
        setLanguage("css");
      } else if (contentType.includes("application/javascript")) {
        setLanguage("javascript");
      } else if (contentType.includes("text/plain")) {
        setLanguage("plaintext");
      } else {
        setLanguage("json"); // Default to JSON
      }
    }
  }, [response]);

  if (!response && !loading) {
    return (
      <Card className="w-full mt-4">
        <CardHeader>
          <CardTitle>Response</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-500">
          Send a request to see the response
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full mt-4">
        <CardHeader>
          <CardTitle>Response</CardTitle>
        </CardHeader>
        <CardContent className="text-center">Loading...</CardContent>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return "bg-green-500";
    if (status >= 300 && status < 400) return "bg-blue-500";
    if (status >= 400 && status < 500) return "bg-yellow-500";
    if (status >= 500) return "bg-red-500";
    return "bg-gray-500";
  };

  // Format JSON with indentation for display
  const formatJson = (data) => {
    if (typeof data === "string") {
      try {
        return JSON.stringify(JSON.parse(data), null, 2);
      } catch (e) {
        return data;
      }
    }
    return JSON.stringify(data, null, 2);
  };

  const getEditorContent = () => {
    try {
      if (typeof response.data === "string") {
        if (language === "json") {
          // Try to format as JSON if possible
          return formatJson(response.data);
        }
        return response.data;
      }
      return formatJson(response.data);
    } catch (e) {
      return String(response.data);
    }
  };

  return (
    <Card className="w-full mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Response
          <Badge className={`${getStatusColor(response.status)} text-white`}>
            {response.status} {response.statusText}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
          </TabsList>

          <TabsContent
            value="body"
            className="h-96 border rounded-md overflow-hidden"
          >
            {/* <div className="h-64 "> */}
            <Editor
              height="100%"
              language="json"
              value={getEditorContent()}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
                fontSize: 14,
              }}
              theme="vs-dark"
            />
            {/* </div> */}
          </TabsContent>

          <TabsContent value="headers">
            <div className="p-4 rounded-md overflow-auto max-h-96">
              {response.headers &&
                Object.entries(response.headers).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex py-1 border-b border-gray-200 last:border-0"
                  >
                    <span className="font-semibold min-w-36">{key}:</span>
                    <span className="">{value}</span>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
