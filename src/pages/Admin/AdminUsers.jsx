import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2, Ban, Trash2, Pencil, Plus, User, Shield, Eye, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import api from "@/api/axiosInstance";

// --- Service functions using new endpoints ---
const fetchAdminUsers = async ({ search, page, limit }) => {
  return api.get("/admin/users", { params: { search, page, limit } });
};
const createAdminUser = async (payload) => {
  return api.post("/admin/admins", payload);
};
const banUser = async (id) => {
  return api.put(`/admin/users/${id}/ban`);
};
const editUser = async (id, payload) => {
  return api.put(`/admin/users/${id}`, payload);
};
const deleteUser = async (id) => {
  return api.delete(`/admin/users/${id}`);
};
const fetchUserById = async (id) => {
  return api.get(`/admin/users/${id}`);
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "admin",
  });
  const [editId, setEditId] = useState(null);
  // --- Update editForm to include all editable fields ---
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "default",
    status: "active",
    is_active: true,
  });
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers({ search, page, limit });
      if (res.data && res.data.success) {
        setUsers(res.data.data || []);
        setTotal(res.data.total || 0);
        setHasMore(res.data.hasMore || false);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  const handleAdd = async () => {
    await createAdminUser(addForm);
    toast({ title: "Admin created" });
    setOpenAdd(false);
    setAddForm({ email: "", password: "", first_name: "", last_name: "" });
    fetchUsers();
  };
  const handleBan = async (id) => {
    await banUser(id);
    toast({ title: "User banned" });
    fetchUsers();
  };
  const handleDelete = async (id) => {
    await deleteUser(id);
    toast({ title: "User deleted" });
    fetchUsers();
  };
  // --- Update handleEdit to send all fields ---
  const handleEdit = async () => {
    await editUser(editId, editForm);
    toast({ title: "User updated" });
    setEditId(null);
    fetchUsers();
  };

  return (
    <div className="space-y-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
      <div>
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <span className="text-indigo-600">👤</span> Admin & Users
        </h2>
        <p className="text-zinc-500 text-sm mb-4">Kelola akun admin dan pengguna platform.</p>
      </div>
      <div className="flex gap-2 items-center mb-2">
        <Input placeholder="Search user..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Button onClick={() => setOpenAdd(true)} variant="outline" size="sm" className="gap-1">
          <Plus className="w-4 h-4" />
          Add Admin
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full text-sm bg-white dark:bg-zinc-900 rounded-lg">
            <thead>
              <tr className="border-b bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
                <th className="py-3 px-4 text-left font-semibold">Email</th>
                <th className="py-3 px-4 text-left font-semibold">Name</th>
                <th className="py-3 px-4 text-left font-semibold">Status</th>
                <th className="py-3 px-4 text-left font-semibold">Role</th>
                <th className="py-3 px-4 text-left font-semibold">Active</th>
                <th className="py-3 px-4 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u.id} className={"border-b transition-colors " + (idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-800") + " hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40"}>
                  <td className="py-2 px-4">{u.email}</td>
                  <td className="py-2 px-4">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="py-2 px-4">
                    <Badge variant={u.status === "active" ? "success" : u.status === "banned" ? "destructive" : "secondary"}>{u.status}</Badge>
                  </td>
                  <td className="py-2 px-4">
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                  </td>
                  <td className="py-2 px-4">
                    <Badge variant={u.is_active ? "success" : "destructive"}>{u.is_active ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-indigo-100 dark:hover:bg-indigo-900"
                        onClick={() => {
                          setEditId(u.id);
                          setEditForm({
                            first_name: u.first_name,
                            last_name: u.last_name,
                            email: u.email,
                            role: u.role,
                            status: u.status,
                            is_active: u.is_active,
                          });
                        }}
                        aria-label="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={u.status === "active" ? "hover:bg-orange-100 dark:hover:bg-orange-900" : "hover:bg-green-100 dark:hover:bg-green-900"}
                        onClick={() => handleBan(u.id)}
                        aria-label={u.status === "active" ? "Ban" : "Unban"}
                        title={u.status === "active" ? "Ban user" : "Unban user"}
                      >
                        <Ban className={"w-4 h-4 " + (u.status === "active" ? "text-orange-500" : "text-green-500")} />
                      </Button>
                      <Button size="icon" variant="ghost" className="hover:bg-red-100 dark:hover:bg-red-900" onClick={() => handleDelete(u.id)} aria-label="Delete">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Add Admin Dialog */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
          >
            <Input placeholder="Email" value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} required />
            <Input placeholder="Password" type="password" value={addForm.password} onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))} required />
            <Input placeholder="First Name" value={addForm.first_name} onChange={(e) => setAddForm((f) => ({ ...f, first_name: e.target.value }))} required />
            <Input placeholder="Last Name" value={addForm.last_name} onChange={(e) => setAddForm((f) => ({ ...f, last_name: e.target.value }))} required />
            <Select value={addForm.role} onValueChange={(v) => setAddForm((f) => ({ ...f, role: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full">
              Add
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Edit User Dialog */}
      <Dialog
        open={!!editId}
        onOpenChange={(v) => {
          if (!v) setEditId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleEdit();
            }}
          >
            <Input placeholder="Email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} required />
            <Input placeholder="First Name" value={editForm.first_name} onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))} required />
            <Input placeholder="Last Name" value={editForm.last_name} onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))} required />
            <Select value={editForm.role} onValueChange={(v) => setEditForm((f) => ({ ...f, role: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="default">User</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Label htmlFor="is_active">Active</Label>
              <Switch id="is_active" checked={editForm.is_active} onCheckedChange={(v) => setEditForm((f) => ({ ...f, is_active: v }))} />
            </div>
            <Button type="submit" className="w-full">
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
