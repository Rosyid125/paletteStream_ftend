import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Loader2, Trash2, PlusCircle, Upload, Crop, X as XIcon } from "lucide-react";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop"; // Keep imports as they are in user's code
import "react-image-crop/dist/ReactCrop.css"; // Import cropper styles
import api from "../api/axiosInstance";
import { toast } from "sonner";

// --- Helper: Get Storage URL (keep as is) ---
const getFullStorageUrl = (path) => {
  if (!path || typeof path !== "string") return "/placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalizedPath = path.replace(/\\/g, "/");
  let relativePath = normalizedPath;
  if (normalizedPath.startsWith("storage/")) {
    relativePath = normalizedPath;
  } else if (!normalizedPath.startsWith("/api") && !normalizedPath.startsWith("storage/")) {
    relativePath = `/api/${normalizedPath.startsWith("/") ? normalizedPath.slice(1) : normalizedPath}`;
  }
  const baseUrl = api.defaults.baseURL || window.location.origin;
  const separator = baseUrl.endsWith("/") ? "" : "/";
  try {
    const url = new URL(relativePath, baseUrl + separator);
    return url.href;
  } catch (e) {
    console.error("Error constructing image URL:", e);
    return "/placeholder.svg";
  }
};

// --- Helper: Debounce (for canvas preview) ---
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// --- Helper: Generate Cropped Image Blob ---
async function getCroppedImg(image, crop, fileName) {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = Math.floor(crop.width * scaleX);
  canvas.height = Math.floor(crop.height * scaleY);
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

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
          console.error("Canvas is empty");
          reject(new Error("Canvas is empty"));
          return;
        }
        blob.name = fileName; // Add original filename
        resolve(blob);
      },
      "image/png",
      1
    );
  });
}

