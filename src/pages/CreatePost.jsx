import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Image, BookOpen, BookMarked, Upload, X, Plus, Hash, Globe, Lock, Users, Eye, AlertCircle, Trash2, ArrowUp, ArrowDown, Info, MessageSquare, Heart, Share2, FileText, Bookmark } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function CreatePost() {
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [suggestedTags, setSuggestedTags] = useState(["fantasy", "digital", "portrait", "landscape", "character", "anime", "scifi", "traditional", "concept", "fanart"]);
  const [files, setFiles] = useState([]);
  const [mangaPages, setMangaPages] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [allowComments, setAllowComments] = useState(true);
  const [allowReshare, setAllowReshare] = useState(true);
  const [isMatureContent, setIsMatureContent] = useState(false);
  const [novelContent, setNovelContent] = useState("");
  const [novelExcerpt, setNovelExcerpt] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const fileInputRef = useRef(null);
  const mangaFileInputRef = useRef(null);
  const { type } = useParams(); // Ambil nilai dari /post/:type
  const [selectedType, setSelectedType] = useState(type || "illustration");

  // Update state jika URL berubah
  useEffect(() => {
    setSelectedType(type || "illustration");
  }, [type]);

  // Categories for different post types
  const categories = {
    illustration: ["Digital Art", "Traditional Art", "Character Design", "Concept Art", "Fan Art", "Landscape", "Portrait", "Abstract", "Other"],
    manga: ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Slice of Life", "Other"],
    novel: ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Other"],
  };

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput) && tags.length < 10) {
      setTags([...tags, tagInput]);
      setTagInput("");

      // Add to suggested tags if it's not already there
      if (!suggestedTags.includes(tagInput)) {
        setSuggestedTags([...suggestedTags, tagInput]);
      }
    }
  };

  const handleAddSuggestedTag = (tag) => {
    if (!tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Handle file uploads
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);

          // Process files
          const newFiles = [];
          Array.from(e.target.files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string") {
                newFiles.push(reader.result);
                if (newFiles.length === e.target.files.length) {
                  setFiles([...files, ...newFiles]);
                }
              }
            };
            reader.readAsDataURL(file);
          });
        }
      }, 100);
    }
  };

  const handleMangaPageUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);

          // Process files
          Array.from(e.target.files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === "string" && mangaPages.length < 20) {
                const newId = mangaPages.length > 0 ? Math.max(...mangaPages.map((p) => p.id)) + 1 : 1;
                setMangaPages([
                  ...mangaPages,
                  {
                    id: newId,
                    file: reader.result,
                    caption: "",
                  },
                ]);
              }
            };
            reader.readAsDataURL(file);
          });
        }
      }, 100);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const removeMangaPage = (id) => {
    setMangaPages(mangaPages.filter((page) => page.id !== id));
  };

  const updateMangaPageCaption = (id, caption) => {
    setMangaPages(mangaPages.map((page) => (page.id === id ? { ...page, caption } : page)));
  };

  const movePageUp = (id) => {
    const index = mangaPages.findIndex((page) => page.id === id);
    if (index > 0) {
      const newPages = [...mangaPages];
      const temp = newPages[index];
      newPages[index] = newPages[index - 1];
      newPages[index - 1] = temp;
      setMangaPages(newPages);
    }
  };

  const movePageDown = (id) => {
    const index = mangaPages.findIndex((page) => page.id === id);
    if (index < mangaPages.length - 1) {
      const newPages = [...mangaPages];
      const temp = newPages[index];
      newPages[index] = newPages[index + 1];
      newPages[index + 1] = temp;
      setMangaPages(newPages);
    }
  };

  // Handle category selection
  const handleCategoryChange = (value) => {
    if (value === "custom") {
      setShowCustomCategory(true);
      setSelectedCategory("");
    } else {
      setShowCustomCategory(false);
      setSelectedCategory(value);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Here you would normally send the data to your API
    console.log({
      type: selectedType,
      title: postTitle,
      description: postDescription,
      category: showCustomCategory ? customCategory : selectedCategory,
      tags,
      files: selectedType === "illustration" ? files : [],
      mangaPages: selectedType === "manga" ? mangaPages : [],
      novelContent: selectedType === "novel" ? novelContent : "",
      novelExcerpt: selectedType === "novel" ? novelExcerpt : "",
      visibility,
      settings: {
        allowComments,
        allowReshare,
        isMatureContent,
      },
    });

    // Simulate successful post
    alert("Post created successfully!");
    navigate.push("/home");
  };

  // Get current user info (this would normally come from your auth system)
  const currentUser = {
    name: "Jane Painter",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop",
    level: 7,
  };

  return (
    <div className="grid grid-cols-1 space-y-6 p-4 md:p-6">
      <Card className="border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-2xl">Create New Post</CardTitle>
              <CardDescription>Share your artwork, manga, or novel with the community</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">Level {currentUser.level}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="illustration" value={selectedType} onValueChange={setSelectedType}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="illustration" className="flex items-center">
                <Image className="mr-2 h-4 w-4" />
                Illustration
              </TabsTrigger>
              <TabsTrigger value="manga" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Manga
              </TabsTrigger>
              <TabsTrigger value="novel" className="flex items-center">
                <BookMarked className="mr-2 h-4 w-4" />
                Novel
              </TabsTrigger>
            </TabsList>

            {/* Common fields for all post types */}
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-primary">*</span>
                </Label>
                <Input id="title" placeholder="Enter a title for your post" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Tell us about your artwork..." className="min-h-[100px]" value={postDescription} onChange={(e) => setPostDescription(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-primary">*</span>
                </Label>
                <Select onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories[selectedType] || []).map((category) => (
                      <SelectItem key={category} value={category.toLowerCase().replace(/\s+/g, "-")}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Add Custom Category...</SelectItem>
                  </SelectContent>
                </Select>

                {showCustomCategory && (
                  <div className="mt-2">
                    <Input placeholder="Enter custom category" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="tags">Tags (max 10)</Label>
                  <span className="text-xs text-muted-foreground">{tags.length}/10</span>
                </div>
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

                <div className="mt-2">
                  <Label className="text-xs text-muted-foreground">Suggested Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {suggestedTags
                      .filter((tag) => !tags.includes(tag))
                      .slice(0, 8)
                      .map((tag) => (
                        <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-secondary" onClick={() => handleAddSuggestedTag(tag)}>
                          <Plus className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Illustration-specific content */}
            <TabsContent value="illustration" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    Upload Illustrations <span className="text-primary">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">{files.length} file(s) uploaded</span>
                </div>

                {isUploading ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-sm font-medium">Uploading...</p>
                      <Progress value={uploadProgress} className="w-full h-2" />
                      <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
                    </div>
                  </div>
                ) : files.length === 0 ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Drag and drop your images here or click to browse</p>
                      <p className="text-xs text-muted-foreground">Supports JPG, PNG, GIF (max 10MB per file)</p>
                      <Input type="file" className="hidden" id="illustration-upload" accept="image/*" multiple ref={fileInputRef} onChange={handleFileUpload} />
                      <Label htmlFor="illustration-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm">
                          Select Files
                        </Button>
                      </Label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.map((file, index) => (
                        <div key={index} className="relative group">
                          <img src={file || "/placeholder.svg"} alt={`Uploaded illustration ${index + 1}`} className="w-full aspect-square object-cover rounded-md" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                            <div className="flex gap-2">
                              <Button size="icon" onClick={() => removeFile(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button variant="secondary" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {index === 0 && <Badge className="absolute top-2 left-2 bg-blue-500">Cover Image</Badge>}
                        </div>
                      ))}

                      <div className="border-2 border-dashed rounded-md flex items-center justify-center p-4 cursor-pointer hover:bg-muted/50 transition-colors aspect-square" onClick={() => fileInputRef.current?.click()}>
                        <div className="flex flex-col items-center gap-2 text-center">
                          <Plus className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm font-medium">Add More</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">First image will be used as the cover image</p>
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Add More Files
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Manga-specific content */}
            <TabsContent value="manga" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    Upload Manga Pages <span className="text-primary">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">{mangaPages.length}/20 pages</span>
                </div>

                {isUploading ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-sm font-medium">Uploading...</p>
                      <Progress value={uploadProgress} className="w-full h-2" />
                      <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
                    </div>
                  </div>
                ) : mangaPages.length === 0 ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Upload manga pages in sequence</p>
                      <p className="text-xs text-muted-foreground">Supports JPG, PNG (max 5MB per page)</p>
                      <Input type="file" className="hidden" id="manga-upload" accept="image/*" multiple ref={mangaFileInputRef} onChange={handleMangaPageUpload} />
                      <Label htmlFor="manga-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm">
                          Select Pages
                        </Button>
                      </Label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-4">
                        {mangaPages.map((page, index) => (
                          <Card key={page.id} className="overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative">
                                  <div className="font-bold text-lg w-8 h-8 flex items-center justify-center bg-muted rounded-full absolute -left-2 -top-2 z-10">{index + 1}</div>
                                  <div className="relative h-40 w-40 flex-shrink-0">
                                    <img src={page.file || "/placeholder.svg"} alt={`Manga page ${index + 1}`} className="h-full w-full object-cover rounded-md" />
                                    {index === 0 && <Badge className="absolute top-2 right-2 bg-blue-500">Cover</Badge>}
                                  </div>
                                </div>

                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium">Page {index + 1}</p>
                                    <div className="flex items-center gap-1">
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => movePageUp(page.id)} disabled={index === 0}>
                                        <ArrowUp className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => movePageDown(page.id)} disabled={index === mangaPages.length - 1}>
                                        <ArrowDown className="h-4 w-4" />
                                      </Button>
                                      <Button size="icon" className="h-7 w-7" onClick={() => removeMangaPage(page.id)}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <Label htmlFor={`page-caption-${page.id}`} className="text-sm">
                                      Page Caption (optional)
                                    </Label>
                                    <Textarea
                                      id={`page-caption-${page.id}`}
                                      placeholder="Add a caption for this page..."
                                      className="min-h-[80px] text-sm"
                                      value={page.caption}
                                      onChange={(e) => updateMangaPageCaption(page.id, e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">First page will be used as the cover image</p>
                      <Button variant="outline" size="sm" onClick={() => mangaFileInputRef.current?.click()} disabled={mangaPages.length >= 20}>
                        <Upload className="h-4 w-4 mr-2" />
                        Add More Pages
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Novel-specific content */}
            <TabsContent value="novel" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="novel-content">
                  Novel Content <span className="text-primary">*</span>
                </Label>
                <div className="relative">
                  <Textarea id="novel-content" placeholder="Write your story here..." className="min-h-[400px] font-mono" value={novelContent} onChange={(e) => setNovelContent(e.target.value)} />
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">{novelContent.length} characters</div>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Info className="h-3 w-3 mr-1" />
                  <span>You can use Markdown formatting for your novel.</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="novel-excerpt">
                  Short Excerpt (for preview) <span className="text-primary">*</span>
                </Label>
                <Textarea id="novel-excerpt" placeholder="Write a short excerpt to attract readers..." className="min-h-[100px]" value={novelExcerpt} onChange={(e) => setNovelExcerpt(e.target.value)} />
                <p className="text-xs text-muted-foreground">This will be shown as a preview on your novel post.</p>
              </div>

              <div className="space-y-2">
                <Label>Cover Image (optional)</Label>
                {files.length === 0 ? (
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <p className="text-sm">Add a cover image for your novel</p>
                      <Input type="file" className="hidden" id="novel-cover-upload" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} />
                      <Label htmlFor="novel-cover-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" size="sm">
                          Select Image
                        </Button>
                      </Label>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-40">
                    <img src={files[0] || "/placeholder.svg"} alt="Novel cover" className="w-full aspect-[2/3] object-cover rounded-md" />
                    <Button size="icon" className="absolute top-2 right-2" onClick={() => removeFile(0)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <Separator className="my-6" />

            {/* Visibility settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Post Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className={`overflow-hidden cursor-pointer transition-colors ${visibility === "public" ? "border-primary" : ""}`} onClick={() => setVisibility("public")}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <Globe className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-medium">Public</div>
                      <p className="text-xs text-muted-foreground">Everyone can see this post</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`overflow-hidden cursor-pointer transition-colors ${visibility === "followers" ? "border-primary" : ""}`} onClick={() => setVisibility("followers")}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-medium">Followers Only</div>
                      <p className="text-xs text-muted-foreground">Only your followers can see this post</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`overflow-hidden cursor-pointer transition-colors ${visibility === "private" ? "border-primary" : ""}`} onClick={() => setVisibility("private")}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <Lock className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-medium">Private</div>
                      <p className="text-xs text-muted-foreground">Only you can see this post</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="comments">Allow Comments</Label>
                    <p className="text-xs text-muted-foreground">Let others comment on your post</p>
                  </div>
                  <Switch id="comments" checked={allowComments} onCheckedChange={setAllowComments} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reshare">Allow Resharing</Label>
                    <p className="text-xs text-muted-foreground">Let others reshare your post</p>
                  </div>
                  <Switch id="reshare" checked={allowReshare} onCheckedChange={setAllowReshare} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="mature">Mature Content</Label>
                    <p className="text-xs text-muted-foreground">Mark this post as containing mature content</p>
                  </div>
                  <Switch id="mature" checked={isMatureContent} onCheckedChange={setIsMatureContent} />
                </div>
              </div>
            </div>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Post Preview</DialogTitle>
                <DialogDescription>This is how your post will appear to others</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground">Level {currentUser.level} • Just now</p>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold">{postTitle || "Your Post Title"}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{postDescription || "Preview of your post description"}</p>

                  {selectedType === "illustration" && files.length > 0 && (
                    <div className="mt-4 flex justify-center">
                      <img src={files[0] || "/placeholder.svg"} alt="Preview" className="max-h-[300px] w-auto rounded-lg object-contain" />
                    </div>
                  )}

                  {selectedType === "manga" && mangaPages.length > 0 && (
                    <div className="mt-4 flex justify-center">
                      <img src={mangaPages[0].file || "/placeholder.svg"} alt="Preview" className="max-h-[300px] w-auto rounded-lg object-contain" />
                    </div>
                  )}

                  {selectedType === "novel" && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <p className="italic text-sm">{novelExcerpt || "Novel excerpt preview will appear here..."}</p>
                    </div>
                  )}

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex gap-4">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Heart className="h-4 w-4" />
                        <span>0</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>0</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Share2 className="h-4 w-4" />
                        <span>0</span>
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Close Preview
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Save Draft
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">Save as Draft</h4>
                  <p className="text-sm text-muted-foreground">Your work will be saved and you can continue editing later.</p>
                  <Button className="w-full" onClick={() => alert("Draft saved!")}>
                    Save Draft
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Publish Post
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleSubmit}>Publish Now</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Schedule for Later</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
