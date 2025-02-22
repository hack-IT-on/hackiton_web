"use client";
import React, { useState } from "react";
import { ExternalLink, ShoppingCart, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

const ResourceGrid = ({ initialResources }) => {
  const [loading, setLoading] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  async function handlePurchase(resourceId) {
    try {
      setLoading(resourceId);
      const response = await fetch("/api/resources/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId }),
      });
      // console.log(resourceId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success("You now have access to this resource.", {
        duration: 3000,
      });
    } catch (error) {
      toast.error(error.message, {
        duration: 3000,
      });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {initialResources.map((resource) => (
        <Card
          key={resource?.id}
          className="flex flex-col transform transition-all duration-300 hover:shadow-xl"
          onMouseEnter={() => setHoveredCard(resource?.id)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          {resource?.image_link && (
            <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
                style={{
                  backgroundImage: `url(${resource?.image_link})`,
                  transform:
                    hoveredCard === resource?.id ? "scale(1.05)" : "scale(1)",
                }}
              />
              {resource?.featured && (
                <Badge className="absolute top-2 right-2 bg-primary">
                  Featured
                </Badge>
              )}
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center justify-between space-x-2">
              <span className="text-lg font-semibold line-clamp-1">
                {resource?.name}
              </span>
              {/* {resource.resource_link && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={resource.resource_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>Open resource</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )} */}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {resource?.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">
                {resource?.price}
              </span>
              <span className="text-sm text-gray-500">coins</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full flex items-center justify-center space-x-2 transition-all"
              onClick={() => handlePurchase(resource?.id)}
              disabled={loading === resource?.id}
            >
              {loading === resource?.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Buy Now</span>
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ResourceGrid;
