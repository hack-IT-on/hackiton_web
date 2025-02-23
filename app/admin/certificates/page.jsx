"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Plus,
  Loader2,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import EventModal from "@/components/admin/EventModal";
import Link from "next/link";
import CertificateModal from "@/components/admin/CertificateModal";

export default function EventCertificatesTable() {
  const [certificates, setCertificates] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [eventNames, setEventNames] = useState({});

  const fetchEventName = async (eventId) => {
    try {
      const response = await fetch(`/api/admin/events/${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch certificates");
      const data = await response.json();
      return data.name || "Unknown Event";
    } catch (error) {
      console.error(`Failed to fetch event name for ID ${eventId}:`, error);
      return "Unknown Event";
    }
  };

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/admin/certificates?page=${page}&limit=10`
      );
      if (!response.ok) throw new Error("Failed to fetch certificates");
      const data = await response.json();
      setCertificates(data.certificates || []);
      setTotalPages(data.totalPages || 1);

      // Fetch event names for all certificates
      const eventNamesMap = {};
      await Promise.all(
        data.certificates.map(async (cert) => {
          if (cert.event_id && !eventNames[cert.event_id]) {
            eventNamesMap[cert.event_id] = await fetchEventName(cert.event_id);
          }
        })
      );
      setEventNames((prev) => ({ ...prev, ...eventNamesMap }));
    } catch (error) {
      toast.error("Failed to fetch certificates");
      setCertificates([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page]);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;

    try {
      const response = await fetch(`/api/admin/certificates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete certificate");

      toast.success("Certificate deleted successfully");
      fetchEvents();
    } catch (error) {
      toast.error("Failed to delete certificate");
    }
  };

  const handleEdit = (event) => {
    setSelectedCertificate(event);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCertificate(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCertificate(null);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setSelectedCertificate(null);
    fetchEvents();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Certificate Management</h2>
            <p className="text-muted-foreground mt-1">
              Manage your event certificates and their details
            </p>
          </div>
          {/* <Link href={"/admin/certificates/new"}> */}
          <Button className="flex items-center" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add New Certificate
          </Button>
          {/* </Link> */}
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/50">
            <h3 className="text-lg font-semibold">
              No event certificates found
            </h3>
            <p className="text-muted-foreground mt-1">
              Start by creating your first event certificate
            </p>
            <Button onClick={handleCreate} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Create Certificate
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead className="w-[300px]">Event Name</TableHead>
                  <TableHead className="w-[150px]">
                    Certificate Issue Date
                  </TableHead>
                  <TableHead className="w-[200px]">Template</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell className="font-medium">{cert.name}</TableCell>
                    <TableCell className="truncate max-w-[300px]">
                      {eventNames[cert.event_id] || "Loading..."}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(cert.certificate_issue_date), "PPP")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {cert.template_url}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem
                            onClick={() => handleEdit(cert)}
                            className="flex items-center gap-2"
                          >
                            <PencilIcon className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(cert.id)}
                            className="flex items-center gap-2 text-red-600 focus:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        <CertificateModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          cert={selectedCertificate}
          onSuccess={handleSuccess}
        />
      </div>
    </Card>
  );
}
