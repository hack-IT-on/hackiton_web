import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ViewDetailsModal = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p className="mt-1">{user.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="mt-1">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Role</p>
            <p className="mt-1">{user.role}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              MAKAUT Roll Number
            </p>
            <p className="mt-1">{user.student_id}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">GitHub Username</p>
            <p className="mt-1">{user.github_username || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Leetcode Username
            </p>
            <p className="mt-1">{user.leetcode_username || "Not provided"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetailsModal;
