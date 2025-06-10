import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllChallenges, createChallenge, updateChallenge, deleteChallenge, closeChallenge, selectWinners, getChallengeById } from "@/services/challengeService";
import api from "@/api/axiosInstance";
import { format } from "date-fns"; // For date formatting
import { cn } from "@/lib/utils"; // For className utilities

export default function AdminChallenges() {
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

  const [selectedWinners, setSelectedWinners] = useState([]);
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

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

  const resetForm = useCallback(() => {
    setFormData({ title: "", description: "", deadline: "", badge_img: null });
    setSelectedChallenge(null);
    setSelectedDate(null);
    setSelectedTime("");
    if (badgePreview && badgePreview.startsWith("blob:")) {
      URL.revokeObjectURL(badgePreview);
    }
    setBadgePreview(null);
  }, [badgePreview]);

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllChallenges();
      if (response.data.success) {
        setChallenges(response.data.data);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load challenges",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadChallengeDetail = async (challengeId) => {
    try {
      const response = await getChallengeById(challengeId);
      if (response.data.success) {
        setSelectedChallenge(response.data.data);
        setWinnersModalOpen(true);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load challenge details",
        variant: "destructive",
      });
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, badge_img: file }));

    if (badgePreview && badgePreview.startsWith("blob:")) {
      URL.revokeObjectURL(badgePreview);
    }

    if (file) {
      setBadgePreview(URL.createObjectURL(file));
    } else {
      // If file is deselected in edit mode, revert to original challenge badge
      if (editModalOpen && selectedChallenge?.badge_img) {
        setBadgePreview(getFullImageUrl(selectedChallenge.badge_img));
      } else {
        setBadgePreview(null);
      }
    }
  };

  const handleCreateChallenge = async () => {
    if (!formData.title || !formData.description || !formData.deadline) {
      toast({
        title: "Error",
        description: "Please fill all required fields (Title, Description, Deadline Date & Time)",
        variant: "destructive",
      });
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

      if (formData.badge_img) {
        submitData.append("badge_img", formData.badge_img);
      }

      const response = await createChallenge(submitData);

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Challenge created successfully",
        });
        setCreateModalOpen(false);
        // resetForm(); // Called by onOpenChange
        fetchChallenges();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create challenge",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditChallenge = async () => {
    if (!formData.title || !formData.description || !formData.deadline) {
      toast({
        title: "Error",
        description: "Please fill all required fields (Title, Description, Deadline Date & Time)",
        variant: "destructive",
      });
      return;
    }
    try {
      setSubmitting(true);
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("deadline", formData.deadline);

      if (formData.badge_img instanceof File) {
        submitData.append("badge_img", formData.badge_img);
      }

      const response = await updateChallenge(selectedChallenge.id, submitData);

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Challenge updated successfully",
        });
        setEditModalOpen(false);
        // resetForm(); // Called by onOpenChange
        fetchChallenges();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update challenge",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseChallenge = async (challengeId) => {
    // ... (no changes needed here)
    try {
      await closeChallenge(challengeId);
      toast({
        title: "Success",
        description: "Challenge closed successfully",
      });
      fetchChallenges();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to close challenge",
        variant: "destructive",
      });
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    // ... (no changes needed here)
    if (!confirm("Are you sure you want to delete this challenge?")) return;

    try {
      await deleteChallenge(challengeId);
      toast({
        title: "Success",
        description: "Challenge deleted successfully",
      });
      fetchChallenges();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete challenge",
        variant: "destructive",
      });
    }
  };

  const handleSelectWinners = async () => {
    // ... (no changes needed here)
    if (selectedWinners.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one winner",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await selectWinners(selectedChallenge.id, selectedWinners, adminNote || "Congratulations!");

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Awarded badges to ${selectedWinners.length} winners`,
        });
        setWinnersModalOpen(false);
        setSelectedWinners([]);
        setAdminNote("");
        fetchChallenges();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to select winners",
        variant: "destructive",
      });
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

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  // Cleanup effect for blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (badgePreview && badgePreview.startsWith("blob:")) {
        URL.revokeObjectURL(badgePreview);
      }
    };
  }, [badgePreview]);

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
      </div>

      <div>
        <Label htmlFor={isEdit ? "edit_badge_img" : "badge_img"}>{isEdit ? "Update Badge Image" : "Badge Image"}</Label>
        <Input id={isEdit ? "edit_badge_img" : "badge_img"} type="file" accept="image/*" onChange={handleFileChange} />
        <p className="text-xs text-muted-foreground mt-1">
          {isEdit ? "Leave empty to keep current badge image. " : ""}
          PNG, JPG, GIF - max 5MB.
        </p>
        <div className="mt-2 w-32 h-32 border rounded-md flex items-center justify-center bg-muted overflow-hidden">
          {badgePreview ? <img src={badgePreview} alt="Badge Preview" className="w-full h-full object-cover" /> : <Upload className="w-10 h-10 text-muted-foreground" />}
        </div>
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
        {challenges.map((challenge) => (
          <ChallengeManagementCard
            key={challenge.id}
            challenge={challenge}
            onEdit={openEditModal}
            onDelete={handleDeleteChallenge}
            onClose={handleCloseChallenge}
            onSelectWinners={loadChallengeDetail}
            getFullImageUrl={getFullImageUrl}
            formatDate={formatDateDisplay}
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
      </Dialog>

      {/* Winners Selection Modal */}
      <Dialog open={winnersModalOpen} onOpenChange={setWinnersModalOpen}>
        {/* ... (Winner Modal Content - No changes needed based on request) ... */}
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Winners</DialogTitle>
            <DialogDescription>Choose winners for "{selectedChallenge?.title}"</DialogDescription>
          </DialogHeader>

          {selectedChallenge && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin_note">Admin Note</Label>
                <Textarea id="admin_note" value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Congratulations message for winners" rows={2} />
              </div>

              <div>
                <Label>Select Winners from Submissions:</Label>
                {selectedChallenge.challengePosts?.length > 0 ? (
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border p-2 rounded-md">
                    {selectedChallenge.challengePosts?.map((submission) => (
                      <div key={submission.id} className="flex items-center space-x-3 p-2 rounded hover:bg-muted">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-primary"
                          checked={selectedWinners.includes(submission.user_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedWinners((prev) => [...prev, submission.user_id]);
                            } else {
                              setSelectedWinners((prev) => prev.filter((id) => id !== submission.user_id));
                            }
                          }}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getFullImageUrl(submission.post?.user?.profile?.avatar)} />
                          <AvatarFallback>{submission.post?.user?.firstName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{submission.post?.user?.profile?.username || "Unknown User"}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{submission.post?.title || "Untitled Post"}</p>
                        </div>
                        {submission.post?.images?.[0] && (
                          <img
                            src={getFullImageUrl(submission.post.images[0].image_url || submission.post.images[0])} // Adjust if image_url is nested
                            alt={submission.post.title || "Submission image"}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">No submissions for this challenge yet.</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setWinnersModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSelectWinners} disabled={submitting || selectedWinners.length === 0}>
              {submitting ? "Selecting..." : `Select ${selectedWinners.length} Winner(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Challenge Management Card Component
function ChallengeManagementCard({ challenge, onEdit, onDelete, onClose, onSelectWinners, getFullImageUrl, formatDate }) {
  // ... (ChallengeManagementCard - no changes needed based on request) ...
  const isActive = !challenge.is_closed && new Date(challenge.deadline) > new Date();
  const submissionCount = challenge.challengePosts?.length || 0;
  const winnersCount = challenge.userBadges?.length || 0;

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
              {!isActive && submissionCount > 0 && winnersCount === 0 && (
                <DropdownMenuItem onClick={() => onSelectWinners(challenge.id)}>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> {/* Changed icon for clarity */}
                  Select Winners
                </DropdownMenuItem>
              )}
              {!isActive &&
                submissionCount > 0 &&
                winnersCount > 0 && ( // Option to re-select winners
                  <DropdownMenuItem onClick={() => onSelectWinners(challenge.id)}>
                    <Crown className="h-4 w-4 mr-2" />
                    View/Re-select Winners
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

      {submissionCount > 0 && (
        <CardContent>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Recent Submissions ({submissionCount})</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {challenge.challengePosts?.slice(0, 6).map((submission) => (
                <div key={submission.id} className="flex-shrink-0 group">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-muted relative">
                    {submission.post?.images?.[0] && (
                      <img
                        src={getFullImageUrl(submission.post.images[0].image_url || submission.post.images[0])} // Adjust if image_url is nested
                        alt={submission.post.title || "Submission"}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {/* You could add an overlay on hover here if needed */}
                  </div>
                  <p className="text-xs text-center mt-1 truncate w-16 group-hover:underline">{submission.post?.user?.profile?.username || "User"}</p>
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
