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
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import api from "@/api/axiosInstance";
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

// --- Helper: Debounce (keep as is) ---
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

// --- Helper: Generate Cropped Image Blob (keep as is) ---
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
          console.error("Canvas is empty");
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

// --- EditProfile Component ---
export default function EditProfile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({ first_name: "", last_name: "", username: "", bio: "", location: "", platforms: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [imgSrcForCrop, setImgSrcForCrop] = useState("");
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const [croppedAvatarFile, setCroppedAvatarFile] = useState(null); // <= This holds the File to upload
  const [newLinkInput, setNewLinkInput] = useState("");
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
        const d = response.data.data;
        setProfileData(d);
        setFormData({
          first_name: d.first_name || "",
          last_name: d.last_name || "",
          username: d.username || "",
          bio: d.bio || "",
          location: d.location || "",
          platforms: Array.isArray(d.platform_links) ? d.platform_links : [],
        });
        setAvatarPreview(d.avatar ? getFullStorageUrl(d.avatar) : null);
      } else {
        setError(response.data?.message || "Failed fetch");
        toast.error(response.data?.message || "Failed fetch");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Fetch error";
      setError(msg);
      toast.error(msg);
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
    if (e.target.files?.[0]) {
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
      e.target.value = "";
    }
  };

  // --- Cropper Modal: Center crop ---
  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: "%", width: 90 }, 1, width, height), width, height));
  }

  // --- Cropper Modal: Handle crop ---
  const handleCropImage = async () => {
    const image = imgRef.current;
    if (!image || !completedCrop || !originalFile) {
      toast.error("Could not crop image.");
      return;
    }
    try {
      const croppedBlob = await getCroppedImg(image, completedCrop, originalFile.name);
      // *** Crucial: Create the File object ***
      const croppedFile = new File([croppedBlob], originalFile.name, { type: croppedBlob.type, lastModified: Date.now() });

      //   console.log("Cropped File Object:", croppedFile); // <-- Log the file object created

      // *** Set the state holding the file ***
      setCroppedAvatarFile(croppedFile); // <-- Make sure this is updated

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

  // --- Debounced Preview (optional) ---
  const debouncedUpdatePreview = debounce(async () => {
    /* ...canvas drawing logic... */
  }, 100);
  useEffect(() => {
    if (completedCrop?.width && imgRef.current) {
      /* debouncedUpdatePreview(); */
    }
  }, [completedCrop]);

  // --- Avatar Preview Cleanup ---
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
    const link = newLinkInput.trim();
    if (link) {
      try {
        new URL(link);
        setFormData((prev) => ({ ...prev, platforms: [...prev.platforms, link] }));
        setNewLinkInput("");
      } catch (_) {
        toast.error("Invalid URL");
      }
    }
  };
  const handleRemoveLink = (i) => {
    setFormData((prev) => ({ ...prev, platforms: prev.platforms.filter((_, idx) => idx !== i) }));
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setValidationErrors({});
    let errors = {};
    if (!formData.first_name.trim()) errors.first_name = "First name cannot be empty.";
    if (!formData.last_name.trim()) errors.last_name = "Last name cannot be empty.";
    if (!formData.username.trim()) errors.username = "Username cannot be empty.";
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setSaving(false);
      toast.error("Please fix form errors.");
      return;
    }

    const dataToSubmit = new FormData();
    dataToSubmit.append("first_name", formData.first_name.trim());
    dataToSubmit.append("last_name", formData.last_name.trim());
    dataToSubmit.append("username", formData.username.trim());
    dataToSubmit.append("bio", formData.bio.trim());
    dataToSubmit.append("location", formData.location.trim());
    if (formData.platforms?.length > 0) {
      formData.platforms.forEach((link) => dataToSubmit.append("platforms[]", link));
    }

    // // --- *** DEBUGGING & VERIFICATION for Avatar *** ---
    // console.log("handleSubmit: Current value of croppedAvatarFile state:", croppedAvatarFile); // Log state value

    if (croppedAvatarFile instanceof File) {
      // Check if it's actually a File object
      console.log("Appending avatar file:", croppedAvatarFile);
      dataToSubmit.append("avatar", croppedAvatarFile);
    } else if (croppedAvatarFile) {
      // Log if it exists but isn't a File (might indicate a problem)
      console.warn("handleSubmit: croppedAvatarFile exists but is not a File object:", croppedAvatarFile);
    } else {
      console.log("handleSubmit: No new avatar file selected/cropped.");
    }
    // --- *** END DEBUGGING *** ---

    // console.log("--- FormData prepared for submission ---");
    // for (let [key, value] of dataToSubmit.entries()) {
    //   console.log(`${key}:`, value);
    // }
    // console.log("------------------------------------");

    try {
      const response = await api.put("/profiles/update", dataToSubmit, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        toast.success("Profile updated!");
        setCroppedAvatarFile(null); // Clear successfully uploaded file state
        fetchProfile(); // Refetch
      } else {
        /* ... error handling ... */
        if (response.data?.errors) {
          setValidationErrors(response.data.errors);
          toast.error("Update failed. Check errors.");
        } else {
          const msg = response.data?.message || "Update failed.";
          setError(msg);
          toast.error(msg);
        }
      }
    } catch (err) {
      /* ... error handling ... */
      console.error("Error updating profile:", err);
      let msg = "Update error.";
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
        msg = "Update failed. Check errors.";
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // --- Render Logic (Skeleton and Error handling remain the same) ---
  if (loading) {
    /* ... Skeleton JSX ... */
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-3xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }
  if (error && !profileData) {
    /* ... Error JSX ... */
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-3xl text-center">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={() => fetchProfile()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  // --- Form Render ---
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
                {" "}
                <Avatar className="h-20 w-20 border">
                  {" "}
                  <AvatarImage src={avatarPreview || "/placeholder.svg"} alt={`${formData.first_name} ${formData.last_name}` || "User"} />{" "}
                  <AvatarFallback>{formData.first_name?.charAt(0).toUpperCase() || formData.username?.charAt(0).toUpperCase() || "?"}</AvatarFallback>{" "}
                </Avatar>
                <Button type="button" variant="outline" size="sm" onClick={() => hiddenFileInputRef.current?.click()}>
                  {" "}
                  <Upload className="mr-2 h-4 w-4" /> Change Avatar{" "}
                </Button>{" "}
                <input ref={hiddenFileInputRef} type="file" accept="image/*" onChange={handleAvatarFileSelect} className="hidden" />
              </div>
              {validationErrors.avatar && <p className="text-sm text-red-600 mt-1">{validationErrors.avatar}</p>}
            </div>
            {/* First Name Field */}
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Your first name" maxLength={50} className={validationErrors.first_name ? "border-red-500" : ""} />
              {validationErrors.first_name && <p className="text-sm text-red-600">{validationErrors.first_name}</p>}
            </div>

            {/* Last Name Field */}
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Your last name" maxLength={50} className={validationErrors.last_name ? "border-red-500" : ""} />
              {validationErrors.last_name && <p className="text-sm text-red-600">{validationErrors.last_name}</p>}
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Your unique username" maxLength={50} className={validationErrors.username ? "border-red-500" : ""} />
              {validationErrors.username && <p className="text-sm text-red-600">{validationErrors.username}</p>}
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

            {/* Platforms Field */}
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

      {/* Image Cropping Modal */}
      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            {" "}
            <DialogTitle>Crop Profile Picture</DialogTitle>{" "}
          </DialogHeader>
          {imgSrcForCrop && (
            <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={1} circularCrop={true}>
              {" "}
              <img ref={imgRef} alt="Crop preview" src={imgSrcForCrop} style={{ transform: `scale(1) rotate(0deg)` }} onLoad={onImageLoad} />{" "}
            </ReactCrop>
          )}
          <DialogFooter className="mt-4">
            {" "}
            <Button variant="outline" onClick={() => setIsCropModalOpen(false)}>
              {" "}
              Cancel{" "}
            </Button>{" "}
            <Button onClick={handleCropImage} disabled={!completedCrop?.width || !completedCrop?.height}>
              {" "}
              <Crop className="mr-2 h-4 w-4" /> Crop & Apply{" "}
            </Button>{" "}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
