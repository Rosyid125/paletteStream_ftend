import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  Badge,
} from "@/components/ui";
import { Search, MoreVertical, Eye, Trash2 } from "lucide-react";

export default function PostManagement() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch posts - replace with API call
  useEffect(() => {
    // Mock data
    const mockPosts = [
      {
        id: 1,
        title: "Summer Artwork",
        author: "johndoe",
        type: "illustration",
        status: "active",
        createdAt: "2023-06-15",
        likes: 24,
        comments: 5,
      },
      {
        id: 2,
        title: "Winter Landscape",
        author: "janedoe",
        type: "photography",
        status: "active",
        createdAt: "2023-12-20",
        likes: 42,
        comments: 12,
      },
      {
        id: 3,
        title: "Reported Post",
        author: "banned_user",
        type: "manga",
        status: "reported",
        createdAt: "2023-09-05",
        likes: 8,
        comments: 2,
      },
    ];
    setPosts(mockPosts);
  }, []);

  const filteredPosts = posts.filter((post) => post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.author.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDeletePost = (postId) => {
    // API call to delete post
    setPosts(posts.filter((post) => post.id !== postId));
    setIsDeleteDialogOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Active
          </Badge>
        );
      case "reported":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Reported
          </Badge>
        );
      case "deleted":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Deleted
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "illustration":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            Illustration
          </Badge>
        );
      case "photography":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Photography
          </Badge>
        );
      case "manga":
        return (
          <Badge variant="outline" className="bg-pink-100 text-pink-800">
            Manga
          </Badge>
        );
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Post Management</h1>

      <div className="flex items-center gap-2">
        <Input placeholder="Search posts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
        <Button variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Stats</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPosts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>{post.id}</TableCell>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell>{post.author}</TableCell>
              <TableCell>{getTypeBadge(post.type)}</TableCell>
              <TableCell>{getStatusBadge(post.status)}</TableCell>
              <TableCell>{post.createdAt}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <span className="text-sm">❤️ {post.likes}</span>
                  <span className="text-sm">💬 {post.comments}</span>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedPost(post);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete "{selectedPost?.title}" by {selectedPost?.author}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeletePost(selectedPost?.id)} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
