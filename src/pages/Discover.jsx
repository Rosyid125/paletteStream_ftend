import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// Removed Tabs imports
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Heart, X } from "lucide-react"; // Removed ChevronLeft/Right
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Discover() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1); // Represents the next page to fetch
  const [pageSize, setPageSize] = useState(9); // Adjust page size for infinite scroll
  const [artworks, setArtworks] = useState([]);
  const [loadingArtworks, setLoadingArtworks] = useState(false); // Initially false, true during fetch
  const [hasMore, setHasMore] = useState(true); // Tracks if more data is available
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // Track initial data load

  // Ref for the observer target element
  const observer = useRef();

  // --- Search State (for navigation trigger) ---
  const [searchType, setSearchType] = useState("post");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentTagInput, setCurrentTagInput] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const popularTags = ["fantasy", "digital", "portrait", "landscape", "character", "anime", "scifi", "traditional", "concept", "fanart"];
  const artworkTypes = ["illustration", "manga", "novel"];

  // --- Dummy Data (Artworks Only) ---
  const allArtworks = [
    {
      id: 1,
      title: "Ethereal Forest",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop",
      author: { name: "Liam Parker", avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=100&auto=format&fit=crop", level: 16 },
      likes: 542,
      tags: ["fantasy", "landscape", "digital"],
      description: "A mystical forest scene bathed in soft light.",
    },
    {
      id: 2,
      title: "Cyberpunk City",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=1000&auto=format&fit=crop",
      author: { name: "Zoe Chen", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop", level: 23 },
      likes: 876,
      tags: ["scifi", "cyberpunk", "digital"],
      description: "Neon lights illuminate a futuristic cityscape.",
    },
    {
      id: 3,
      title: "Moonlit Wanderer",
      type: "manga",
      imageUrl: "https://images.unsplash.com/photo-1579547945413-497e1b99dac0?q=80&w=1000&auto=format&fit=crop",
      author: { name: "Hiroshi Tanaka", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop", level: 28 },
      likes: 723,
      tags: ["manga", "character", "fantasy"],
      description: "A lone character walking under a full moon.",
    },
    {
      id: 4,
      title: "Ocean Dreams",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1000&auto=format&fit=crop",
      author: { name: "Emma Waters", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop", level: 19 },
      likes: 412,
      tags: ["landscape", "digital", "ocean"],
      description: "Vibrant underwater scene.",
    },
    {
      id: 5,
      title: "The Last Guardian",
      type: "novel",
      imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1000&auto=format&fit=crop",
      author: { name: "Marcus Reed", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop", level: 21 },
      likes: 356,
      tags: ["novel", "fantasy", "adventure"],
      description: "Cover art for an epic fantasy novel.",
    },
    {
      id: 6,
      title: "Sakura Dreams",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop",
      author: { name: "Yuki Sato", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop", level: 25 },
      likes: 689,
      tags: ["traditional", "japanese", "nature"],
      description: "Peaceful scene with cherry blossoms.",
    },
    {
      id: 7,
      title: "Ancient Ruins",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=1000&auto=format&fit=crop",
      author: { name: "Liam Parker", avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=100&auto=format&fit=crop", level: 16 },
      likes: 610,
      tags: ["fantasy", "landscape", "adventure"],
      description: "Exploring lost civilizations.",
    },
    {
      id: 8,
      title: "Mech Pilot",
      type: "manga",
      imageUrl: "https://images.unsplash.com/photo-1612036782180-6f0b6cd84627?w=1000&auto=format&fit=crop",
      author: { name: "Alex Kim", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop", level: 19 },
      likes: 950,
      tags: ["manga", "scifi", "character", "mech"],
      description: "Ready for battle in a giant robot.",
    },
    {
      id: 9,
      title: "Galactic Voyage",
      type: "novel",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop",
      author: { name: "Marcus Reed", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop", level: 21 },
      likes: 420,
      tags: ["novel", "scifi", "space", "adventure"],
      description: "Journey across the stars.",
    },
    {
      id: 10,
      title: "Street Samurai",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1531579790436-aa04fa4b7450?w=1000&auto=format&fit=crop",
      author: { name: "Zoe Chen", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop", level: 23 },
      likes: 788,
      tags: ["cyberpunk", "character", "digital", "samurai"],
      description: "Modern warrior in the neon city.",
    },
    {
      id: 11,
      title: "Dragon's Peak",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1542838234-b9a2004c9c9b?w=1000&auto=format&fit=crop",
      author: { name: "Emma Waters", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop", level: 19 },
      likes: 595,
      tags: ["fantasy", "landscape", "dragon", "mountain"],
      description: "Where ancient creatures dwell.",
    },
    {
      id: 12,
      title: "Spirit Fox",
      type: "manga",
      imageUrl: "https://plus.unsplash.com/premium_photo-1675372610516-51215aa3a016?w=1000&auto=format&fit=crop",
      author: { name: "Hiroshi Tanaka", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop", level: 28 },
      likes: 812,
      tags: ["manga", "fantasy", "character", "yokai"],
      description: "A mystical fox guide.",
    },
    // --- Add more dummy data items here if needed to test scrolling ---
    {
      id: 13,
      title: "Underwater Kingdom",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1000&auto=format&fit=crop",
      author: { name: "Emma Waters", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop", level: 19 },
      likes: 650,
      tags: ["fantasy", "landscape", "ocean", "city"],
      description: "A hidden city beneath the waves.",
    },
    {
      id: 14,
      title: "Space Station Hub",
      type: "illustration",
      imageUrl: "https://images.unsplash.com/photo-1517976487-704910680149?w=1000&auto=format&fit=crop",
      author: { name: "Zoe Chen", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop", level: 23 },
      likes: 710,
      tags: ["scifi", "space", "concept", "station"],
      description: "A bustling hub in zero gravity.",
    },
    {
      id: 15,
      title: "Forest Guardian",
      type: "manga",
      imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1000&auto=format&fit=crop",
      author: { name: "Yuki Sato", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop", level: 25 },
      likes: 880,
      tags: ["manga", "fantasy", "character", "nature"],
      description: "Protector of the ancient woods.",
    },
  ];

  // --- Fetching Logic (for Infinite Scroll) ---
  const fetchArtworks = useCallback(
    async (pageNum) => {
      if (loadingArtworks) return; // Prevent multiple fetches
      setLoadingArtworks(true);
      console.log(`Fetching page: ${pageNum}`);

      try {
        const delay = (ms) => new Promise((res) => setTimeout(res, ms));
        await delay(750); // Simulate network delay

        // --- No filtering applied here, just pagination ---
        const startIndex = (pageNum - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const newArtworks = allArtworks.slice(startIndex, endIndex);

        setArtworks((prev) => (pageNum === 1 ? newArtworks : [...prev, ...newArtworks]));
        setHasMore(endIndex < allArtworks.length); // Check if more data exists
        setPage((prev) => prev + 1); // Increment page number for the *next* fetch
      } catch (error) {
        console.error("Error fetching artworks:", error);
        // Handle error state if needed
      } finally {
        setLoadingArtworks(false);
        if (pageNum === 1) {
          setInitialLoadComplete(true); // Mark initial load done after first fetch
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [pageSize, loadingArtworks]
  ); // Add loadingArtworks to prevent race conditions

  // --- Effect for Initial Data Load ---
  useEffect(() => {
    // Only fetch page 1 initially
    fetchArtworks(1);
  }, [fetchArtworks]); // fetchArtworks is wrapped in useCallback

  // --- Intersection Observer Setup ---
  const lastArtworkElementRef = useCallback(
    (node) => {
      if (loadingArtworks) return; // Don't observe while loading
      if (observer.current) observer.current.disconnect(); // Disconnect previous observer

      observer.current = new IntersectionObserver((entries) => {
        // If the target element is intersecting (visible) and there's more data
        if (entries[0].isIntersecting && hasMore) {
          fetchArtworks(page); // Fetch the next page
        }
      });

      if (node) observer.current.observe(node); // Start observing the new target node
    },
    [loadingArtworks, hasMore, fetchArtworks, page]
  ); // Dependencies for the observer callback

  // --- Search Type Change Handler (Simplified) ---
  const handleSearchTypeChange = (value) => {
    setSearchType(value);
    setSearchQuery("");
    setSelectedTags([]);
    setCurrentTagInput("");
    setSelectedType("");
  };

  // --- Tag Input Handling (Unchanged) ---
  const addTag = (tagToAdd) => {
    const cleanedTag = tagToAdd.trim().toLowerCase();
    if (cleanedTag && !selectedTags.includes(cleanedTag)) {
      setSelectedTags([...selectedTags, cleanedTag]);
    }
    setCurrentTagInput("");
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputChange = (e) => {
    setCurrentTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(currentTagInput);
    } else if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  // --- Handle Search Submission (Navigates Away - Unchanged) ---
  const handleSearchSubmit = () => {
    let searchParams = {};
    let targetPath = "/search";

    switch (searchType) {
      case "artist":
        if (!searchQuery.trim()) {
          console.log("Artist search query empty.");
          return;
        }
        searchParams = { type: "artist", query: searchQuery.trim() };
        break;
      case "post":
        if (!searchQuery.trim()) {
          console.log("Post search query empty.");
          return;
        }
        searchParams = { type: "post", query: searchQuery.trim() };
        break;
      case "tags":
        if (selectedTags.length === 0) {
          console.log("No tags selected.");
          return;
        }
        searchParams = { type: "tags", tags: selectedTags.join(",") };
        break;
      case "type":
        if (!selectedType) {
          console.log("No type selected.");
          return;
        }
        searchParams = { type: "type", value: selectedType };
        break;
      default:
        console.warn("Unknown search type:", searchType);
        return;
    }

    const url = `${targetPath}?${new URLSearchParams(searchParams).toString()}`;
    console.log("Navigating to:", url);
    navigate(url);
  };

  const handleQueryInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "illustration":
        return "text-primary bg-primary/10 hover:bg-primary/20";
      case "manga":
        return "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20";
      case "novel":
        return "text-purple-500 bg-purple-500/10 hover:bg-purple-500/20";
      default:
        return "text-primary bg-primary/10 hover:bg-primary/20";
    }
  };

  // --- Render Search Input (Simplified - always for artworks) ---
  const renderSearchInput = () => {
    switch (searchType) {
      case "artist":
        return <Input placeholder="Search by artist name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleQueryInputKeyDown} />;
      case "post":
        return <Input placeholder="Search by title or description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleQueryInputKeyDown} />;
      case "tags":
        return (
          <div className="space-y-2">
            <div className="border rounded-md p-2 min-h-[40px] flex flex-wrap gap-1 items-center">
              {selectedTags.length === 0 && <span className="text-sm text-muted-foreground px-1">Selected tags appear here</span>}
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full hover:bg-muted-foreground/20" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>
                    {" "}
                    <X className="h-3 w-3" />{" "}
                  </Button>
                </Badge>
              ))}
            </div>
            <Input placeholder="Type a tag and press Enter or comma..." value={currentTagInput} onChange={handleTagInputChange} onKeyDown={handleTagInputKeyDown} />
          </div>
        );
      case "type":
        return (
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              {" "}
              <SelectValue placeholder="Select artwork type..." />{" "}
            </SelectTrigger>
            <SelectContent>
              {artworkTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {" "}
                  {type.charAt(0).toUpperCase() + type.slice(1)}{" "}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 space-y-6 p-4 md:p-6">
      {/* Search Card */}
      <Card className="border-t-4 border-t-primary">
        <CardHeader className="pb-2">
          <CardTitle>Discover Artworks</CardTitle> {/* Updated Title */}
          <CardDescription>Find new artworks</CardDescription> {/* Updated Description */}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="w-full md:w-40 flex-shrink-0">
              <Select value={searchType} onValueChange={handleSearchTypeChange}>
                <SelectTrigger>
                  {" "}
                  <SelectValue placeholder="Search By..." />{" "}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Post (Title/Desc)</SelectItem>
                  <SelectItem value="artist">Artist Name</SelectItem>
                  <SelectItem value="tags">Tags</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-0"> {renderSearchInput()} </div>
            <Button onClick={handleSearchSubmit} className="w-full md:w-auto">
              {" "}
              <Search className="mr-2 h-4 w-4" /> Search{" "}
            </Button>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Popular Tags</h3>
            <ScrollArea className="w-full whitespace-nowrap pb-2">
              <div className="flex gap-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={searchType === "tags" ? "secondary" : "outline"}
                    className={`cursor-${searchType === "tags" ? "pointer" : "not-allowed"} ${searchType === "tags" ? "hover:bg-secondary/80" : "opacity-60"} transition-colors`}
                    onClick={() => searchType === "tags" && addTag(tag)}
                    title={searchType !== "tags" ? "Select 'Tags' in 'Search By' to use" : `Add tag: ${tag}`}
                  >
                    {" "}
                    #{tag}{" "}
                  </Badge>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Artworks Grid */}
      <div className="mt-6">
        {!initialLoadComplete &&
          loadingArtworks && ( // Show initial loading skeletons
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: pageSize }).map((_, index) => (
                <Card key={`initial-skeleton-${index}`} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-2/3 mb-2" />
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center space-x-2">
                        {" "}
                        <Skeleton className="h-6 w-6 rounded-full" /> <Skeleton className="h-4 w-16" />{" "}
                      </div>
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {" "}
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-12 mr-1" />
                      ))}{" "}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

        {initialLoadComplete &&
          artworks.length === 0 &&
          !loadingArtworks && ( // Show empty state only after initial load & not loading
            <div className="text-center text-muted-foreground py-10 col-span-full">
              <p>No artworks found.</p>
            </div>
          )}

        {artworks.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((artwork, index) => {
              // If it's the last artwork, attach the ref for IntersectionObserver
              if (artworks.length === index + 1) {
                return (
                  <div ref={lastArtworkElementRef} key={artwork.id}>
                    <ArtworkCard artwork={artwork} />
                  </div>
                );
              } else {
                return <ArtworkCard key={artwork.id} artwork={artwork} />;
              }
            })}

            {/* Loading indicator for subsequent pages */}
            {loadingArtworks && page > 1 && (
              <>
                {/* Add skeleton loaders for the next page */}
                {Array.from({ length: 3 }).map(
                  (
                    _,
                    index // Show fewer skeletons for loading more
                  ) => (
                    <Card key={`loading-skeleton-${index}`} className="overflow-hidden">
                      <Skeleton className="aspect-square w-full" />
                      <CardContent className="p-4">
                        <Skeleton className="h-5 w-2/3 mb-2" />
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <Skeleton className="h-4 w-10" />
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-4 w-12 mr-1" />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </>
            )}
          </div>
        )}

        {!loadingArtworks &&
          !hasMore &&
          artworks.length > 0 && ( // Message when all data is loaded
            <div className="text-center text-muted-foreground py-10 col-span-full">
              <p>You've reached the end!</p>
            </div>
          )}
      </div>
    </div>
  );
}

// Helper component for Artwork Card to keep the main component cleaner
function ArtworkCard({ artwork }) {
  const getTypeColor = (type) => {
    switch (type) {
      case "illustration":
        return "text-primary bg-primary/10 hover:bg-primary/20";
      case "manga":
        return "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20";
      case "novel":
        return "text-purple-500 bg-purple-500/10 hover:bg-purple-500/20";
      default:
        return "text-primary bg-primary/10 hover:bg-primary/20";
    }
  };

  return (
    <Card className="overflow-hidden group h-full flex flex-col">
      <div className="relative aspect-square w-full overflow-hidden">
        <img src={artwork.imageUrl || "/placeholder.svg"} alt={artwork.title} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className={getTypeColor(artwork.type)}>
            {artwork.type.charAt(0).toUpperCase() + artwork.type.slice(1)}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-semibold truncate">{artwork.title}</h3>
          <div className="flex justify-between items-center mt-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <Avatar className="h-6 w-6">
                    {" "}
                    <AvatarImage src={artwork.author.avatar} alt={artwork.author.name} /> <AvatarFallback>{artwork.author.name.charAt(0)}</AvatarFallback>{" "}
                  </Avatar>
                  <span className="text-sm">{artwork.author.name}</span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <Avatar>
                    {" "}
                    <AvatarImage src={artwork.author.avatar} /> <AvatarFallback>{artwork.author.name.charAt(0)}</AvatarFallback>{" "}
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">{artwork.author.name}</h4>
                    <p className="text-sm">Level {artwork.author.level} Artist</p>
                    <div className="flex items-center pt-2">
                      {" "}
                      <Button variant="outline" size="sm" className="mr-2">
                        {" "}
                        View Profile{" "}
                      </Button>{" "}
                      <Button size="sm">Follow</Button>{" "}
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-sm text-muted-foreground">
                    {" "}
                    <Heart className="h-4 w-4 mr-1 fill-primary text-primary" /> <span>{artwork.likes}</span>{" "}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {" "}
                  <p>{artwork.likes} likes</p>{" "}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-border/50">
          {artwork.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs hover:bg-secondary/80 transition-colors cursor-pointer">
              {" "}
              #{tag}{" "}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
