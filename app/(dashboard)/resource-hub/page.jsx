import React, { Suspense } from "react";
import ResourceGrid from "@/components/ResourceGrid";
import { getResources } from "@/util/resources";
import { CircleDollarSign, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCoins } from "@/util/resources";

function ResourceGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-card rounded-lg shadow-sm animate-pulse">
          <div className="h-48 bg-muted rounded-t-lg" />
          <div className="p-6 space-y-4">
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-10 bg-muted rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function ResourceHubPage() {
  const resources = await getResources();
  const coins = await getCoins();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Resource Hub
            </h1>
            <p className="text-muted-foreground mt-2">
              Discover and access premium learning materials
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-card rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm">
              <CircleDollarSign className="w-5 h-5 text-primary" />
              <span className="font-semibold">{coins[0].code_coins}</span>
              <span className="text-muted-foreground">coins available</span>
            </div>
          </div>
        </div>

        {/* <div className="bg-card rounded-lg p-4 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search resources..." className="pl-10" />
              </div>
            </div>
            <div className="flex gap-4">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="courses">Courses</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div> */}

        <Suspense fallback={<ResourceGridSkeleton />}>
          <ResourceGrid initialResources={resources} />
        </Suspense>
      </div>
    </div>
  );
}
