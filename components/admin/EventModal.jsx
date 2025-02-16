// components/admin/EventModal.jsx
"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function EventModal({ isOpen, onClose, event, onSuccess }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      interest: 0,
    },
  });

  // Reset form when event changes
  useEffect(() => {
    if (event) {
      // Format date to local datetime string for input
      const formattedDate = event.date
        ? new Date(event.date).toISOString().slice(0, 16)
        : "";

      reset({
        title: event.title || "",
        description: event.description || "",
        date: formattedDate,
        location: event.location || "",
        interest: event.interest || 0,
      });
    } else {
      reset({
        title: "",
        description: "",
        date: "",
        location: "",
        interest: 0,
      });
    }
  }, [event, reset]);

  const onSubmit = async (data) => {
    try {
      const url = event ? `/api/admin/events/${event.id}` : "/api/admin/events";

      const response = await fetch(url, {
        method: event ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save event");
      }

      toast.success(
        event ? "Event updated successfully" : "Event created successfully"
      );
      onSuccess();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create New Event"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              {...register("title", {
                required: "Title is required",
              })}
              placeholder="Enter event title"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              {...register("description")}
              placeholder="Enter event description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input
              type="datetime-local"
              {...register("date", {
                required: "Date is required",
              })}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input
              {...register("location", {
                required: "Location is required",
              })}
              placeholder="Enter event location"
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Interest</label>
            <Input
              type="text"
              {...register("interest", {
                required: "Interest is required",
              })}
              placeholder="Enter interest"
            />
            {errors.interest && (
              <p className="text-sm text-red-500">{errors.interest.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {event ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