// --- EditProfile Component ---
export default function EditProfile() {
  const navigate = useNavigate();

  // State for data
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    name: "", // Changed from username
    bio: "",
    location: "",
    platforms: [], // Changed from platform_links
  });

  // State for UI control
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // State for Avatar & Cropping
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [imgSrcForCrop, setImgSrcForCrop] = useState("");
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const [croppedAvatarFile, setCroppedAvatarFile] = useState(null);

  // State for Platform Links input
  const [newLinkInput, setNewLinkInput] = useState("");

  // Refs
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const hiddenFileInputRef = useRef(null);

  // --- Fetch Initial Profile Data ---
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    setValidationErrors({});
    try {
      const response = await api.get("/profiles/profile2");
      if (response.data?.success) {
        const fetchedData = response.data.data;
        setProfileData(fetchedData);
        setFormData({
          name: fetchedData.username || "", // Map username to name
          bio: fetchedData.bio || "",
          location: fetchedData.location || "",
          platforms: Array.isArray(fetchedData.platform_links) ? fetchedData.platform_links : [], // Map platform_links to platforms
        });
        setAvatarPreview(fetchedData.avatar ? getFullStorageUrl(fetchedData.avatar) : null);
      } else {
        setError(response.data?.message || "Failed fetch");
        toast.error(response.data?.message || "Failed fetch");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Fetch error";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // --- Form Input Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) setValidationErrors((prev) => ({ ...prev, [name]: null }));
  };

  // --- Avatar Selection - Step 1: Open Modal ---
  const handleAvatarFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Max size 5MB.");
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
      e.target.value = ""; // Clear input value
    }
  };

  // --- Cropper Modal: Center crop on image load ---
  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: "%", width: 90 }, 1, width, height), width, height));
  }

  // --- Cropper Modal: Handle the actual cropping ---
  const handleCropImage = async () => {
    const image = imgRef.current;
    if (!image || !completedCrop || !originalFile) {
      toast.error("Could not crop image.");
      return;
    }
    try {
      const croppedBlob = await getCroppedImg(image, completedCrop, originalFile.name);
      const croppedFile = new File([croppedBlob], originalFile.name, { type: croppedBlob.type, lastModified: Date.now() });
      setCroppedAvatarFile(croppedFile);
      const previewUrl = URL.createObjectURL(croppedBlob);
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(previewUrl);
      if (imgSrcForCrop.startsWith("blob:")) {
        URL.revokeObjectURL(imgSrcForCrop);
      }
      setImgSrcForCrop("");
      setIsCropModalOpen(false);
      toast.success("Avatar cropped!");
    } catch (e) {
      console.error("Cropping failed:", e);
      toast.error("Failed to crop image.");
    }
  };

  // --- Cropper Modal: Debounced Canvas Preview Update ---
  const debouncedUpdatePreview = debounce(async () => {
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!completedCrop || !previewCanvas || !image) return;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = previewCanvas.getContext("2d");
    if (!ctx) return;
    const pixelRatio = window.devicePixelRatio;
    previewCanvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
    previewCanvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, completedCrop.x * scaleX, completedCrop.y * scaleY, completedCrop.width * scaleX, completedCrop.height * scaleY, 0, 0, completedCrop.width * scaleX, completedCrop.height * scaleY);
  }, 100);

  useEffect(() => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
      debouncedUpdatePreview();
    }
  }, [completedCrop, debouncedUpdatePreview]);

  // Cleanup object URL for avatar preview
  useEffect(() => {
    let currentPreview = avatarPreview;
    const isObjectURL = typeof currentPreview === "string" && currentPreview.startsWith("blob:");
    return () => {
      if (isObjectURL) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [avatarPreview]);

  // --- Platform Link Handlers ---
  const handleAddLink = () => {
    const trimmedLink = newLinkInput.trim();
    if (trimmedLink) {
      try {
        new URL(trimmedLink); // Basic validation
        setFormData((prev) => ({ ...prev, platforms: [...prev.platforms, trimmedLink] }));
        setNewLinkInput("");
      } catch (_) {
        toast.error("Please enter a valid URL");
      }
    }
  };

  const handleRemoveLink = (indexToRemove) => {
    setFormData((prev) => ({ ...prev, platforms: prev.platforms.filter((_, index) => index !== indexToRemove) }));
  };

  // --- Form Submission (Aligned with Backend - FIXED PLATFORMS) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setValidationErrors({});

    let errors = {};
    if (!formData.name.trim()) errors.name = "Username cannot be empty."; // Check 'name' now
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setSaving(false);
      toast.error("Please fix form errors.");
      return;
    }

    const dataToSubmit = new FormData();
    // Append fields matching backend: name, bio, location, platforms, avatar
    dataToSubmit.append("name", formData.name.trim());
    dataToSubmit.append("bio", formData.bio.trim());
    dataToSubmit.append("location", formData.location.trim());

    // --- *** CORRECTED PLATFORM LINKS APPENDING *** ---
    // Append each platform link individually with the 'platforms[]' key name.
    if (formData.platforms && formData.platforms.length > 0) {
      formData.platforms.forEach((link) => {
        dataToSubmit.append("platforms[]", link); // Key name 'platforms[]'
      });
    }
    // If the array is empty, do not append anything for 'platforms[]'.
    // The backend should be prepared to handle the absence of this field
    // or receive an empty array if explicitly needed (less common with FormData).
    // --- *** END CORRECTION *** ---

    // Append the *cropped* avatar file if it exists
    if (croppedAvatarFile) {
      dataToSubmit.append("avatar", croppedAvatarFile); // Key matches backend upload.single('avatar')
    }

    // Log FormData content for debugging (optional)
    console.log("--- FormData to be sent ---");
    for (let [key, value] of dataToSubmit.entries()) {
      console.log(`${key}:`, value);
    }
    console.log("---------------------------");

    try {
      // Use PUT for update as per REST conventions, ensure API route matches
      const response = await api.put("/profiles/update", dataToSubmit);
      // Note: Axios sets Content-Type to multipart/form-data automatically for FormData

      if (response.data?.success) {
        toast.success("Profile updated successfully!");
        setCroppedAvatarFile(null); // Clear cropped file state
        // Optionally update local storage 'user' data if relevant parts changed
        // Refetch profile or navigate back
        fetchProfile(); // Refetch to show latest data including potentially new avatar URL
        // setTimeout(() => {
        //   if (profileData?.id) navigate(`/profile/${profileData.id}`);
        //   else navigate('/profile');
        // }, 1000);
      } else {
        if (response.data?.errors) {
          setValidationErrors(response.data.errors);
          toast.error("Update failed. Check errors.");
        } else {
          const errorMsg = response.data?.message || "Update failed.";
          setError(errorMsg);
          toast.error(errorMsg);
        }
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      let errorMsg = "Update error.";
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        errorMsg = "Update failed. Check errors.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-3xl">
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <Skeleton className="h-7 w-40" /> <Skeleton className="h-4 w-60" />{" "}
          </CardHeader>{" "}
          <CardContent className="space-y-6">
            {" "}
            <div className="flex items-center space-x-4">
              {" "}
              <Skeleton className="h-24 w-24 rounded-full" /> <Skeleton className="h-10 w-32" />{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <Skeleton className="h-4 w-20" /> <Skeleton className="h-10 w-full" />{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <Skeleton className="h-4 w-20" /> <Skeleton className="h-20 w-full" />{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <Skeleton className="h-4 w-20" /> <Skeleton className="h-10 w-full" />{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <Skeleton className="h-4 w-20" /> <Skeleton className="h-16 w-full" />{" "}
            </div>{" "}
          </CardContent>{" "}
          <CardFooter className="flex justify-end gap-2">
            {" "}
            <Skeleton className="h-10 w-20" /> <Skeleton className="h-10 w-24" />{" "}
          </CardFooter>{" "}
        </Card>
      </div>
    );
  }
  if (error && !profileData) {
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-3xl text-center">
        {" "}
        <p className="text-red-600">Error: {error}</p>{" "}
        <Button onClick={() => fetchProfile()} className="mt-4">
          {" "}
          Retry{" "}
        </Button>{" "}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-3xl">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            {" "}
            <CardTitle>Edit Profile</CardTitle> <CardDescription>Update your public profile information.</CardDescription>{" "}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="space-y-2">
              <Label>Profile Picture (1:1 Recommended)</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border">
                  {" "}
                  <AvatarImage src={avatarPreview || "/placeholder.svg"} alt={formData.name || "User"} /> <AvatarFallback>{formData.name?.charAt(0).toUpperCase() || "?"}</AvatarFallback>{" "}
                </Avatar>
                <Button type="button" variant="outline" size="sm" onClick={() => hiddenFileInputRef.current?.click()}>
                  {" "}
                  <Upload className="mr-2 h-4 w-4" /> Change Avatar{" "}
                </Button>
                <input ref={hiddenFileInputRef} type="file" accept="image/*" onChange={handleAvatarFileSelect} className="hidden" />
              </div>
              {validationErrors.avatar && <p className="text-sm text-red-600 mt-1">{validationErrors.avatar}</p>}
            </div>

            {/* Username -> Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Name / Username</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Your public display name" maxLength={50} className={validationErrors.name ? "border-red-500" : ""} />
              {validationErrors.name && <p className="text-sm text-red-600">{validationErrors.name}</p>}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself" rows={4} maxLength={300} className={validationErrors.bio ? "border-red-500" : ""} />
              {validationErrors.bio && <p className="text-sm text-red-600">{validationErrors.bio}</p>}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., City, Country" maxLength={100} className={validationErrors.location ? "border-red-500" : ""} />
              {validationErrors.location && <p className="text-sm text-red-600">{validationErrors.location}</p>}
            </div>

            {/* Platform Links -> Platforms Field */}
            <div className="space-y-2">
              <Label>Platform Links</Label>
              <div className="space-y-2">
                {formData.platforms.map((link, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={link} readOnly className="flex-1 bg-muted/50" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveLink(index)} aria-label={`Remove link ${link}`}>
                      {" "}
                      <Trash2 className="h-4 w-4 text-red-500" />{" "}
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Input value={newLinkInput} onChange={(e) => setNewLinkInput(e.target.value)} placeholder="Add new link (e.g., https://...)" className="flex-1" />
                <Button type="button" variant="outline" size="icon" onClick={handleAddLink} aria-label="Add link">
                  {" "}
                  <PlusCircle className="h-4 w-4" />{" "}
                </Button>
              </div>
              {validationErrors.platforms && <p className="text-sm text-red-600 mt-1">{Array.isArray(validationErrors.platforms) ? validationErrors.platforms.join(", ") : validationErrors.platforms}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t pt-6">
            {error && !Object.keys(validationErrors).length > 0 && <p className="text-sm text-red-600 mr-auto">{error}</p>}
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={saving}>
              {" "}
              Cancel{" "}
            </Button>
            <Button type="submit" disabled={saving || loading}>
              {" "}
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Save Changes{" "}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* --- Image Cropping Modal --- */}
      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            {" "}
            <DialogTitle>Crop Profile Picture</DialogTitle>{" "}
          </DialogHeader>
          {imgSrcForCrop && (
            <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={1} circularCrop={true}>
              <img ref={imgRef} alt="Crop preview" src={imgSrcForCrop} style={{ transform: `scale(1) rotate(0deg)` }} onLoad={onImageLoad} />
            </ReactCrop>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsCropModalOpen(false)}>
              {" "}
              Cancel{" "}
            </Button>
            <Button onClick={handleCropImage} disabled={!completedCrop?.width || !completedCrop?.height}>
              {" "}
              <Crop className="mr-2 h-4 w-4" /> Crop & Apply{" "}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
