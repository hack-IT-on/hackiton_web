import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check, Code } from "lucide-react";

export default function CodeSnippet({ request, response }) {
  const [activeTab, setActiveTab] = useState("fetch");
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if screen is mobile on component mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  if (!request) {
    return null;
  }

  const { method, url, headers, body, queryParams } = request;

  // Build the full URL with query parameters
  const buildUrl = () => {
    try {
      const urlObj = new URL(url);
      if (queryParams && Object.keys(queryParams).length > 0) {
        Object.entries(queryParams).forEach(([key, value]) => {
          if (key && value) {
            urlObj.searchParams.append(key, value);
          }
        });
      }
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  };

  const fullUrl = buildUrl();

  // Format headers object for code snippets
  const headersStr =
    headers && Object.keys(headers).length > 0
      ? JSON.stringify(headers, null, 2)
      : "{}";

  // Format request body
  const bodyStr = body
    ? typeof body === "string"
      ? body
      : JSON.stringify(body)
    : "";

  // Generate code snippets
  const snippets = {
    fetch: `fetch("${fullUrl}", {
  method: "${method}",
  headers: ${headersStr},${
      method !== "GET" && bodyStr ? `\n  body: ${JSON.stringify(bodyStr)},` : ""
    }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,

    axios: `import axios from 'axios';

axios({
  method: '${method.toLowerCase()}',
  url: '${fullUrl}',
  headers: ${headersStr},${
      method !== "GET" && bodyStr ? `\n  data: ${bodyStr},` : ""
    }
})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });`,

    python: `import requests

url = "${fullUrl}"
headers = ${headersStr}
${method !== "GET" && bodyStr ? `payload = ${bodyStr}\n` : ""}
response = requests.${method.toLowerCase()}(url, headers=headers${
      method !== "GET" && bodyStr ? ", json=payload" : ""
    })

print(response.status_code)
print(response.json())`,

    curl: `curl -X ${method} "${fullUrl}" \\
${Object.entries(headers || {})
  .map(([key, value]) => `  -H "${key}: ${value}" \\`)
  .join("\n")}${method !== "GET" && bodyStr ? `\n  -d '${bodyStr}' \\` : ""}
  -v`,

    node: `const http = require('http');
const https = require('https');

const url = new URL("${fullUrl}");
const options = {
  hostname: url.hostname,
  port: url.port || (url.protocol === 'https:' ? 443 : 80),
  path: \`\${url.pathname}\${url.search}\`,
  method: '${method}',
  headers: ${headersStr},
};

const req = ${
      fullUrl.startsWith("https") ? "https" : "http"
    }.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(JSON.parse(data));
  });
});

req.on('error', (error) => {
  console.error(error);
});
${method !== "GET" && bodyStr ? `\nreq.write(${JSON.stringify(bodyStr)});` : ""}
req.end();`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Labels for the tabs (shorter for mobile)
  const tabLabels = {
    fetch: isMobile ? "fetch" : "JavaScript (fetch)",
    axios: isMobile ? "axios" : "JavaScript (axios)",
    python: "Python",
    node: isMobile ? "Node" : "Node.js",
    curl: "cURL",
  };

  return (
    <Card className="w-full mt-4 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between  rounded-t-lg">
        <div className="flex items-center">
          <Code className="h-5 w-5 mr-2 " />
          <CardTitle className="text-lg md:text-xl">Code Snippets</CardTitle>
        </div>
        <Button
          variant={copied ? "success" : "outline"}
          size="sm"
          onClick={copyToClipboard}
          className={`transition-colors ${
            copied
              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
              : ""
          }`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="mb-4 p-2 bg-slate-100 dark:bg-slate-700 w-full justify-start">
              {Object.keys(snippets).map((key) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="px-3 py-1.5 text-sm md:text-base"
                >
                  {tabLabels[key]}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {Object.entries(snippets).map(([key, snippet]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <pre className="p-4 rounded-md overflow-auto max-h-96 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <code>{snippet}</code>
              </pre>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
