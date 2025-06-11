import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getReportReasons, reportPost } from "@/services/reportService";

const REPORT_REASON_LABELS = {
  inappropriate_content: "Inappropriate Content",
  spam: "Spam",
  harassment: "Harassment",
  copyright_violation: "Copyright Violation",
  fake_content: "Fake Content",
  violence: "Violence",
  adult_content: "Adult Content",
  hate_speech: "Hate Speech",
  other: "Other",
};

export function ReportPostModal({ isOpen, onClose, post, currentUser }) {
  const [reason, setReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [loadingReasons, setLoadingReasons] = useState(true);
  const [errors, setErrors] = useState({});

  // Load report reasons on mount
  useEffect(() => {
    if (isOpen) {
      loadReportReasons();
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setAdditionalInfo("");
      setErrors({});
      setLoading(false);
    }
  }, [isOpen]);
  const loadReportReasons = async () => {
    try {
      const response = await getReportReasons();
      if (response.data.success) {
        const reasonsData = response.data.data;

        // Handle different API response formats
        if (Array.isArray(reasonsData)) {
          // If it's an array of objects with {value, label}, extract the values
          if (reasonsData.length > 0 && typeof reasonsData[0] === "object" && reasonsData[0].value) {
            setReasons(reasonsData.map((reason) => reason.value));
          } else {
            // If it's already an array of strings
            setReasons(reasonsData);
          }
        } else {
          // Fallback to default reasons
          setReasons(Object.keys(REPORT_REASON_LABELS));
        }
      } else {
        // Fallback to default reasons if API call fails
        setReasons(Object.keys(REPORT_REASON_LABELS));
      }
    } catch (error) {
      console.error("Error loading report reasons:", error);
      // Fallback to default reasons
      setReasons(Object.keys(REPORT_REASON_LABELS));
    } finally {
      setLoadingReasons(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!reason) {
      newErrors.reason = "Please select a reason for reporting";
    }

    if (additionalInfo.length > 1000) {
      newErrors.additionalInfo = "Additional information must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!post?.id || !currentUser) return;

    setLoading(true);

    try {
      const reportData = {
        reason,
        additional_info: additionalInfo.trim() || null,
      };

      const response = await reportPost(post.id, reportData);

      if (response.data.success) {
        toast.success("Post reported successfully. Thank you for helping keep our community safe.");
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to report post");
      }
    } catch (error) {
      console.error("Error reporting post:", error);

      if (error.response?.status === 429) {
        toast.error("You have reached the report limit. Please try again later.");
      } else if (error.response?.status === 409) {
        toast.error("You have already reported this post.");
      } else if (error.response?.status === 403) {
        toast.error("You cannot report your own post.");
      } else {
        toast.error(error.response?.data?.message || "Failed to report post. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!post || !currentUser) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            Report Post
          </DialogTitle>
          <DialogDescription>Help us keep the community safe by reporting content that violates our guidelines.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Post Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium truncate">{post.title}</p>
            <p className="text-xs text-muted-foreground">by @{post.username || post.user?.username}</p>
          </div>

          {/* Reason Selection */}
          <div>
            <Label htmlFor="reason">Reason for reporting *</Label>
            {loadingReasons ? (
              <div className="flex items-center justify-center h-10 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <Select value={reason} onValueChange={setReason} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>{" "}
                <SelectContent>
                  {reasons.map((reasonKey) => {
                    // Ensure reasonKey is a string
                    const key = typeof reasonKey === "string" ? reasonKey : String(reasonKey);
                    return (
                      <SelectItem key={key} value={key}>
                        {REPORT_REASON_LABELS[key] || key}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
            {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
          </div>

          {/* Additional Information */}
          <div>
            <Label htmlFor="additionalInfo">Additional information (Optional)</Label>
            <Textarea
              id="additionalInfo"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Provide more details about why you're reporting this post..."
              className="min-h-[100px] resize-none"
              maxLength={1000}
              disabled={loading}
            />
            <div className="flex justify-between mt-1">
              {errors.additionalInfo && <p className="text-red-500 text-sm">{errors.additionalInfo}</p>}
              <p className="text-xs text-muted-foreground ml-auto">{additionalInfo.length}/1000</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || loadingReasons} className="bg-red-600 hover:bg-red-700">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reporting...
              </>
            ) : (
              <>
                <Flag className="mr-2 h-4 w-4" />
                Report Post
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
