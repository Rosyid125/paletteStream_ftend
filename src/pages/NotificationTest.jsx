// pages/NotificationTest.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import NotificationTester from "@/components/NotificationTester";
import { useNotifications } from "@/contexts/NotificationContext";
import { Bell, WifiOff, Wifi } from "lucide-react";

export default function NotificationTest() {
  const { notifications, unreadCount, socket, loadNotifications, markAllAsRead, cleanupDuplicates } = useNotifications();

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Notification Testing</h1>
            <p className="text-muted-foreground">Test and monitor the notification system</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={socket ? "default" : "destructive"} className="flex items-center gap-1">
            {socket ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {socket ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Tester */}
        <div className="space-y-6">
          <NotificationTester />

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">WebSocket Status</span>
                <Badge variant={socket ? "default" : "destructive"}>{socket ? "Connected" : "Disconnected"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Notifications</span>
                <Badge variant="secondary">{notifications.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Unread Count</span>
                <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>{unreadCount}</Badge>
              </div>
              <Separator />{" "}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => loadNotifications()}>
                  Refresh
                </Button>

                <Button variant="outline" size="sm" onClick={cleanupDuplicates}>
                  Fix Duplicates
                </Button>

                {unreadCount > 0 && (
                  <Button variant="destructive" size="sm" onClick={markAllAsRead}>
                    Mark All Read
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Notification List */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs mt-1">Use the tester to create some notifications</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.slice(0, 10).map((notification, index) => (
                    <div key={`notification-${notification.id}-${index}`} className={`p-3 border rounded-lg ${!notification.is_read ? "border-primary bg-primary/5" : ""}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className={`text-sm font-medium ${!notification.is_read ? "font-semibold" : ""}`}>{notification.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {notification.type}
                        </Badge>
                      </div>{" "}
                      <p className="text-xs text-muted-foreground mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {(() => {
                            try {
                              const date = new Date(notification.created_at);
                              return isNaN(date.getTime()) ? "Just now" : date.toLocaleTimeString();
                            } catch (error) {
                              return "Just now";
                            }
                          })()}
                        </span>

                        {!notification.is_read && <div className="w-2 h-2 bg-primary rounded-full" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Debug Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="font-semibold">Socket URL:</span> {import.meta.env.VITE_SOCKET_URL}
                </div>
                <div>
                  <span className="font-semibold">API URL:</span> {import.meta.env.VITE_API_URL}
                </div>
                <div>
                  <span className="font-semibold">Socket ID:</span> {socket?.id || "Not connected"}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
