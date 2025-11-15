"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DeleteAccountSection({ userId }: { userId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete account");
      }

      toast.success("Your account has been deleted.");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      {/* Danger Zone Card */}
      <div className="mt-8">
        <div className="rounded-lg bg-white border-2 border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg text-[#FF3636] font-semibold">
              Delete your account
            </h3>
            <p className="text-sm text-gray-800 mt-1 pr-0.5">
              This will permanently delete your account and all associated data.
              This action cannot be undone.
            </p>
          </div>
          <div>
            <Button
              onClick={() => setShowModal(true)}
              className="font-bold bg-[#FF3636] text-gray-200 hover:bg-gray-200 hover:text-[#FF3636]"
            >
              Delete account &rarr;
            </Button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium">
              Permanently delete this account
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Are you sure you want to permanently delete this account and all
              associated data?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#FF3636] text-white hover:bg-gray-200 hover:text-[#FF3636]"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}