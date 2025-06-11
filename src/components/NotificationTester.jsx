// components/NotificationTester.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/contexts/NotificationContext";
import { toast } from "sonner";

export default function NotificationTester() {
  const { socket } = useNotifications();

  const sendTestNotification = (type) => {
    if (!socket) {
      toast.error("WebSocket not connected");
      return;
    }

    // Test notifications data
    const testNotifications = {
      like: {
        id: Date.now(),
        type: "like",
        title: "Post Liked",
        message: 'john_doe liked your post "Amazing Anime Art"',
        data: {
          post_id: 789,
          from_user_id: 101,
          from_username: "john_doe",
          post_title: "Amazing Anime Art",
        },
        redirect_url: "/home?post=789",
        is_read: false,
        created_at: new Date().toISOString(),
      },
      comment: {
        id: Date.now(),
        type: "comment",
        title: "New Comment",
        message: 'jane_doe commented on your post "Cool Drawing"',
        data: {
          post_id: 456,
          comment_id: 123,
          from_user_id: 202,
          from_username: "jane_doe",
          post_title: "Cool Drawing",
          comment_content: "This is amazing!",
        },
        redirect_url: "/home?post=456&comment=123",
        is_read: false,
        created_at: new Date().toISOString(),
      },
      follow: {
        id: Date.now(),
        type: "follow",
        title: "New Follower",
        message: "mikasa_fan started following you",
        data: {
          from_user_id: 404,
          from_username: "mikasa_fan",
        },
        redirect_url: "/profile/404",
        is_read: false,
        created_at: new Date().toISOString(),
      },
      achievement_unlocked: {
        id: Date.now(),
        type: "achievement_unlocked",
        title: "Achievement Unlocked!",
        message: 'You unlocked "First Post" achievement!',
        data: {
          achievement_id: 1,
          achievement_name: "First Post",
          achievement_description: "Create your first post",
          achievement_icon: "🎯",
        },
        redirect_url: "/profile/456?tab=achievements",
        is_read: false,
        created_at: new Date().toISOString(),
      },
      level_up: {
        id: Date.now(),
        type: "level_up",
        title: "Level Up!",
        message: "Congratulations! You reached level 5",
        data: {
          new_level: 5,
          previous_level: 4,
          exp_required: 1000,
          current_exp: 1050,
        },
        redirect_url: "/profile/456?tab=stats",
        is_read: false,
        created_at: new Date().toISOString(),
      },
      challenge_winner: {
        id: Date.now(),
        type: "challenge_winner",
        title: "Challenge Winner!",
        message: 'You won 1st place in "Weekly Anime Art" challenge!',
        data: {
          challenge_id: 123,
          challenge_title: "Weekly Anime Art",
          rank: 1,
          prize: "500 EXP + Gold Badge",
        },
        redirect_url: "/challenges/123",
        is_read: false,
        created_at: new Date().toISOString(),
      },
      mention: {
        id: Date.now(),
        type: "mention",
        title: "You were mentioned",
        message: "naruto_fan mentioned you in a comment",
        data: {
          post_id: 456,
          comment_id: 123,
          from_user_id: 707,
          from_username: "naruto_fan",
          post_title: "Hokage Art",
          comment_content: "Hey @your_username, check this out!",
        },
        redirect_url: "/home?post=456&comment=123",
        is_read: false,
        created_at: new Date().toISOString(),
      },
      system: {
        id: Date.now(),
        type: "system",
        title: "System Announcement",
        message: "Welcome to PaletteStream! Start sharing your art today.",
        data: {
          announcement_type: "welcome",
          priority: "normal",
        },
        redirect_url: "/home",
        is_read: false,
        created_at: new Date().toISOString(),
      },
    };

    const notification = testNotifications[type];
    if (notification) {
      // Simulate receiving notification via WebSocket
      socket.emit("test_notification", notification);
      toast.success(`Test ${type} notification sent!`);
    }
  };

  const notificationTypes = [
    { key: "like", label: "Like", icon: "❤️" },
    { key: "comment", label: "Comment", icon: "💬" },
    { key: "follow", label: "Follow", icon: "👥" },
    { key: "achievement_unlocked", label: "Achievement", icon: "🏆" },
    { key: "level_up", label: "Level Up", icon: "⬆️" },
    { key: "challenge_winner", label: "Challenge Winner", icon: "🥇" },
    { key: "mention", label: "Mention", icon: "📌" },
    { key: "system", label: "System", icon: "🔔" },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Notification Tester
          <Badge variant="secondary">Development Only</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Test different types of notifications. These will trigger toast notifications and update the notification dropdown.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {notificationTypes.map(({ key, label, icon }) => (
            <Button key={key} variant="outline" size="sm" onClick={() => sendTestNotification(key)} className="flex flex-col items-center gap-2 h-auto py-3" disabled={!socket}>
              <span className="text-lg">{icon}</span>
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>

        {!socket && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">WebSocket not connected. Please check your connection.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
