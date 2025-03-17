"use client";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import MDEditor from "@uiw/react-md-editor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  AlertCircle,
  Search,
  Tag,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function QuestionsPage({ initialQuestions }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [viewQuestion, setViewQuestion] = useState(null);

  const router = useRouter();

  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the effective theme (handling "system" preference)
  const currentTheme = mounted
    ? theme === "system"
      ? systemTheme
      : theme
    : "light";

  const ITEMS_PER_PAGE = 10;

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    const matchesTags =
      !tagFilter || q.tags.toLowerCase().includes(tagFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesTags;
  });

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedQuestions = filteredQuestions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset to first page when filters change
  const handleFilterChange = (type, value) => {
    setCurrentPage(1);
    switch (type) {
      case "search":
        setSearch(value);
        break;
      case "status":
        setStatusFilter(value);
        break;
      case "tag":
        setTagFilter(value);
        break;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const updateStatus = async (id, newStatus) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              status: newStatus,
              approved_at:
                newStatus === "approved" ? new Date().toISOString() : null,
            }
          : q
      )
    );

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/questions/status", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: newStatus }),
        });

        if (!response.ok) throw new Error("Failed to update status");
        router.refresh();
      } catch (error) {
        setQuestions(initialQuestions);
        console.error("Error updating status:", error);
      }
    });
  };

  if (!mounted) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Questions Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search questions..."
              value={search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="flex gap-2 items-center">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select
              value={statusFilter}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 items-center">
            <Tag className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Filter by tags..."
              value={tagFilter}
              onChange={(e) => handleFilterChange("tag", e.target.value)}
              className="w-[200px]"
            />
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No questions found matching your filters.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="">
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Content</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Tags</TableHead>
                    <TableHead className="text-right font-semibold">
                      Views
                    </TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold">Approved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedQuestions.map((question) => (
                    <TableRow key={question.id} className=" transition-colors">
                      <TableCell className="font-medium">
                        {question.title}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {question.content.length > 100
                          ? `${question.content.slice(0, 100)}...`
                          : question.content}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewQuestion(question)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={question.status}
                          onValueChange={(value) =>
                            updateStatus(question.id, value)
                          }
                          disabled={isPending}
                        >
                          <SelectTrigger className="w-[130px]">
                            <div
                              className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                                question.status
                              )}`}
                            >
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {question.tags.split(",").map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                            >
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {question.views}
                      </TableCell>
                      <TableCell className="">
                        {format(new Date(question.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="">
                        {question.approved_at
                          ? format(
                              new Date(question.approved_at),
                              "MMM d, yyyy"
                            )
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* View Content Dialog */}
        <Dialog
          open={!!viewQuestion}
          onOpenChange={() => setViewQuestion(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {viewQuestion?.title}
              </DialogTitle>
              <DialogClose className="absolute right-4 top-4">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </DialogHeader>
            <div className="space-y-4">
              <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-500">Content</h3>
                <div className="mt-1 whitespace-pre-wrap text-gray-900  p-4 rounded-md border">
                  <div data-color-mode={currentTheme}>
                    <MDEditor.Markdown
                      source={viewQuestion?.content}
                      style={{ whiteSpace: "pre-wrap" }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <Badge
                    className={`mt-1 ${
                      viewQuestion?.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : viewQuestion?.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {viewQuestion?.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-medium">Views</h3>
                  <p className="mt-1 text-gray-900">{viewQuestion?.views}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium ">Created</h3>
                  <p className="mt-1 text-gray-900">
                    {viewQuestion?.created_at
                      ? format(new Date(viewQuestion.created_at), "PPP")
                      : "-"}
                  </p>
                </div>

                {viewQuestion?.approved_at && (
                  <div>
                    <h3 className="text-sm font-medium ">Approved</h3>
                    <p className="mt-1 text-gray-900">
                      {format(new Date(viewQuestion.approved_at), "PPP")}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium ">Tags</h3>
                <div className="mt-1 flex flex-wrap gap-1">
                  {viewQuestion?.tags.split(",").map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
