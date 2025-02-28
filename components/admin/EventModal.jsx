import React from "react";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Loader2,
  Calendar,
  MapPin,
  Image,
  Type,
  FileText,
  ToggleLeft,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const interests = [
  "Programming",
  "Design",
  "Marketing",
  "Data Science",
  "Entrepreneurship",
];

const statusOptions = [
  { label: "Active", value: "1" },
  { label: "Deactive", value: "0" },
];

export default function EventModal({ isOpen, onClose, event, onSuccess }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      long_description: "",
      image_url: "",
      date: "",
      registration_deadline: "",
      location: "",
      interest: "",
      is_active: "0",
    },
  });

  useEffect(() => {
    if (event) {
      const formattedDate = event.date
        ? new Date(event.date).toISOString().slice(0, 16)
        : "";

      const formattedDeadline = event.date
        ? new Date(event.registration_deadline).toISOString().slice(0, 16)
        : "";

      reset({
        title: event.title || "",
        description: event.description || "",
        long_description: event.long_description || "",
        image_url: event.image_url || "",
        date: formattedDate,
        registration_deadline: formattedDeadline,
        location: event.location || "",
        interest: event.interest || "",
        is_active: event.is_active?.toString() || "0",
      });
    }
  }, [event, reset]);

  const onSubmit = async (data) => {
    try {
      // Convert is_active to number before sending
      const formData = {
        ...data,
        is_active: parseInt(data.is_active, 10),
      };

      const url = event ? `/api/admin/events/${event.id}` : "/api/admin/events";
      const response = await fetch(url, {
        method: event ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save event");

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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {event ? "Edit Event" : "Create New Event"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to {event ? "update" : "create"} your
            event
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  <span>Title</span>
                </Label>
                <Input
                  {...register("title", { required: "Title is required" })}
                  placeholder="Enter event title"
                  className="w-full"
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Short Description</span>
                </Label>
                <Textarea
                  {...register("description")}
                  placeholder="Enter a brief description"
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Detailed Description</span>
                </Label>
                <div data-color-mode="light" className="border rounded-md">
                  <Controller
                    name="long_description"
                    control={control}
                    render={({ field }) => (
                      <MDEditor
                        value={field.value}
                        onChange={field.onChange}
                        height={400}
                        className="border-none"
                        preview="edit"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  <span>Image URL</span>
                </Label>
                <Input
                  {...register("image_url", {
                    required: "Image URL is required",
                  })}
                  placeholder="Enter image URL"
                />
                {errors.image_url && (
                  <p className="text-sm text-red-500">
                    {errors.image_url.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ToggleLeft className="w-4 h-4" />
                  <span>Status</span>
                </Label>
                <Controller
                  name="is_active"
                  control={control}
                  rules={{ required: "Status is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.is_active && (
                  <p className="text-sm text-red-500">
                    {errors.is_active.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Date & Time</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    {...register("date", { required: "Date is required" })}
                    className="w-full"
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500">
                      {errors.date.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Registration Deadline</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    {...register("registration_deadline", {
                      required: "Deadline is required",
                    })}
                    className="w-full"
                  />
                  {errors.registration_deadline && (
                    <p className="text-sm text-red-500">
                      {errors.registration_deadline.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Location</span>
                  </Label>
                  <Input
                    {...register("location", {
                      required: "Location is required",
                    })}
                    placeholder="Enter event location"
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">
                      {errors.location.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest">Interest Category</Label>
                <Controller
                  name="interest"
                  control={control}
                  rules={{ required: "Interest is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an interest" />
                      </SelectTrigger>
                      <SelectContent>
                        {interests.map((interest) => (
                          <SelectItem
                            key={interest}
                            value={interest.toLowerCase()}
                          >
                            {interest}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.interest && (
                  <p className="text-sm text-red-500">
                    {errors.interest.message}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-24"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-24">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : event ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
