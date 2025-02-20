import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

const EditProfileModal = ({ user, isOpen, onClose, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "user",
    student_id: user?.student_id || "",
    github_username: user?.github_username || "",
    leetcode_username: user?.leetcode_username || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update user");

      const updatedUser = await response.json();
      onUserUpdate(updatedUser);
      toast.success("User profile updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update user profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">MAKAUT Roll Number</label>
              <Input
                value={formData.student_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    student_id: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">GitHub Username</label>
              <Input
                value={formData.github_username}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    github_username: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Leetcode Username</label>
              <Input
                value={formData.leetcode_username}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    leetcode_username: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
