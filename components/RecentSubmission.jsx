"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, Loader2 } from "lucide-react";

export default function RecentSubmission({ problemId }) {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/submissions/users/${problemId}`);
        const data = await response.json();
        setContents(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-gray-500">Loading...</p>
      </div>
    );

  return (
    <div className="space-y-4">
      {contents.length === 0 ? (
        <Card className="w-full max-w-3xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center py-10">
              <p className="text-gray-500">
                No submissions found from your side.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        contents.map((submission) => (
          <Card key={submission.id} className="w-full max-w-3xl mx-auto">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header with status and metadata */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        submission.status === "Accepted"
                          ? "success"
                          : "secondary"
                      }
                      className="flex items-center gap-1"
                    >
                      {submission.status === "Accepted" && (
                        <Check className="w-3 h-3" />
                      )}
                      {submission.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Problem #{submission.problem_id}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDate(submission.submitted_at)}
                  </div>
                </div>

                {/* Code section */}
                <div className="bg-slate-950 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-slate-50 font-mono">
                    {submission.code}
                  </pre>
                </div>

                {/* Footer with submission details */}
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                  <div className="flex items-center space-x-4">
                    <span>
                      Language:{" "}
                      <Badge variant="outline">
                        {submission.language.toUpperCase()}
                      </Badge>
                    </span>
                    {submission.execution_time && (
                      <span>Runtime: {submission.execution_time}ms</span>
                    )}
                    {submission.memory_used && (
                      <span>Memory: {submission.memory_used}MB</span>
                    )}
                  </div>
                  <span>Submission #{submission.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
