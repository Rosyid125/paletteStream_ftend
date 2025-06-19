import { useEffect, useState } from "react";
import { fetchAdminPosts, deletePost } from "@/services/adminService";
import { getAllReports, updateReportStatus, deleteReport, getReportStatistics, getReportedPosts } from "@/services/reportService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Eye, Flag, Check, X, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CommentModal } from "@/components/CommentModal";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [page, setPage] = useState(1);
  const [reportPage, setReportPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [reportStats, setReportStats] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDetailsOpen, setReportDetailsOpen] = useState(false);
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetchAdminPosts({ search, page, limit });
      setPosts(res.data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({ title: "Error fetching posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const res = await getAllReports({ search: reportSearch, page: reportPage, limit });
      // Handle different response structures
      const reportsData = res.data?.data || res.data || [];
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({ title: "Error fetching reports", variant: "destructive" });
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  };
  const fetchReportedPosts = async () => {
    setReportsLoading(true);
    try {
      const res = await getReportedPosts({ page: reportPage, limit });
      // Handle different response structures
      const postsData = res.data?.data || res.data || [];
      setReportedPosts(Array.isArray(postsData) ? postsData : []);
    } catch (error) {
      console.error("Error fetching reported posts:", error);
      toast({ title: "Error fetching reported posts", variant: "destructive" });
      setReportedPosts([]);
    } finally {
      setReportsLoading(false);
    }
  };
  const fetchReportStats = async () => {
    try {
      const res = await getReportStatistics();
      // Handle different response structures
      const rawData = res.data?.data || res.data || {};

      // Transform the backend response to match our component's expected format
      const transformedStats = {
        pending: rawData.statusBreakdown?.pending || 0,
        reviewed: rawData.statusBreakdown?.reviewed || 0,
        resolved: rawData.statusBreakdown?.resolved || 0,
        dismissed: rawData.statusBreakdown?.dismissed || 0,
        totalReports: rawData.totalReports || 0,
      };

      setReportStats(transformedStats);
    } catch (error) {
      console.error("Error fetching report statistics:", error);
      setReportStats({});
    }
  };
  useEffect(() => {
    fetchPosts();
  }, [search, page]);

  useEffect(() => {
    if (activeTab === "reports") {
      fetchReports();
      fetchReportStats();
    } else if (activeTab === "reported-posts") {
      fetchReportedPosts();
    }
  }, [activeTab, reportSearch, reportPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "r":
            event.preventDefault();
            if (activeTab === "posts") {
              fetchPosts();
            } else if (activeTab === "reports") {
              fetchReports();
              fetchReportStats();
            } else if (activeTab === "reported-posts") {
              fetchReportedPosts();
            }
            break;
          case "1":
            event.preventDefault();
            setActiveTab("posts");
            break;
          case "2":
            event.preventDefault();
            setActiveTab("reported-posts");
            break;
          case "3":
            event.preventDefault();
            setActiveTab("reports");
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [activeTab]);
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      await deletePost(id);
      toast({
        title: "Post deleted",
        description: "The post has been permanently deleted.",
      });
      fetchPosts();
      // Also refresh reported posts if we're on that tab
      if (activeTab === "reported-posts") {
        fetchReportedPosts();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error deleting post",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSeePost = (post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };
  const handleUpdateReportStatus = async (reportId, status) => {
    try {
      // Optimistic update
      setReports((prevReports) => prevReports.map((report) => (report.id === reportId ? { ...report, status } : report)));

      await updateReportStatus(reportId, { status });
      toast({
        title: `Report ${status}`,
        description: `Report has been marked as ${status}`,
      });

      // Refresh data
      fetchReports();
      fetchReportStats();
      if (activeTab === "reported-posts") {
        fetchReportedPosts();
      }
    } catch (error) {
      console.error("Error updating report status:", error);
      toast({
        title: "Error updating report",
        description: "Failed to update report status. Please try again.",
        variant: "destructive",
      });
      // Revert optimistic update
      fetchReports();
    }
  };
  const handleDeleteReport = async (reportId) => {
    if (!confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteReport(reportId);
      toast({
        title: "Report deleted",
        description: "The report has been permanently deleted.",
      });
      fetchReports();
      fetchReportStats();
    } catch (error) {
      console.error("Error deleting report:", error);
      toast({
        title: "Error deleting report",
        description: "Failed to delete report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewReportDetails = (report) => {
    setSelectedReport(report);
    setReportDetailsOpen(true);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "reviewed":
        return "default";
      case "resolved":
        return "success";
      case "dismissed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getReasonLabel = (reason) => {
    const reasonLabels = {
      inappropriate_content: "Inappropriate Content",
      spam: "Spam",
      harassment: "Harassment",
      copyright_violation: "Copyright Violation",
      fake_content: "Fake Content",
      violence: "Violence",
      adult_content: "Adult Content",
      hate_speech: "Hate Speech",
      other: "Other",
    };
    return reasonLabels[reason] || reason;
  };
  return (
    <div className="space-y-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
      <div>
        <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <span className="text-fuchsia-600">🖼️</span> Admin Post Management
        </h2>
        <p className="text-zinc-500 text-sm mb-4">
          Kelola dan moderasi postingan pengguna.
          <span className="ml-2 text-xs opacity-75">Shortcuts: Ctrl+R (refresh), Ctrl+1/2/3 (switch tabs)</span>
        </p>
      </div>{" "}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {" "}
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1">
          <TabsTrigger value="posts" className="text-xs sm:text-sm px-2 sm:px-3">
            All Posts
          </TabsTrigger>{" "}
          <TabsTrigger value="reported-posts" className="relative text-xs sm:text-sm px-2 sm:px-3">
            <span className="truncate">Reported Posts</span>
            {reportStats.pending > 0 && (
              <Badge variant="destructive" className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 p-0 text-xs flex items-center justify-center">
                {reportStats.pending > 99 ? "99+" : reportStats.pending}
              </Badge>
            )}{" "}
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm px-2 sm:px-3">
            All Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="space-y-4">
          <div className="flex gap-2 items-center mb-2">
            <Input placeholder="Search post..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
            <Button variant="outline" size="icon" onClick={() => fetchPosts()} disabled={loading} aria-label="Refresh posts">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              {" "}
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
                      <td className="py-2 px-4">{p.title || p.caption || "Untitled Post"}</td>
                      <td className="py-2 px-4">@{p.user?.profile?.username || p.user?.username || p.user?.profile?.display_name || p.user?.name || p.username || p.user?.email?.split("@")[0] || "[Deleted User]"}</td>
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
        </TabsContent>
        <TabsContent value="reported-posts" className="space-y-4">
          <div className="flex gap-2 items-center mb-2">
            <Button variant="outline" size="sm" onClick={() => fetchReportedPosts()} disabled={reportsLoading} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${reportsLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          {reportsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : reportedPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Flag className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No reported posts found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Posts that have been reported will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              {" "}
              <table className="min-w-full text-sm bg-white dark:bg-zinc-900 rounded-lg">
                <thead>
                  <tr className="border-b bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
                    <th className="py-3 px-4 text-left font-semibold">Post Title</th>
                    <th className="py-3 px-4 text-left font-semibold">Author</th>
                    <th className="py-3 px-4 text-left font-semibold">Reports Count</th>
                    <th className="py-3 px-4 text-left font-semibold">Latest Report</th>
                    <th className="py-3 px-4 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reportedPosts.map((post, idx) => (
                    <tr key={post.id} className={"border-b transition-colors " + (idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-800") + " hover:bg-fuchsia-50/60 dark:hover:bg-fuchsia-950/40"}>
                      <td className="py-2 px-4">{post.title || post.caption || "Untitled Post"}</td>
                      <td className="py-2 px-4">
                        @{post.username || post.user?.username || post.user?.profile?.username || post.user?.profile?.display_name || post.user?.name || post.author_username || post.email?.split("@")[0] || "[Deleted User]"}
                      </td>
                      <td className="py-2 px-4">
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <Flag className="h-3 w-3" />
                          {post.report_count || post.reports_count || 0}
                        </Badge>
                      </td>
                      <td className="py-2 px-4">
                        <div>
                          <p className="text-xs font-medium">{getReasonLabel(post.latest_report?.reason || post.latestReport?.reason)}</p>
                          <p className="text-xs text-muted-foreground">
                            {post.latest_report?.created_at || post.latestReport?.created_at
                              ? new Date(post.latest_report?.created_at || post.latestReport?.created_at).toLocaleDateString("id-ID", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })
                              : "No date"}
                          </p>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="hover:bg-blue-100 dark:hover:bg-blue-900" onClick={() => handleSeePost(post)} aria-label="View Post">
                            <Eye className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button size="icon" variant="ghost" className="hover:bg-red-100 dark:hover:bg-red-900" onClick={() => handleDelete(post.id)} aria-label="Delete Post">
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
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <div className="flex gap-2 items-center mb-2">
            <Input placeholder="Search reports..." value={reportSearch} onChange={(e) => setReportSearch(e.target.value)} className="max-w-xs" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchReports();
                fetchReportStats();
              }}
              disabled={reportsLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${reportsLoading ? "animate-spin" : ""}`} />
              Refresh{" "}
            </Button>
          </div>
          {/* Report Statistics */}
          {reportStats && Object.keys(reportStats).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Reports</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{reportStats.totalReports || 0}</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Pending</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{reportStats.pending || 0}</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Reviewed</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{reportStats.reviewed || 0}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Resolved</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{reportStats.resolved || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg border border-gray-200 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Dismissed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{reportStats.dismissed || 0}</p>
              </div>
            </div>
          )}
          {reportsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Flag className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No reports found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">{reportSearch ? "Try adjusting your search terms" : "All reports will appear here"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              {" "}
              <table className="min-w-full text-sm bg-white dark:bg-zinc-900 rounded-lg">
                <thead>
                  <tr className="border-b bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
                    <th className="py-3 px-4 text-left font-semibold">Post</th>
                    <th className="py-3 px-4 text-left font-semibold">Reporter</th>
                    <th className="py-3 px-4 text-left font-semibold">Reason</th>
                    <th className="py-3 px-4 text-left font-semibold">Status</th>
                    <th className="py-3 px-4 text-left font-semibold">Date</th>
                    <th className="py-3 px-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, idx) => (
                    <tr key={report.id} className={"border-b transition-colors " + (idx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-800") + " hover:bg-fuchsia-50/60 dark:hover:bg-fuchsia-950/40"}>
                      <td className="py-2 px-4">
                        <div>
                          <p className="font-medium truncate max-w-32">{report.post?.title || "Untitled Post"}</p>
                          <p className="text-xs text-muted-foreground">ID: {report.post?.id || "N/A"}</p>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        {report.reporter?.first_name} {report.reporter?.last_name}
                        <div className="text-xs text-muted-foreground">{report.reporter?.email}</div>
                      </td>
                      <td className="py-2 px-4">
                        <Badge variant="outline">{getReasonLabel(report.reason)}</Badge>
                      </td>
                      <td className="py-2 px-4">
                        <Badge variant={getStatusBadgeVariant(report.status)}>{report.status}</Badge>
                      </td>
                      <td className="py-2 px-4 text-xs">
                        <div>
                          <div className="font-medium">
                            {new Date(report.created_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </div>
                          <div className="text-muted-foreground">
                            {new Date(report.created_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="hover:bg-blue-100 dark:hover:bg-blue-900" onClick={() => handleViewReportDetails(report)} aria-label="View Details">
                            <Eye className="w-4 h-4 text-blue-500" />
                          </Button>
                          {report.status === "pending" && (
                            <>
                              <Button size="icon" variant="ghost" className="hover:bg-green-100 dark:hover:bg-green-900" onClick={() => handleUpdateReportStatus(report.id, "resolved")} aria-label="Resolve">
                                <Check className="w-4 h-4 text-green-500" />
                              </Button>
                              <Button size="icon" variant="ghost" className="hover:bg-gray-100 dark:hover:bg-gray-900" onClick={() => handleUpdateReportStatus(report.id, "dismissed")} aria-label="Dismiss">
                                <X className="w-4 h-4 text-gray-500" />
                              </Button>
                            </>
                          )}
                          <Button size="icon" variant="ghost" className="hover:bg-red-100 dark:hover:bg-red-900" onClick={() => handleDeleteReport(report.id)} aria-label="Delete">
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
        </TabsContent>
      </Tabs>
      {/* Comment Modal */}
      {selectedPost && (
        <CommentModal
          postId={selectedPost.id}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          postTitle={selectedPost.title}
          currentUser={null} // Admin, not posting
        />
      )}
      {/* Report Details Modal */}
      {selectedReport && (
        <Dialog open={reportDetailsOpen} onOpenChange={setReportDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-500" />
                Report Details
              </DialogTitle>
              <DialogDescription>Review the details of this report and take appropriate action.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Report Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Report ID</p>
                  <p className="text-sm">{selectedReport.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={getStatusBadgeVariant(selectedReport.status)}>{selectedReport.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reason</p>
                  <p className="text-sm">{getReasonLabel(selectedReport.reason)}</p>
                </div>{" "}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reported Date</p>
                  <div className="text-sm">
                    <div className="font-medium">
                      {new Date(selectedReport.created_at).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(selectedReport.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </div>
                  </div>
                </div>
              </div>{" "}
              {/* Reporter Info */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Reporter</p>{" "}
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">
                    {selectedReport.reporter?.first_name} {selectedReport.reporter?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedReport.reporter?.email}</p>
                </div>
              </div>
              {/* Post Info */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Reported Post</p>{" "}
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedReport.post?.title || "Untitled Post"}</p>
                  <p className="text-sm text-muted-foreground">
                    Post ID: {selectedReport.post?.id} | Type: {selectedReport.post?.type || "N/A"}
                  </p>
                  {selectedReport.post?.description && <p className="text-xs text-muted-foreground mt-2">{selectedReport.post.description}</p>}
                </div>
              </div>
              {/* Additional Information */}
              {selectedReport.additional_info && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Additional Information</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedReport.additional_info}</p>
                  </div>
                </div>
              )}
              {/* Actions */}
              {selectedReport.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleUpdateReportStatus(selectedReport.id, "resolved");
                      setReportDetailsOpen(false);
                    }}
                    className="flex-1"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Mark as Resolved
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleUpdateReportStatus(selectedReport.id, "dismissed");
                      setReportDetailsOpen(false);
                    }}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Dismiss Report
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
