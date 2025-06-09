import { useEffect, useState } from "react";
import { fetchAdminPosts, deletePost } from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CommentModal } from "@/components/CommentModal";
import { Badge } from "@/components/ui/badge";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    const res = await fetchAdminPosts({ search, page, limit });
    setPosts(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [search, page]);

  const handleDelete = async (id) => {
    await deletePost(id);
    toast({ title: "Post deleted" });
    fetchPosts();
  };

  const handleSeePost = (post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
      <div>
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <span className="text-fuchsia-600">🖼️</span> Admin Post Management
        </h2>
        <p className="text-zinc-500 text-sm mb-4">Kelola dan moderasi postingan pengguna.</p>
      </div>
      <div className="flex gap-2 items-center mb-2">
        <Input placeholder="Search post..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
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
                <th className="py-3 px-4 text-left font-semibold">Title</th>
                <th className="py-3 px-4 text-left font-semibold">Author</th>
                <th className="py-3 px-4 text-left font-semibold">Status</th>
                <th className="py-3 px-4 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p, idx) => (
                <tr key={p.id} className={"border-b transition-colors " + (idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-800") + " hover:bg-fuchsia-50/60 dark:hover:bg-fuchsia-950/40"}>
                  <td className="py-2 px-4">{p.title}</td>
                  <td className="py-2 px-4">{p.user?.profile?.username || p.user?.email || "-"}</td>
                  <td className="py-2 px-4">
                    <Badge variant={p.status === "active" ? "success" : p.status === "pending" ? "secondary" : "destructive"}>{p.status || "-"}</Badge>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="hover:bg-red-100 dark:hover:bg-red-900" onClick={() => handleDelete(p.id)} aria-label="Delete">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                      <Button size="icon" variant="ghost" className="hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900" onClick={() => handleSeePost(p)} aria-label="View">
                        <Eye className="w-4 h-4 text-fuchsia-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {selectedPost && (
        <CommentModal
          postId={selectedPost.id}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          postTitle={selectedPost.title}
          currentUser={null} // Admin, not posting
        />
      )}
    </div>
  );
}
