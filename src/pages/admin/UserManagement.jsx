import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
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
} from "@/components/ui";
import { Search, MoreVertical, Edit, Trash2, Ban, UserPlus } from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch users - replace with API call
  useEffect(() => {
    // Mock data
    const mockUsers = [
      { id: 1, username: "admin", email: "admin@example.com", role: "admin", status: "active", createdAt: "2023-01-01" },
      { id: 2, username: "johndoe", email: "john@example.com", role: "user", status: "active", createdAt: "2023-05-15" },
      { id: 3, username: "banned_user", email: "banned@example.com", role: "user", status: "banned", createdAt: "2023-03-10" },
    ];
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleBanUser = (userId) => {
    // API call to ban/unban user
    setUsers(users.map((user) => (user.id === userId ? { ...user, status: user.status === "active" ? "banned" : "active" } : user)));
    setIsBanDialogOpen(false);
  };

  const handleDeleteUser = (userId) => {
    // API call to delete user
    setUsers(users.filter((user) => user.id !== userId));
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
        <Button variant="outline">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>{user.role}</span>
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{user.status}</span>
              </TableCell>
              <TableCell>{user.createdAt}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedUser(user);
                        setIsBanDialogOpen(true);
                      }}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      {user.status === "active" ? "Ban" : "Unban"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedUser(user);
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

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedUser?.status === "active" ? "Ban User" : "Unban User"}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {selectedUser?.status === "active" ? "ban" : "unban"} {selectedUser?.username}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleBanUser(selectedUser?.id)}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete {selectedUser?.username}'s account.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteUser(selectedUser?.id)} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
