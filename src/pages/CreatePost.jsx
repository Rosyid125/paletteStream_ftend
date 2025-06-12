import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Hash, X, Upload, Image as ImageIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import api from "../api/axiosInstance";
import { toast } from "sonner";
import LoadingDots from "@/components/ui/custom-loading-dots";
import { DialogDescription } from "@radix-ui/react-dialog";

export default function CreatePost() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState([]);
  const { type: initialType } = useParams();
  const [type, setType] = useState(initialType || "illustration");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false); // For handling drag over state
  const [errors, setErrors] = useState({}); // State untuk menyimpan pesan kesalahan
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false); // Prevent multiple file processing

  // User effect yang akan dijalankan setiap kali params berubah
  useEffect(() => {
    setType(initialType || "illustration");
  }, [initialType]);

  // Fetch popular tags from API
  useEffect(() => {
    async function fetchPopularTags() {
      try {
        const res = await api.get("/tags/popular", { params: { limit: 10 } });
        if (res.data?.success && Array.isArray(res.data.data)) {
          setPopularTags(res.data.data.map((t) => t.name));
        } else {
          setPopularTags([]);
        }
      } catch {
        setPopularTags([]);
      }
    }
    fetchPopularTags();
  }, []);

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

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
  };
  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };
  // Add a click handler for the upload area
  const handleUploadAreaClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isProcessingFiles) {
      return; // Prevent opening file dialog if already processing
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleImageUpload = (e) => {
    if (isProcessingFiles) {
      return; // Prevent processing if already processing files
    }

    if (e.target.files && e.target.files.length > 0) {
      setIsProcessingFiles(true);
      const files = Array.from(e.target.files);
      const imageFiles = files.filter((file) => {
        const fileType = file.type.toLowerCase();
        return fileType === "image/jpeg" || fileType === "image/png" || fileType === "image/jpg";
      });

      if (imageFiles.length === 0) {
        toast.error("Please select valid image files (JPG, PNG, JPEG)");
        setIsProcessingFiles(false);
        return;
      }

      Promise.all(
        imageFiles.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (event) => resolve(event.target.result);
              reader.onerror = (error) => reject(error);
              reader.readAsDataURL(file);
            })
        )
      )
        .then((base64Images) => {
          setImages((prevImages) => [...prevImages, ...base64Images]); // Append to existing images
          // Reset the file input value to allow re-uploading the same file
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          setIsProcessingFiles(false);
        })
        .catch((error) => {
          console.error("Error reading files:", error);
          toast.error("Failed to process selected images");
          setIsProcessingFiles(false);
        });
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Create a mock event object for handleImageUpload
      const mockEvent = {
        target: {
          files: files,
        },
      };
      handleImageUpload(mockEvent);
    }
  };

  // Fungsi untuk menghapus gambar
  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!title) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (!description) {
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
    if (validateForm()) {
      // Set button loading to true
      setLoading(true);

      try {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("type", type);
        formData.append("userId", userId);
        // Kirim tags sebagai array dalam FormData
        tags.forEach((tag) => {
          formData.append("tags[]", tag); // Gunakan `tags[]` agar diterima sebagai array
        });

        // Ubah Base64 ke File Blob sebelum dikirim
        images.forEach((base64, index) => {
          const byteString = atob(base64.split(",")[1]); // Decode Base64
          const mimeType = base64.match(/:(.*?);/)[1]; // Ambil MIME type
          const arrayBuffer = new Uint8Array(byteString.length);

          for (let i = 0; i < byteString.length; i++) {
            arrayBuffer[i] = byteString.charCodeAt(i);
          }

          const blob = new Blob([arrayBuffer], { type: mimeType });
          const file = new File([blob], `image_${index}.jpg`, { type: mimeType });

          formData.append("images", file); // Kirim sebagai File, bukan Base64 string
        });

        const response = await api.post(`/posts/create/${userId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Pastikan response sukses sebelum melanjutkan
        if (response.status === 200) {
          toast("Post created successfully!");
          navigate("/home");
        }
      } catch (error) {
        console.error("Error creating post:", error);
        alert("Failed to create post.");
      } finally {
        // Finally merupakan blok yang akan dijalankan mekipun try/catch gagal atau berhasil
        setLoading(false);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 space-y-6 p-4 md:p-6">
      <Card className="border-t-4 border-t-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Post</CardTitle>
          <CardDescription>Share your content with the world</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add tags..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} disabled={tags.length >= 10 || !tagInput}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {tag}
                      <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => handleRemoveTag(tag)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              {/* Popular Tags */}
              <div className="mt-4">
                <h2 className="mb-1">Popular Tags</h2>
                <div className="flex gap-2 flex-wrap">
                  {popularTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {tag}
                      <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => handlePopularTagClick(tag)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="images">Images</Label>
              <div>
                <Button variant="outline" onClick={handleOpenUploadModal}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Images
                </Button>
              </div>
              {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
              <div className="flex mt-2 space-x-2 overflow-auto">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img src={image} alt={`Uploaded ${index + 1}`} className="w-20 h-20 object-cover rounded-md" />
                    <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-5 w-5 p-0 bg-background hover:bg-secondary rounded-full" onClick={() => handleRemoveImage(index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(value) => setType(value)}>
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
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={loading} className="relative">
            {loading ? (
              <span className="flex items-center gap-2">
                Creating
                <LoadingDots />
              </span>
            ) : (
              "Create"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Images</DialogTitle>
            <DialogDescription>Upload up to 10 images for your post</DialogDescription>
          </DialogHeader>
          <Input type="file" id="image-upload" multiple accept="image/jpeg, image/png, image/jpg" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />{" "}
          <div
            className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md cursor-pointer transition-all ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground"} ${
              isProcessingFiles ? "opacity-50 pointer-events-none" : ""
            }`}
            onClick={handleUploadAreaClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {" "}
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <Label className="cursor-pointer mt-1 pointer-events-none">{isProcessingFiles ? "Processing files..." : "Select Images (JPG, PNG, JPEG)"}</Label>
            <p className="text-sm text-muted-foreground mt-2 pointer-events-none">{isProcessingFiles ? "Please wait..." : "Drag and drop files here or click to browse"}</p>
          </div>
          <div className="flex mt-2 space-x-2 overflow-auto">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img src={image} alt={`Uploaded ${index + 1}`} className="w-20 h-20 object-cover rounded-md" />
                <Button variant="ghost" size="icon" className="absolute top-0 right-0 h-5 w-5 p-0 bg-background hover:bg-secondary rounded-full" onClick={() => handleRemoveImage(index)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleCloseUploadModal}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
