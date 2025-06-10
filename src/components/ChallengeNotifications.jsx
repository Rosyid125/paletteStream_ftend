import { useEffect, useState } from "react";
import { Bell, Trophy, Crown, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function ChallengeNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Mock notifications for now - in real app, these would come from backend
  useEffect(() => {
    if (user) {
      // Simulate notifications
      const mockNotifications = [
        {
          id: 1,
          type: "challenge_winner",
          title: "Congratulations! You won a challenge!",
          message: "You've been selected as a winner for 'Anime Art Challenge'",
          icon: Crown,
          color: "text-yellow-500",
          time: "2 hours ago",
          read: false,
        },
        {
          id: 2,
          type: "challenge_deadline",
          title: "Challenge deadline approaching",
          message: "Digital Art Contest ends in 24 hours",
          icon: Trophy,
          color: "text-blue-500",
          time: "1 day ago",
          read: false,
        },
        {
          id: 3,
          type: "challenge_new",
          title: "New challenge available",
          message: "Portrait Drawing Challenge is now open for submissions",
          icon: Award,
          color: "text-green-500",
          time: "3 days ago",
          read: true,
        },
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter((n) => !n.read).length);
    }
  }, [user]);

  const markAsRead = (notificationId) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Challenge Notifications
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-auto p-1">
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <ScrollArea className="h-64">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => {
                const IconComponent = notification.icon;
                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`
                      p-3 cursor-pointer focus:bg-muted/50
                      ${!notification.read ? "bg-primary/5" : ""}
                    `}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3 w-full">
                      <div className={`p-2 rounded-full bg-muted/50 ${notification.color}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4
                            className={`
                            text-sm font-medium truncate
                            ${!notification.read ? "font-semibold" : ""}
                          `}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1 ml-2" />}
                        </div>

                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>

                        <span className="text-xs text-muted-foreground mt-1">{notification.time}</span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center justify-center">
              <Button variant="ghost" size="sm" className="w-full">
                View all notifications
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
