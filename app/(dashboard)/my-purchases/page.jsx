import PurchasesList from "@/components/PurchasesList";
import { getPurchasedResources } from "@/util/resources";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Package, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function PurchasesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <Card key={n} className="flex flex-col">
            <Skeleton className="h-48 rounded-t-lg" />
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default async function PurchasesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const purchases = await getPurchasedResources(user?.id);

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">My Purchases</h1>
            </div>

            {/* Search and Filter Section */}
            <div className="flex items-center gap-2">
              <div className="bg-card rounded-lg px-4 py-2 flex items-center gap-2 shadow-sm">
                <Wallet className="w-5 h-5 text-primary" />
                <span className="font-semibold">{purchases.length}</span>
                <span className="text-muted-foreground">total purchases</span>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Purchases", value: purchases.length },
              { label: "Downloaded", value: "0" },
              { label: "Recent Activity", value: "Last 24h" },
              { label: "Storage Used", value: "0 MB" },
            ].map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-sm text-gray-500">{stat.label}</div>
                  <div className="text-2xl font-bold mt-1">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div> */}

          {/* Purchases List */}
          <Suspense fallback={<PurchasesLoading />}>
            <PurchasesList initialPurchases={purchases} />
          </Suspense>

          {/* Empty State */}
          {purchases.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold">No purchases yet</h3>
              <p className="mt-2 text-gray-500">
                Your purchased resources will appear here.
              </p>
              <Link href="/resource-hub">
                <Button className="mt-6">Browse Resources</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
