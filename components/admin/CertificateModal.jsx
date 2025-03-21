import React from "react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader2, Calendar, Type, Link, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

export default function CertificateModal({
  isOpen,
  onClose,
  certificate,
  onSuccess,
}) {
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      event_id: "",
      certificate_issue_date: null,
      template_url: "",
    },
  });

  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true);
      const response = await fetch("/api/admin/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      toast.error("Failed to load events");
      setEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (certificate) {
      reset({
        name: certificate.name || "",
        event_id: certificate.event_id?.toString() || "",
        certificate_issue_date: certificate.certificate_issue_date || null,
        template_url: certificate.template_url || "",
      });
    }
  }, [certificate, reset]);

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("event_id", data.event_id);
      formData.append("certificate_issue_date", data.certificate_issue_date);
      formData.append("template_url", data.template_url);

      const url = certificate
        ? `/api/admin/certificates/${certificate.id}`
        : "/api/admin/certificates";

      const response = await fetch(url, {
        method: certificate ? "PUT" : "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to save certificate");
      const result = await response.json();

      toast.success(
        certificate
          ? "Certificate updated successfully"
          : "Certificate created successfully"
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {certificate ? "Edit Certificate" : "Create New Certificate"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to {certificate ? "update" : "create"}{" "}
            your certificate
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
                  {...register("name", { required: "Title is required" })}
                  placeholder="Enter certificate title"
                  className="w-full"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Event</span>
                </Label>
                <Controller
                  name="event_id"
                  control={control}
                  rules={{ required: "Event is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        className="w-full"
                        disabled={isLoadingEvents}
                      >
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem
                            key={event.id}
                            value={event.id.toString()}
                          >
                            {event.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.event_id && (
                  <p className="text-sm text-red-500">
                    {errors.event_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Certificate Issue Date</span>
                </Label>
                <Input
                  type="datetime-local"
                  {...register("certificate_issue_date", {
                    required: "Issue date is required",
                  })}
                  className="w-full"
                />
                {errors.certificate_issue_date && (
                  <p className="text-sm text-red-500">
                    {errors.certificate_issue_date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  <span>Template Image URL</span>
                </Label>
                <Input
                  type="url"
                  {...register("template_url", {
                    required: "Template image URL is required",
                  })}
                  placeholder="Enter image URL (https://...)"
                  className="w-full"
                />
                {errors.template_url && (
                  <p className="text-sm text-red-500">
                    {errors.template_url.message}
                  </p>
                )}
                {certificate?.template_url && (
                  <div className="mt-2">
                    <img
                      src={certificate.template_url}
                      alt="Current template"
                      className="max-h-32 rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-3">
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
              ) : certificate ? (
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
