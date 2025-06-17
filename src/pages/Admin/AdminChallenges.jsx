import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; // Assuming you have this from shadcn/ui
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Trophy,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Crown,
  Users,
  Calendar as CalendarIcon, // Renamed to avoid conflict
  Clock,
  X,
  Upload,
  CheckCircle2,
  Crop,
  Eye,
  Heart,
  Medal,
  Award,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { getAllChallenges, createChallenge, updateChallenge, deleteChallenge, closeChallenge, selectWinners, autoSelectWinners, getChallengeById } from "@/services/challengeService";
import api from "@/api/axiosInstance";
import { format } from "date-fns"; // For date formatting
import { cn } from "@/lib/utils"; // For className utilities
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { CommentModal } from "@/components/CommentModal";

export default function AdminChallenges() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [winnersModalOpen, setWinnersModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "", // Stores YYYY-MM-DDTHH:mm
    badge_img: null,
  });

  // State for Date/Time Picker
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(""); // Stores HH:mm
  // State for Image Preview
  const [badgePreview, setBadgePreview] = useState(null);

  // State for Image Cropping
  const [imgSrcForCrop, setImgSrcForCrop] = useState("");
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const [croppedBadgeFile, setCroppedBadgeFile] = useState(null);
  const imgRef = useRef(null);
  const hiddenFileInputRef = useRef(null);
  const [selectedWinners, setSelectedWinners] = useState([]);
  const [selectedWinnersWithRank, setSelectedWinnersWithRank] = useState({}); // { userId: rank }
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectionMode, setSelectionMode] = useState("manual"); // "manual" or "auto"
  const [maxWinners, setMaxWinners] = useState(3);
  const [existingWinners, setExistingWinners] = useState([]);
  const [viewWinnersModalOpen, setViewWinnersModalOpen] = useState(false);
  // CommentModal state
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedPostForComment, setSelectedPostForComment] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Removed useToast hook since we're using sonner toast directly

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null; // Return null if no path for preview logic
    if (imagePath.startsWith("http") || imagePath.startsWith("blob:")) return imagePath;

    const baseURL = api.defaults.baseURL || window.location.origin;
    const cleanPath = imagePath.replace(/\\/g, "/");

    if (cleanPath.startsWith("/")) {
      return baseURL + cleanPath;
    }
    return `${baseURL}/${cleanPath}`;
  };

  // --- Helper: Generate Cropped Image Blob (from EditProfile.jsx) ---
  async function getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = Math.floor(crop.width * scaleX);
    canvas.height = Math.floor(crop.height * scaleY);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;
    ctx.save();
    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, image.naturalWidth, image.naturalHeight);
    ctx.restore();
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"));
            return;
          }
          blob.name = fileName;
          resolve(blob);
        },
        "image/png",
        1
      );
    });
  }

  const resetForm = useCallback(() => {
    setFormData({ title: "", description: "", deadline: "", badge_img: null });
    setSelectedChallenge(null);
    setSelectedDate(null);
    setSelectedTime("");
    if (badgePreview && badgePreview.startsWith("blob:")) {
      URL.revokeObjectURL(badgePreview);
    }
    setBadgePreview(null);

    // Reset cropping state
    if (imgSrcForCrop && imgSrcForCrop.startsWith("blob:")) {
      URL.revokeObjectURL(imgSrcForCrop);
    }
    setImgSrcForCrop("");
    setCrop(undefined);
    setCompletedCrop(undefined);
    setIsCropModalOpen(false);
    setOriginalFile(null);
    setCroppedBadgeFile(null);
  }, [badgePreview, imgSrcForCrop]);
  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllChallenges();
      if (response.data.success) {
        setChallenges(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to load challenges");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || (err.response?.data?.errors && typeof err.response.data.errors === "object" ? Object.values(err.response.data.errors).flat().join(", ") : "Failed to load challenges");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadChallengeDetail = async (challengeId) => {
    try {
      const response = await getChallengeById(challengeId);
      if (response.data.success) {
        setSelectedChallenge(response.data.data);
        setWinnersModalOpen(true);
      }
    } catch (err) {
      toast.error("Failed to load challenge details");
    }
  };

  // Update formData.deadline when selectedDate or selectedTime changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const datePart = format(selectedDate, "yyyy-MM-dd");
      setFormData((prev) => ({ ...prev, deadline: `${datePart}T${selectedTime}` }));
    } else if (selectedDate && !selectedTime) {
      // If only date is picked, maybe default time or clear deadline
      const datePart = format(selectedDate, "yyyy-MM-dd");
      // Let's assume time needs to be set, or provide a default like 00:00
      // For now, if time is not set, deadline in formData might be incomplete or cleared
      // setFormData(prev => ({ ...prev, deadline: `${datePart}T00:00` }));
    }
  }, [selectedDate, selectedTime]);
  // --- Badge Image File Input Handler (adapted from EditProfile.jsx) ---
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("File must be an image.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB.");
        return;
      }
      setCrop(undefined);
      setCompletedCrop(undefined);
      setOriginalFile(file);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgSrcForCrop(reader.result?.toString() || "");
        setIsCropModalOpen(true);
      });
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  // Cropper Modal: Center crop (from EditProfile.jsx)
  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    setCrop({ unit: "%", width: 90, aspect: 1, x: 5, y: 5 });
  }
  // Cropper Modal: Handle crop (from EditProfile.jsx)
  const handleCropImage = async () => {
    const image = imgRef.current;
    if (!image || !completedCrop || !originalFile) {
      toast.error("Could not crop image.");
      return;
    }
    try {
      const croppedBlob = await getCroppedImg(image, completedCrop, originalFile.name);
      const croppedFile = new File([croppedBlob], originalFile.name, { type: croppedBlob.type });
      setCroppedBadgeFile(croppedFile);
      const previewUrl = URL.createObjectURL(croppedBlob);
      setBadgePreview(previewUrl);
      setFormData((prev) => ({ ...prev, badge_img: croppedFile }));
      setIsCropModalOpen(false);
      // Clean up previous preview if it was a blob
      if (badgePreview && typeof badgePreview === "string" && badgePreview.startsWith("blob:")) {
        URL.revokeObjectURL(badgePreview);
      }
    } catch (e) {
      toast.error("Failed to crop image.");
    }
  };
  const handleCreateChallenge = async () => {
    if (!formData.title || !formData.description || !formData.deadline) {
      toast.error("Please fill all required fields (Title, Description, Deadline Date & Time)");
      return;
    }
    if (formData.deadline && formData.deadline.split("T")[1] === "00:00" && !selectedTime) {
      // If time is still default and not explicitly set by user, prompt
      if (!confirm("Deadline time is set to 00:00. Is this correct?")) return;
    }

    try {
      setSubmitting(true);
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("deadline", formData.deadline); // Already in YYYY-MM-DDTHH:mm

      if (croppedBadgeFile) {
        submitData.append("badge_img", croppedBadgeFile);
      }
      const response = await createChallenge(submitData);

      if (response.data.success) {
        toast.success("Challenge created successfully");
        setCreateModalOpen(false);
        // resetForm(); // Called by onOpenChange
        fetchChallenges();
      } else {
        // Handle validation errors from backend
        if (response.data.message === "Deadline must be in the future") {
          toast.error("Deadline must be in the future. Please select a valid date and time.");
        } else {
          const errorMessage = response.data.errors && typeof response.data.errors === "object" ? Object.values(response.data.errors).flat().join(", ") : response.data.message || "Failed to create challenge";
          toast.error(errorMessage);
        }
        // Ensure submitting state is reset and modal stays open on error
        setSubmitting(false);
        return;
      }
    } catch (err) {
      // Handle network errors or unexpected responses

      // Check for specific "deadline in the future" error in catch block too
      if (err.response?.data?.message === "Deadline must be in the future") {
        toast.error("Deadline must be in the future. Please select a valid date and time.");
      } else {
        const errorMessage = err.response?.data?.message || (err.response?.data?.errors && typeof err.response.data.errors === "object" ? Object.values(err.response.data.errors).flat().join(", ") : "Failed to create challenge");
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };
  const handleEditChallenge = async () => {
    if (!formData.title || !formData.description || !formData.deadline) {
      toast.error("Please fill all required fields (Title, Description, Deadline Date & Time)");
      return;
    }
    try {
      setSubmitting(true);
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("deadline", formData.deadline);
      if (croppedBadgeFile instanceof File) {
        submitData.append("badge_img", croppedBadgeFile);
      }
      const response = await updateChallenge(selectedChallenge.id, submitData);

      if (response.data.success) {
        toast.success("Challenge updated successfully");
        setEditModalOpen(false);
        // resetForm(); // Called by onOpenChange
        fetchChallenges();
      } else {
        // Handle validation errors from backend
        const errorMessage = response.data.errors && typeof response.data.errors === "object" ? Object.values(response.data.errors).flat().join(", ") : response.data.message || "Failed to update challenge";
        toast.error(errorMessage);
      }
    } catch (err) {
      // Handle network errors or unexpected responses
      const errorMessage = err.response?.data?.message || (err.response?.data?.errors && typeof err.response.data.errors === "object" ? Object.values(err.response.data.errors).flat().join(", ") : "Failed to update challenge");
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  const handleCloseChallenge = async (challengeId) => {
    try {
      const response = await closeChallenge(challengeId);
      if (response.data.success) {
        toast.success("Challenge closed successfully");
        fetchChallenges();
      } else {
        toast.error(response.data.message || "Failed to close challenge");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || (err.response?.data?.errors && typeof err.response.data.errors === "object" ? Object.values(err.response.data.errors).flat().join(", ") : "Failed to close challenge");
      toast.error(errorMessage);
    }
  };
  const handleDeleteChallenge = async (challengeId) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    try {
      const response = await deleteChallenge(challengeId);
      if (response.data.success) {
        toast.success("Challenge deleted successfully");
        fetchChallenges();
      } else {
        toast.error(response.data.message || "Failed to delete challenge");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || (err.response?.data?.errors && typeof err.response.data.errors === "object" ? Object.values(err.response.data.errors).flat().join(", ") : "Failed to delete challenge");
      toast.error(errorMessage);
    }
  };
  const handleSelectWinners = async () => {
    if (selectionMode === "manual" && selectedWinners.length === 0) {
      toast.error("Please select at least one winner");
      return;
    }

    if (selectionMode === "manual" && selectedWinners.length > 3) {
      toast.error("You can only select maximum 3 winners");
      return;
    }

    if (selectionMode === "auto" && (!maxWinners || maxWinners < 1)) {
      toast.error("Please specify a valid number of winners (minimum 1)");
      return;
    }

    if (selectionMode === "auto" && maxWinners > 3) {
      toast.error("Maximum 3 winners allowed");
      return;
    }

    // For manual selection, check if all selected users have ranks assigned
    if (selectionMode === "manual") {
      const unrankedUsers = selectedWinners.filter((userId) => !selectedWinnersWithRank[userId]);
      if (unrankedUsers.length > 0) {
        toast.error("Please assign ranks to all selected winners");
        return;
      }

      // Check for duplicate ranks
      const ranks = Object.values(selectedWinnersWithRank);
      const uniqueRanks = [...new Set(ranks)];
      if (ranks.length !== uniqueRanks.length) {
        toast.error("Each winner must have a unique rank");
        return;
      }
    }

    try {
      setSubmitting(true);
      let response;

      if (selectionMode === "manual") {
        // Manual selection - create winnersData array with userId, postId, and admin-assigned rank
        const winnersData = selectedWinners.map((userId) => {
          // Find the submission for this user
          const submission = selectedChallenge.challengePosts?.find((post) => post.user_id === userId);

          return {
            userId: userId,
            postId: submission?.post_id || submission?.post?.id,
            rank: selectedWinnersWithRank[userId], // Use admin-assigned rank
          };
        });

        response = await selectWinners(selectedChallenge.id, winnersData, adminNote || "Congratulations on winning the challenge!");
      } else {
        // Auto selection based on likes
        response = await autoSelectWinners(selectedChallenge.id, maxWinners, adminNote || "Auto-selected by system based on like count");
      }

      // Handle new API response structure with success/errors
      if (response.data.success) {
        toast.success(selectionMode === "manual" ? `Successfully selected ${selectedWinners.length} winners` : `Successfully auto-selected ${maxWinners} winners`);
        setWinnersModalOpen(false);
        setSelectedWinners([]);
        setSelectedWinnersWithRank({});
        setAdminNote("");
        setSelectionMode("manual");
        setMaxWinners(3);
        fetchChallenges();
      } else {
        // Handle validation errors from backend

        // Check for specific "winners already selected" error
        if (response.data.message === "Winners have already been selected for this challenge") {
          toast.error("Winners have already been selected for this challenge.", {
            duration: 5000,
          });
        } else {
          // Handle other validation errors
          const errorMessage = response.data.errors && typeof response.data.errors === "object" ? Object.values(response.data.errors).flat().join(", ") : response.data.message || "Failed to select winners";
          toast.error(errorMessage);
        }
      }
    } catch (err) {
      // Handle network errors or unexpected responses

      // Check for specific "winners already selected" error
      if (err.response?.status === 400 && err.response?.data?.message === "Winners have already been selected for this challenge") {
        toast.error("Winners have already been selected for this challenge.", {
          duration: 5000,
        });
      } else {
        // Handle other errors
        const errorMessage = err.response?.data?.message || (err.response?.data?.errors && typeof err.response.data.errors === "object" ? Object.values(err.response.data.errors).flat().join(", ") : "Failed to select winners");
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateModal = () => {
    resetForm(); // Ensure form is clean before opening
    setCreateModalOpen(true);
  };
  const openEditModal = (challenge) => {
    resetForm(); // Clean slate
    setSelectedChallenge(challenge);

    const deadlineDateObj = new Date(challenge.deadline);
    const initialDeadlineString = format(deadlineDateObj, "yyyy-MM-dd'T'HH:mm");

    setFormData({
      title: challenge.title,
      description: challenge.description,
      deadline: initialDeadlineString,
      badge_img: null, // Reset file input, preview will show current
    });

    setSelectedDate(deadlineDateObj);
    setSelectedTime(format(deadlineDateObj, "HH:mm"));

    if (challenge.badge_img) {
      setBadgePreview(getFullImageUrl(challenge.badge_img));
    } else {
      setBadgePreview(null);
    }
    setEditModalOpen(true);
  };

  // Handler for opening comment modal
  const handleOpenCommentModal = (post) => {
    setSelectedPostForComment(post);
    setCommentModalOpen(true);
  };
  // Handler for closing comment modal
  const handleCloseCommentModal = () => {
    setCommentModalOpen(false);
    setSelectedPostForComment(null);
  }; // Handler for viewing existing winners
  const handleViewWinners = async (challengeId) => {
    try {
      setLoading(true);
      const [challengeResponse, winnersResponse] = await Promise.all([getChallengeById(challengeId), api.get(`/challenges/${challengeId}/winners`)]);

      if (challengeResponse.data.success && winnersResponse.data.success) {
        setSelectedChallenge(challengeResponse.data.data);
        setExistingWinners(winnersResponse.data.data);
        setViewWinnersModalOpen(true);
      } else {
        toast.error("Failed to load challenge or winners data");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || (err.response?.data?.errors && typeof err.response.data.errors === "object" ? Object.values(err.response.data.errors).flat().join(", ") : "Failed to load winners");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Get current user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        setCurrentUser(null);
      }
    }
  }, []);
  // Cleanup effect for blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (badgePreview && typeof badgePreview === "string" && badgePreview.startsWith("blob:")) {
        URL.revokeObjectURL(badgePreview);
      }
      if (imgSrcForCrop && typeof imgSrcForCrop === "string" && imgSrcForCrop.startsWith("blob:")) {
        URL.revokeObjectURL(imgSrcForCrop);
      }
    };
  }, [badgePreview, imgSrcForCrop]);

  if (loading) {
    // ... (skeleton loading state - no changes)
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const commonFormFields = (isEdit = false) => (
    <>
      <div>
        <Label htmlFor={isEdit ? "edit_title" : "title"}>Title *</Label>
        <Input id={isEdit ? "edit_title" : "title"} value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} placeholder="Challenge title" />
      </div>
      <div>
        <Label htmlFor={isEdit ? "edit_description" : "description"}>Description *</Label>
        <Textarea
          id={isEdit ? "edit_description" : "description"}
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Challenge description and guidelines"
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor={isEdit ? "edit_deadline_date" : "deadline_date"}>Deadline *</Label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className={cn("w-[200px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  if (!selectedTime && date) setSelectedTime("00:00"); // Default time if none selected
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Input id={isEdit ? "edit_deadline_time" : "deadline_time"} type="time" className="w-[120px]" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
        </div>
        {formData.deadline && <p className="text-xs text-muted-foreground mt-1">Selected: {formatDateDisplay(formData.deadline)}</p>}
      </div>{" "}
      <div>
        <Label>{isEdit ? "Update Badge Image" : "Badge Image"}</Label>
        <div className="flex items-center gap-4 mt-2">
          <div className="w-20 h-20 border rounded-md flex items-center justify-center bg-muted overflow-hidden">
            {typeof badgePreview === "string" && badgePreview ? (
              <img
                src={badgePreview}
                alt="Badge Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  setBadgePreview(null);
                }}
              />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => hiddenFileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            {isEdit ? "Change Badge" : "Upload Badge"}
          </Button>
          <input ref={hiddenFileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {isEdit ? "Leave empty to keep current badge image. " : ""}
          PNG, JPG, GIF - max 5MB. Image will be cropped to square format.
        </p>
      </div>
    </>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Trophy className="h-6 w-6 text-primary mr-2" />
                Manage Challenges
              </CardTitle>
              <CardDescription>Create and manage weekly challenges for artists</CardDescription>
            </div>
            <Dialog
              open={createModalOpen}
              onOpenChange={(isOpen) => {
                setCreateModalOpen(isOpen);
                if (!isOpen) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={openCreateModal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Challenge
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Challenge</DialogTitle>
                  <DialogDescription>Create a new weekly challenge for artists to participate in</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">{commonFormFields(false)}</div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateChallenge} disabled={submitting}>
                    {submitting ? "Creating..." : "Create Challenge"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>
      {/* Challenges List */}
      <div className="grid gap-6">
        {" "}
        {challenges.map((challenge) => (
          <ChallengeManagementCard
            key={challenge.id}
            challenge={challenge}
            onEdit={openEditModal}
            onDelete={handleDeleteChallenge}
            onClose={handleCloseChallenge}
            onSelectWinners={loadChallengeDetail}
            onViewWinners={handleViewWinners}
            onOpenCommentModal={handleOpenCommentModal}
            getFullImageUrl={getFullImageUrl}
            formatDate={formatDateDisplay}
            navigate={navigate}
          />
        ))}
      </div>
      {/* Edit Modal */}
      <Dialog
        open={editModalOpen}
        onOpenChange={(isOpen) => {
          setEditModalOpen(isOpen);
          if (!isOpen) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Challenge</DialogTitle>
            <DialogDescription>Update challenge information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">{selectedChallenge && commonFormFields(true)}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditChallenge} disabled={submitting}>
              {submitting ? "Updating..." : "Update Challenge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>{" "}
      {/* Winners Selection Modal */}
      <Dialog open={winnersModalOpen} onOpenChange={setWinnersModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Winners</DialogTitle>
            <DialogDescription>Choose winners for "{selectedChallenge?.title}"</DialogDescription>
          </DialogHeader>

          {selectedChallenge && (
            <div className="space-y-6">
              {selectionMode === "manual" && (
                <div>
                  <Label htmlFor="admin_note">Admin Note</Label>
                  <Textarea id="admin_note" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Congratulations message for winners" rows={2} />
                </div>
              )}{" "}
              {/* Selection Mode Tabs */}
              <Tabs value={selectionMode} onValueChange={setSelectionMode}>
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 gap-1">
                  <TabsTrigger value="manual" className="text-xs sm:text-sm px-2 sm:px-3">
                    Manual Selection
                  </TabsTrigger>
                  <TabsTrigger value="auto" className="text-xs sm:text-sm px-2 sm:px-3">
                    Auto Selection
                  </TabsTrigger>
                </TabsList>{" "}
                <TabsContent value="manual" className="space-y-4">
                  <div>
                    <Label>Select Winners from Submissions:</Label>
                    {selectedChallenge.challengePosts?.length > 0 ? (
                      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border p-2 rounded-md">
                        {selectedChallenge.challengePosts
                          ?.sort((a, b) => (b.post?.likeCount || b.post?.likes_count || 0) - (a.post?.likeCount || a.post?.likes_count || 0))
                          ?.map((submission, index) => (
                            <div key={submission.id} className="flex items-center space-x-3 p-2 rounded hover:bg-muted">
                              {" "}
                              <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-primary"
                                checked={selectedWinners.includes(submission.user_id)}
                                disabled={!selectedWinners.includes(submission.user_id) && selectedWinners.length >= 3}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    if (selectedWinners.length >= 3) {
                                      toast.error("Maximum 3 winners allowed");
                                      return;
                                    }
                                    setSelectedWinners((prev) => [...prev, submission.user_id]);
                                  } else {
                                    setSelectedWinners((prev) => prev.filter((id) => id !== submission.user_id));
                                    // Remove rank assignment when unchecked
                                    setSelectedWinnersWithRank((prev) => {
                                      const newRanks = { ...prev };
                                      delete newRanks[submission.user_id];
                                      return newRanks;
                                    });
                                  }
                                }}
                              />
                              {/* Rank Selection for Selected Users */}
                              {selectedWinners.includes(submission.user_id) ? (
                                <div className="flex items-center justify-center w-16 h-8 bg-primary/10 border-2 border-primary/30 rounded-md">
                                  {" "}
                                  <select
                                    className="w-full h-full text-xs font-medium bg-transparent border-none outline-none text-center"
                                    value={selectedWinnersWithRank[submission.user_id] || ""}
                                    onChange={(e) => {
                                      const rank = parseInt(e.target.value);
                                      setSelectedWinnersWithRank((prev) => ({
                                        ...prev,
                                        [submission.user_id]: rank,
                                      }));
                                    }}
                                  >
                                    <option value="">Rank</option>
                                    {[1, 2, 3].map((rank) => (
                                      <option key={rank} value={rank}>
                                        #{rank}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center w-16 h-8 bg-muted rounded-md text-xs font-medium text-muted-foreground">#{index + 1}</div>
                              )}
                              <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => submission.post?.user?.id && navigate(`/profile/${submission.post.user.id}`)}>
                                <AvatarImage src={getFullImageUrl(submission.post?.user?.profile?.avatar)} />
                                <AvatarFallback>{submission.post?.user?.firstName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => submission.post?.user?.id && navigate(`/profile/${submission.post.user.id}`)}>
                                  {submission.post?.user?.profile?.username || "Unknown User"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{submission.post?.title || "Untitled Post"}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <div className="flex items-center gap-1">
                                    <Heart className="h-3 w-3 text-red-500" />
                                    <span className="text-xs text-muted-foreground">{submission.post?.likeCount || submission.post?.likes_count || 0} likes</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleOpenCommentModal(submission.post)} className="h-7 px-2">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                                {submission.post?.images?.[0] && (
                                  <img
                                    src={getFullImageUrl(submission.post.images[0].image_url || submission.post.images[0])}
                                    alt={submission.post.title || "Submission image"}
                                    className="w-12 h-12 rounded object-cover cursor-pointer"
                                    onClick={() => handleOpenCommentModal(submission.post)}
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">No submissions for this challenge yet.</p>
                    )}
                    {/* Selected Winners Summary */}
                    {selectedWinners.length > 0 && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-md">
                        <Label className="text-sm font-medium">Selected Winners Summary ({selectedWinners.length}/3):</Label>
                        <div className="mt-2 space-y-1">
                          {selectedWinners.map((userId) => {
                            const submission = selectedChallenge.challengePosts?.find((post) => post.user_id === userId);
                            const rank = selectedWinnersWithRank[userId];
                            return (
                              <div key={userId} className="flex items-center justify-between text-xs">
                                <span>{submission?.post?.user?.profile?.username || "Unknown User"}</span>
                                <span className={`font-medium ${rank ? "text-primary" : "text-destructive"}`}>{rank ? `Rank #${rank}` : "No rank assigned"}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="auto" className="space-y-4">
                  {" "}
                  <div>
                    <Label htmlFor="max_winners">Number of Winners</Label>
                    <Input id="max_winners" type="number" min="1" max="3" value={maxWinners} onChange={(e) => setMaxWinners(Math.min(3, parseInt(e.target.value) || 1))} className="w-32 mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">System will automatically select winners based on highest like count (max 3)</p>
                  </div>
                  {selectedChallenge.challengePosts?.length > 0 && (
                    <div>
                      <Label>Preview Top Posts (sorted by likes):</Label>
                      <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border p-2 rounded-md bg-muted/30">
                        {selectedChallenge.challengePosts
                          ?.sort((a, b) => (b.post?.likeCount || b.post?.likes_count || 0) - (a.post?.likeCount || a.post?.likes_count || 0))
                          ?.slice(0, maxWinners)
                          ?.map((submission, index) => (
                            <div key={submission.id} className="flex items-center space-x-3 p-2 rounded bg-background">
                              {" "}
                              <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full text-xs font-bold">#{index + 1}</div>
                              <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => submission.post?.user?.id && navigate(`/profile/${submission.post.user.id}`)}>
                                <AvatarImage src={getFullImageUrl(submission.post?.user?.profile?.avatar)} />
                                <AvatarFallback>{submission.post?.user?.firstName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-sm font-medium cursor-pointer hover:text-primary transition-colors" onClick={() => submission.post?.user?.id && navigate(`/profile/${submission.post.user.id}`)}>
                                  {submission.post?.user?.profile?.username || "Unknown User"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{submission.post?.title || "Untitled Post"}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Heart className="h-3 w-3 text-red-500" />
                                  <span className="text-xs font-medium">{submission.post?.likeCount || submission.post?.likes_count || 0} likes</span>
                                </div>
                              </div>
                              {submission.post?.images?.[0] && (
                                <img src={getFullImageUrl(submission.post.images[0].image_url || submission.post.images[0])} alt={submission.post.title || "Submission image"} className="w-12 h-12 rounded object-cover" />
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setWinnersModalOpen(false)}>
              Cancel
            </Button>{" "}
            <Button onClick={handleSelectWinners} disabled={submitting || (selectionMode === "manual" && (selectedWinners.length === 0 || selectedWinners.length > 3 || selectedWinners.some((userId) => !selectedWinnersWithRank[userId])))}>
              {submitting ? "Selecting..." : selectionMode === "manual" ? `Select ${selectedWinners.length} Winner(s) (max 3)` : `Auto-Select ${maxWinners} Winner(s)`}
            </Button>{" "}
          </DialogFooter>
        </DialogContent>
      </Dialog>{" "}
      {/* View Existing Winners Modal */}
      <Dialog open={viewWinnersModalOpen} onOpenChange={setViewWinnersModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Challenge Winners</DialogTitle>
            <DialogDescription>Winners for "{selectedChallenge?.title}"</DialogDescription>
          </DialogHeader>

          {existingWinners.length > 0 ? (
            <div className="space-y-4">
              {existingWinners.map((winner, idx) => (
                <Card key={winner.id} className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      <Badge
                        className={`px-2 py-1 ${
                          idx === 0
                            ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                            : idx === 1
                            ? "bg-gray-500/10 text-gray-600 border-gray-500/20"
                            : idx === 2
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        }`}
                      >
                        {idx === 0 ? <Crown className="h-4 w-4 mr-1" /> : idx === 1 ? <Medal className="h-4 w-4 mr-1" /> : idx === 2 ? <Award className="h-4 w-4 mr-1" /> : <Star className="h-4 w-4 mr-1" />}#{idx + 1}
                      </Badge>
                    </div>
                    {/* Badge Image */}
                    {winner.badge_img && (
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img src={getFullImageUrl(winner.badge_img)} alt="Badge" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {/* User Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" onClick={() => winner.user?.id && navigate(`/profile/${winner.user.id}`)}>
                        <AvatarImage src={getFullImageUrl(winner.user?.profile?.avatar)} />
                        <AvatarFallback>{winner.user?.firstName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold cursor-pointer hover:text-primary transition-colors" onClick={() => winner.user?.id && navigate(`/profile/${winner.user.id}`)}>
                          {winner.user?.profile?.username || `${winner.user?.firstName} ${winner.user?.lastName}`.trim() || "Unknown User"}
                        </h4>
                        <div className="space-y-1">
                          {winner.admin_note && (
                            <div className="p-2 bg-muted/50 rounded-md">
                              <p className="text-sm text-muted-foreground">{winner.admin_note}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">{winner.awarded_at && <span>Awarded: {new Date(winner.awarded_at).toLocaleString()}</span>}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Winners Selected</h3>
              <p className="text-muted-foreground">This challenge doesn't have any winners yet.</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewWinnersModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Image Cropping Modal */}
      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Badge Image</DialogTitle>
          </DialogHeader>
          {imgSrcForCrop && (
            <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={1} circularCrop={false}>
              <img ref={imgRef} alt="Crop preview" src={imgSrcForCrop} style={{ transform: `scale(1) rotate(0deg)` }} onLoad={onImageLoad} />
            </ReactCrop>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsCropModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCropImage} disabled={!completedCrop?.width || !completedCrop?.height}>
              <Crop className="mr-2 h-4 w-4" /> Crop & Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>{" "}
      {/* Comment Modal */}
      {selectedPostForComment && (
        <CommentModal
          postId={selectedPostForComment.id}
          isOpen={commentModalOpen}
          onClose={handleCloseCommentModal}
          postTitle={selectedPostForComment.title}
          currentUser={
            currentUser
              ? {
                  id: currentUser.id,
                  username: currentUser.username || `${currentUser.first_name} ${currentUser.last_name}`.trim() || "Admin",
                  avatar: currentUser.avatar,
                  level: currentUser.level || 1,
                }
              : null
          }
          onCommentAdded={() => {}} // No need to refresh anything for admin view
        />
      )}
    </div>
  );
}

// Challenge Management Card Component
function ChallengeManagementCard({ challenge, onEdit, onDelete, onClose, onSelectWinners, onViewWinners, onOpenCommentModal, getFullImageUrl, formatDate, navigate }) {
  // Fix isActive logic: is_closed === 0 means active
  const isActive = !challenge.is_closed && new Date(challenge.deadline) > new Date();
  // Use challenge.challengePosts for submissions
  const submissionCount = Array.isArray(challenge.challengePosts) ? challenge.challengePosts.length : 0;
  // Winners count: if challenge has winners array, use its length, else 0
  const winnersCount = Array.isArray(challenge.winners) ? challenge.winners.length : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              {isActive ? <Badge className="bg-green-500/10 text-green-600 border border-green-500/30">Active</Badge> : <Badge variant="outline">Closed</Badge>}
            </div>
            <CardDescription className="text-sm mb-3 whitespace-pre-line">{challenge.description}</CardDescription>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Deadline: {formatDate(challenge.deadline)}
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {submissionCount} submission{submissionCount !== 1 ? "s" : ""}
              </div>
              {winnersCount > 0 && (
                <div className="flex items-center">
                  <Crown className="h-4 w-4 mr-1" />
                  {winnersCount} winner{winnersCount !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>

          {challenge.badge_img && (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted ml-4 flex-shrink-0">
              <img src={getFullImageUrl(challenge.badge_img)} alt="Badge" className="w-full h-full object-cover" />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(challenge)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {isActive && (
                <DropdownMenuItem onClick={() => onClose(challenge.id)}>
                  <X className="h-4 w-4 mr-2" />
                  Close Challenge
                </DropdownMenuItem>
              )}
              {!isActive && submissionCount > 0 && (
                <DropdownMenuItem onClick={() => onSelectWinners(challenge.id)}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Select Winners
                </DropdownMenuItem>
              )}{" "}
              {!isActive && submissionCount > 0 && (
                <DropdownMenuItem onClick={() => onViewWinners(challenge.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Winners
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(challenge.id)} className="text-red-600 focus:text-red-600 focus:bg-red-500/10">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Submissions Preview */}
      {submissionCount > 0 && (
        <CardContent>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Recent Submissions ({submissionCount})</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {challenge.challengePosts.slice(0, 6).map((submission) => (
                <div key={submission.id} className="flex-shrink-0 group cursor-pointer" onClick={() => onOpenCommentModal(submission.post)}>
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-muted relative hover:ring-2 hover:ring-primary transition-all">
                    {submission.post?.images?.[0] && <img src={getFullImageUrl(submission.post.images[0].image_url || submission.post.images[0])} alt={submission.post.title || "Submission"} className="w-full h-full object-cover" />}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-center mt-1 truncate w-16 group-hover:underline cursor-pointer hover:text-primary transition-colors" onClick={() => submission.post?.user?.id && navigate(`/profile/${submission.post.user.id}`)}>
                    {submission.post?.user?.profile?.username || "User"}
                  </p>
                </div>
              ))}
              {submissionCount > 6 && (
                <div className="flex-shrink-0 w-16 h-16 rounded-md bg-muted/50 flex items-center justify-center border">
                  <span className="text-xs text-muted-foreground">+{submissionCount - 6} more</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
