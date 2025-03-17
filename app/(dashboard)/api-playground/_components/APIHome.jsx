"use client";

import { useState, useEffect } from "react";
import ResponseDisplay from "./ResponseDisplay";
import CodeSnippet from "./CodeSnippet";
import HistoryTable from "./HistoryTable";
import RequestBuilder from "./RequestBuilder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function APIHome({ userId }) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("builder");

  const handleSubmitRequest = async (requestData) => {
    setLoading(true);
    setCurrentRequest(requestData);

    try {
      // Send request through our proxy API
      const proxyResponse = await fetch("/api/api-playground/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await proxyResponse.json();
      setResponse(responseData);

      // Save to history
      await fetch("/api/api-playground/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...requestData,
          responseStatus: responseData.status,
          responseBody: JSON.stringify(responseData.data),
        }),
      });
    } catch (error) {
      console.error("Error making request:", error);
      setResponse({
        status: 500,
        statusText: "Error",
        data: {
          error:
            error.message || "An error occurred while processing your request",
        },
        headers: {},
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = (requestData) => {
    setCurrentRequest(requestData);
    setActiveTab("builder");
    handleSubmitRequest(requestData);
  };

  return (
    <main className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">API Playground</h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="builder">Request Builder</TabsTrigger>
          <TabsTrigger value="history">Request History</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          <RequestBuilder
            onSubmit={handleSubmitRequest}
            loading={loading}
            initialRequest={currentRequest}
          />

          <ResponseDisplay response={response} loading={loading} />

          {response && currentRequest && (
            <CodeSnippet request={currentRequest} response={response} />
          )}
        </TabsContent>

        <TabsContent value="history">
          <HistoryTable userId={userId} onRetry={handleRetry} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
