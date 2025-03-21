"use client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Search,
  ImageIcon,
  Loader2,
  Upload,
  X,
  Tag,
  Filter,
} from "lucide-react";
import Link from "next/link";

const GalleryTable = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Fetch images on component mount
  const fetchImages = async () => {
    try {
      const response = await fetch("/api/admin/gallery");
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
      setImages(data);
    } catch (error) {
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Handle image deletion
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const response = await fetch(`/api/admin/gallery/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete image");

      setImages(images.filter((img) => img.id !== id));
      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  // Handle image update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const response = await fetch(`/api/admin/gallery/${editImage.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          tags: editTags,
        }),
      });

      if (!response.ok) throw new Error("Failed to update image");

      const updatedImages = images.map((img) =>
        img.id === editImage.id
          ? { ...img, title: editTitle, tags: editTags }
          : img
      );
      setImages(updatedImages);
      setEditImage(null);

      toast.success("Image updated successfully");
    } catch (error) {
      toast.error("Failed to update image");
    } finally {
      setIsUploading(false);
    }
  };

  // Filter images based on search term
  const filteredImages = images.filter(
    (img) =>
      img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.tags.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state component
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-gray-500">Loading gallery images...</p>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="rounded-full bg-gray-500 p-4">
        <ImageIcon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium">No images found</h3>
      <p className="text-sm text-gray-500">
        {searchTerm
          ? "Try adjusting your search terms"
          : "Upload some images to get started"}
      </p>
    </div>
  );

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gallery Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredImages.length} image
              {filteredImages.length !== 1 ? "s" : ""} total
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </button>
              )}
            </div>

            <Link href={"/admin/gallery/upload"}>
              <Button className="flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Upload New
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <LoadingState />
                  </TableCell>
                </TableRow>
              ) : filteredImages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <EmptyState />
                  </TableCell>
                </TableRow>
              ) : (
                filteredImages.map((image) => (
                  <TableRow key={image.id} className="hover:bg-gray-500">
                    <TableCell>
                      <div className="h-16 w-16 relative rounded-lg overflow-hidden border bg-gray-50">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="object-cover h-full w-full transition-transform hover:scale-110"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{image.title}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {image.tags.split(",").map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(image.uploaded_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <Dialog>
                            <DialogTrigger asChild>
                              {/* <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setEditImage(image);
                                  setEditTitle(image.title);
                                  setEditTags(image.tags);
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem> */}
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Image Details</DialogTitle>
                              </DialogHeader>
                              <form
                                onSubmit={handleUpdate}
                                className="space-y-4"
                              >
                                <div className="space-y-2">
                                  <Label htmlFor="edit-title">Title</Label>
                                  <Input
                                    id="edit-title"
                                    value={editTitle}
                                    onChange={(e) =>
                                      setEditTitle(e.target.value)
                                    }
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-tags">Tags</Label>
                                  <Input
                                    id="edit-tags"
                                    value={editTags}
                                    onChange={(e) =>
                                      setEditTags(e.target.value)
                                    }
                                    placeholder="Separate tags with commas"
                                  />
                                </div>
                                <Button
                                  type="submit"
                                  className="w-full"
                                  disabled={isUploading}
                                >
                                  {isUploading ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    "Save Changes"
                                  )}
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <DropdownMenuItem
                            className="text-red-600"
                            onSelect={() => handleDelete(image.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default GalleryTable;
