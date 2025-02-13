"use client";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function GalleryPage() {
  // Initialize states with proper default values
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState({ from: undefined, to: undefined });
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);
  const [hoveredId, setHoveredId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch unique tags from images
  const fetchTags = async () => {
    try {
      const response = await fetch("/api/gallery/tags");
      if (!response.ok) throw new Error("Failed to fetch tags");
      const data = await response.json();
      const tagsArray = Array.isArray(data) ? data : [];
      console.log("Processed tags array:", tagsArray); // Debug log

      setAvailableTags(tagsArray);
    } catch (error) {
      console.error("Error fetching tags:", error);
      console.error("Failed to load tags. Please try again later.");
      setAvailableTags([]);
    }
  };

  // availableTags.map((tag) => {
  // console.log(tag);
  // });

  // console.log(availableTags);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (date?.from) {
        params.append("from", format(date.from, "yyyy-MM-dd"));
      }
      if (date?.to) {
        params.append("to", format(date.to, "yyyy-MM-dd"));
      }
      if (selectedTags && selectedTags.length > 0) {
        params.append("tags", selectedTags.join(","));
      }

      const response = await fetch(`/api/gallery?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch images");

      const data = await response.json();
      setImages(data || []); // Ensure we set an empty array if data is null/undefined
    } catch (error) {
      console.error("Error fetching images:", error);
      console.error("Failed to load images. Please try again later.");
      setImages([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [date, selectedTags]);

  const handleSelectTag = (tag) => {
    if (selectedTags && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagPopoverOpen(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    if (selectedTags) {
      setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
    }
  };

  const handleImageSelect = (image) => {
    if (!images) return;
    const index = images.findIndex((img) => img.id === image.id);
    setSelectedImageIndex(index);
    setSelectedImage(image);
  };

  const handlePrevImage = () => {
    if (!images || selectedImageIndex <= 0) return;
    const newIndex = selectedImageIndex - 1;
    setSelectedImageIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const handleNextImage = () => {
    if (!images || selectedImageIndex >= images.length - 1) return;
    const newIndex = selectedImageIndex + 1;
    setSelectedImageIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };
  const filteredTags = Array.isArray(availableTags)
    ? availableTags.filter((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImage) {
        if (e.key === "ArrowLeft") {
          handlePrevImage();
        } else if (e.key === "ArrowRight") {
          handleNextImage();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, selectedImageIndex, images]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header Section */}
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r bg-clip-text">
              Gallery
            </h1>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "rounded-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    className="rounded-lg"
                  />
                </PopoverContent>
              </Popover>

              <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="rounded-full">
                    Select Tags
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <ScrollArea className="h-48">
                    {filteredTags.length === 0 ? (
                      <p className="text-sm text-center text-muted-foreground p-2">
                        No tags found.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {filteredTags.map((tag) => (
                          <div
                            key={tag}
                            onClick={() => handleSelectTag(tag)}
                            className="px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          >
                            {tag}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            {selectedTags && selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-full flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="break-inside-avoid mb-4">
                  <Skeleton className="h-[300px] w-full rounded-xl" />
                </div>
              ))
            : images.map((image) => (
                <div
                  key={image.id}
                  className="break-inside-avoid mb-4 group relative"
                  onMouseEnter={() => setHoveredId(image.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleImageSelect(image)}
                >
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Overlay */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-black/40 transition-opacity duration-300",
                        hoveredId === image.id ? "opacity-100" : "opacity-0"
                      )}
                    >
                      {/* Image Info */}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="font-medium text-lg mb-2">
                          {image.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(image.tags?.split(",") || []).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-white/20 hover:bg-white/30 text-white border-none"
                            >
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Enhanced Modal */}
        <Dialog
          open={!!selectedImage}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedImage(null);
              setSelectedImageIndex(-1);
            }
          }}
        >
          <DialogContent className="max-w-[100vw] h-[100vh] p-0 overflow-hidden bg-black/95 border-none">
            {selectedImage && (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Close button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-6 right-6 z-50 rounded-full bg-white/10 p-2.5 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 hover:scale-110"
                >
                  <X className="h-5 w-5" />
                </button>
                <DialogTitle>{selectedImage.title}</DialogTitle>
                {/* Navigation area - larger click targets */}
                <div className="absolute inset-0 flex items-center justify-between px-4 z-40">
                  {/* Left navigation area */}
                  <div className="h-full flex items-center">
                    <button
                      onClick={handlePrevImage}
                      disabled={selectedImageIndex === 0}
                      className="group relative flex items-center justify-center p-3 disabled:opacity-0 transition-opacity duration-200"
                    >
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <ChevronLeft className="h-8 w-8 text-white relative z-10" />
                    </button>
                  </div>

                  {/* Right navigation area */}
                  <div className="h-full flex items-center">
                    <button
                      onClick={handleNextImage}
                      disabled={selectedImageIndex === images.length - 1}
                      className="group relative flex items-center justify-center p-3 disabled:opacity-0 transition-opacity duration-200"
                    >
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <ChevronRight className="h-8 w-8 text-white relative z-10" />
                    </button>
                  </div>
                </div>

                {/* Image container with improved animation */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl transition-transform duration-300 ease-out"
                    style={{
                      transform: "scale(0.98)",
                      animation: "imageEnter 0.3s ease-out forwards",
                    }}
                  />
                </div>

                {/* Current image indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
                  {selectedImageIndex + 1} / {images.length}
                </div>

                <style jsx>{`
                  @keyframes imageEnter {
                    from {
                      opacity: 0;
                      transform: scale(0.98);
                    }
                    to {
                      opacity: 1;
                      transform: scale(1);
                    }
                  }
                `}</style>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
