"use client";
import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  AlertCircle,
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
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function GalleryPage() {
  // States with proper typing and defaults
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState({ from: undefined, to: undefined });
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);
  const [hoveredId, setHoveredId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced search query
  const debouncedFetch = useCallback(
    debounce(() => {
      fetchImages();
    }, 300),
    [date, selectedTags]
  );

  // Fetch tags with error handling
  const fetchTags = async () => {
    try {
      const response = await fetch("/api/gallery/tags");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setAvailableTags(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error("Error fetching tags:", error);
      setError("Failed to load tags. Please try again later.");
      setAvailableTags([]);
    }
  };

  // Fetch images with error handling
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();

      if (date?.from) {
        params.append("from", format(date.from, "yyyy-MM-dd"));
      }
      if (date?.to) {
        params.append("to", format(date.to, "yyyy-MM-dd"));
      }
      if (selectedTags?.length > 0) {
        params.append("tags", selectedTags.join(","));
      }

      const response = await fetch(`/api/gallery?${params.toString()}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching images:", error);
      setError("Failed to load images. Please try again later.");
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    debouncedFetch();
    return () => debouncedFetch.cancel();
  }, [date, selectedTags, debouncedFetch]);

  const handleSelectTag = (tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    setTagPopoverOpen(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleImageSelect = (image) => {
    const index = images.findIndex((img) => img.id === image.id);
    setSelectedImageIndex(index);
    setSelectedImage(image);
  };

  const handlePrevImage = () => {
    if (selectedImageIndex <= 0) return;
    const newIndex = selectedImageIndex - 1;
    setSelectedImageIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const handleNextImage = () => {
    if (selectedImageIndex >= images.length - 1) return;
    const newIndex = selectedImageIndex + 1;
    setSelectedImageIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const filteredTags = availableTags.filter((tag) =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;

      switch (e.key) {
        case "ArrowLeft":
          handlePrevImage();
          break;
        case "ArrowRight":
          handleNextImage();
          break;
        case "Escape":
          setSelectedImage(null);
          setSelectedImageIndex(-1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, selectedImageIndex]);

  // Debounce utility function
  function debounce(func, wait) {
    let timeout;
    const debounced = function (...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
    debounced.cancel = () => clearTimeout(timeout);
    return debounced;
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen ">
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
                    aria-label="Select date range"
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
                  <Button
                    variant="outline"
                    className="rounded-full"
                    aria-label="Select tags"
                  >
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
                      aria-label="Search tags"
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
                          <button
                            key={tag}
                            onClick={() => handleSelectTag(tag)}
                            className="w-full px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer text-left"
                            aria-label={`Select tag: ${tag}`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-full flex items-center gap-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 rounded-full"
                      aria-label={`Remove tag: ${tag}`}
                    >
                      <X className="h-3 w-3 cursor-pointer" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        <div
          className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4"
          role="grid"
          aria-label="Image gallery"
        >
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-4">
                <Skeleton className="h-[300px] w-full rounded-xl" />
              </div>
            ))
          ) : images.length === 0 ? (
            <div className="col-span-full flex items-center justify-center min-h-[300px] text-gray-500">
              No images found matching your criteria.
            </div>
          ) : (
            images.map((image) => (
              <div
                key={image.id}
                className="break-inside-avoid mb-4 group relative"
                onMouseEnter={() => setHoveredId(image.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <button
                  onClick={() => handleImageSelect(image)}
                  className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
                  aria-label={`View ${image.title}`}
                >
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Overlay */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-black/40 transition-opacity duration-300",
                        hoveredId === image.id ? "opacity-100" : "opacity-0"
                      )}
                    >
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="font-medium text-lg mb-2">
                          {image.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {image.tags?.split(",").map((tag, index) => (
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
                </button>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
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
                  className="absolute top-6 right-6 z-50 rounded-full bg-white/10 p-2.5 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>

                <DialogTitle className="sr-only">
                  {selectedImage.title}
                </DialogTitle>

                {/* Navigation buttons */}
                <div className="absolute inset-0 flex items-center justify-between px-4 z-40">
                  <button
                    onClick={handlePrevImage}
                    disabled={selectedImageIndex === 0}
                    className="group relative flex items-center justify-center p-3 disabled:opacity-0 disabled:cursor-not-allowed transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full"
                    aria-label="Previous image"
                  >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <ChevronLeft className="h-8 w-8 text-white relative z-10" />
                  </button>

                  <button
                    onClick={handleNextImage}
                    disabled={selectedImageIndex === images.length - 1}
                    className="group relative flex items-center justify-center p-3 disabled:opacity-0 disabled:cursor-not-allowed transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full"
                    aria-label="Next image"
                  >
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <ChevronRight className="h-8 w-8 text-white relative z-10" />
                  </button>
                </div>

                {/* Image container */}
                <div
                  className="relative w-full h-full flex items-center justify-center"
                  role="dialog"
                  aria-label={`Image: ${selectedImage.title}`}
                >
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl"
                    style={{
                      animation: "imageEnter 0.3s ease-out forwards",
                    }}
                    loading="eager"
                  />

                  {/* Image details overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 backdrop-blur-sm">
                    <h2 className="text-xl font-semibold mb-2">
                      {selectedImage.title}
                    </h2>
                    {selectedImage.tags && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedImage.tags.split(",").map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-white/20 text-white"
                          >
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="text-sm text-white/70">
                      {selectedImageIndex + 1} of {images.length}
                    </div>
                  </div>
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
