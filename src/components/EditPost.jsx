import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Hash, X, Upload, Image as ImageIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "../api/axiosInstance";
import { toast } from "sonner";
import LoadingDots from "@/components/ui/custom-loading-dots";

// --- Helper function to construct full URL for storage paths ---
const getFullStorageUrl = (path) => {
  if (!path || typeof path !== "string") return "/placeholder.svg";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
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

export function EditPost({ isOpen, onClose, post, onPostUpdated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState([]);
  const [type, setType] = useState("illustration");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const popularTags = ["illustration", "manga", "novel", "digital art", "traditional art", "fanart", "sketch", "painting", "character design", "concept art"];

  // Initialize form with post data when post changes
  useEffect(() => {
    if (post && isOpen) {      setTitle(post.title || "");
      setDescription(post.description || "");
      setType(post.type || "illustration");
      setTags(Array.isArray(post.tags) ? post.tags : []);

      // Don't load existing images - they will be replaced with new ones
      setImages([]);

      setErrors({});
    }
  }, [post, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setDescription("");
      setType("illustration");
      setTags([]);
      setImages([]);
      setTagInput("");
      setErrors({});
      setLoading(false);
      setIsUploadModalOpen(false);
      setDragOver(false);
    }
  }, [isOpen]);

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handlePopularTagClick = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (images.length + files.length > 10) {
      setErrors({ images: "Maximum of 10 images allowed" });
      return;
    }

    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      setErrors({ images: "Only image files are allowed" });
      return;
    }

    try {
      const base64Images = await Promise.all(validFiles.map((file) => convertToBase64(file)));
      setImages([...images, ...base64Images]);
      setErrors({ ...errors, images: null });

      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    } catch (error) {
      console.error("Error converting images:", error);
      setErrors({ images: "Error processing images" });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleImageUpload({ target: { files } });
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    }

    if (images.length === 0) {
      newErrors.images = "At least one image is required";
      isValid = false;
    }

    if (images.length > 10) {
      newErrors.images = "Maximum of 10 images allowed";
      isValid = false;
    }

    if (!type) {
      newErrors.type = "Type is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!post?.id) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("type", type);

      // Send tags as array
      tags.forEach((tag) => {
        formData.append("tags[]", tag);
      });      // Handle images - all images in the array are new images
      images.forEach((image, index) => {
        if (image.startsWith("data:image/")) {
          // Convert base64 to file
          const byteString = atob(image.split(",")[1]);
          const mimeType = image.match(/:(.*?);/)[1];
          const arrayBuffer = new Uint8Array(byteString.length);

          for (let i = 0; i < byteString.length; i++) {
            arrayBuffer[i] = byteString.charCodeAt(i);
          }

          const blob = new Blob([arrayBuffer], { type: mimeType });
          const file = new File([blob], `image_${index}.jpg`, { type: mimeType });
          formData.append("images", file);
        }
      });

      const response = await api.put(`/posts/edit/${post.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 && response.data.success) {
        toast.success("Post updated successfully!");

        // Call the callback to update the post in the parent component
        if (onPostUpdated) {
          onPostUpdated(post.id, {
            title: title.trim(),
            description: description.trim(),
            type,
            tags,
            // Note: images might need to be updated from response
            ...response.data.data,
          });
        }

        onClose();
      } else {
        throw new Error(response.data?.message || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error(error.response?.data?.message || "Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  if (!post) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>Update your post details, images, and tags. Note: All current images will be replaced with new ones you upload.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter post title" disabled={loading} />
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your artwork" className="min-h-[120px]" disabled={loading} />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(value) => setType(value)} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="illustration">Illustration</SelectItem>
                    <SelectItem value="manga">Manga</SelectItem>
                    <SelectItem value="novel">Novel</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
              </div>

              {/* Tags Section */}
              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    disabled={loading}
                  />
                  <Button type="button" onClick={handleAddTag} disabled={loading}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Popular Tags */}
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground mb-2">Popular tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {popularTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-secondary" onClick={() => handlePopularTagClick(tag)}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Current Tags */}
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {tag}
                      <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => handleRemoveTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Images */}            <div className="space-y-4">
              <div>
                <Label>Images (New)</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragOver ? "border-primary bg-primary/10" : "border-muted-foreground/50"}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop images here or{" "}
                      <Button type="button" variant="link" className="p-0 h-auto" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                        browse files
                      </Button>
                    </p>
                    <p className="text-xs text-muted-foreground">Maximum 10 images, JPEG/PNG only</p>
                  </div>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={loading} />
                </div>
                {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">                      <img 
                        src={
                          image.startsWith("data:") 
                            ? image 
                            : getFullStorageUrl(image)
                        } 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-20 object-cover rounded border" 
                      />
                      <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveImage(index)} disabled={loading}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <LoadingDots className="mr-2 h-4 w-4" />
                  Updating...
                </>
              ) : (
                "Update Post"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
