"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function PurchasesList({ initialPurchases }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  async function handleDownload(resourceId) {
    try {
      setLoading(resourceId);
      setError(null);
      const response = await fetch(`/api/resources/download/${resourceId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to download resource");
      }

      const data = await response.json();
      window.open(data.downloadUrl, "_blank");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  }

  if (!initialPurchases?.length) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No purchases found. Your purchased resources will appear here.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialPurchases.map((purchase) => (
          <Card
            key={purchase.id}
            className="flex flex-col hover:shadow-lg transition-shadow duration-200"
          >
            {purchase.image_link ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                <img
                  src={purchase.image_link}
                  alt={purchase.name}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-gray-100 rounded-t-lg" />
            )}

            <CardHeader>
              <CardTitle className="flex items-center justify-between space-x-2">
                <span className="text-lg font-semibold line-clamp-1">
                  {purchase?.name}
                </span>
              </CardTitle>
              <CardDescription className="line-clamp-3">
                {purchase.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {format(new Date(purchase.purchased_at), "PPP")}
                </Badge>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <Button
                className="w-full"
                onClick={() => handleDownload(purchase.resource_id)}
                disabled={loading === purchase.resource_id}
              >
                {loading === purchase.resource_id ? (
                  <>
                    <Skeleton className="h-4 w-4 mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Resource
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
