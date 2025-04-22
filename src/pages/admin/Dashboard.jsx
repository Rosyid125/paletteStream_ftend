import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, FileText, AlertCircle, BarChart2 } from "lucide-react";

export default function AdminDashboard() {
  // Dummy data - replace with API calls
  const stats = [
    { title: "Total Users", value: "1,234", icon: <Users className="h-6 w-6" />, trend: "+12%" },
    { title: "Total Posts", value: "5,678", icon: <FileText className="h-6 w-6" />, trend: "+5%" },
    { title: "Reported Content", value: "23", icon: <AlertCircle className="h-6 w-6" />, trend: "-3%" },
    { title: "Active Sessions", value: "89", icon: <BarChart2 className="h-6 w-6" />, trend: "+8%" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.trend} from last week</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Activity logs will go here */}
            <div className="space-y-4">
              <div className="border-b pb-2">
                <p className="text-sm">New user registered: johndoe</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm">Post reported: "Summer Artwork"</p>
                <p className="text-xs text-muted-foreground">4 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <button className="p-3 border rounded-md hover:bg-muted">
              <Users className="h-5 w-5 mx-auto mb-1" />
              <span className="text-sm">Manage Users</span>
            </button>
            <button className="p-3 border rounded-md hover:bg-muted">
              <FileText className="h-5 w-5 mx-auto mb-1" />
              <span className="text-sm">View Posts</span>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
