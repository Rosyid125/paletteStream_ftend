// hooks/useNotificationHandler.js
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useNotificationHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Handle post highlighting
    const postId = params.get("post");
    const commentId = params.get("comment");

    if (postId) {
      // Delay to ensure DOM is ready
      setTimeout(() => {
        const postElement = document.getElementById(`post-${postId}`);
        if (postElement) {
          postElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          // Add highlight class
          postElement.classList.add("notification-highlight");

          // Remove highlight after animation
          setTimeout(() => {
            postElement.classList.remove("notification-highlight");
          }, 3000);

          // Handle comment highlighting
          if (commentId) {
            setTimeout(() => {
              const commentElement = document.getElementById(`comment-${commentId}`);
              if (commentElement) {
                commentElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });

                commentElement.classList.add("notification-highlight");
                setTimeout(() => {
                  commentElement.classList.remove("notification-highlight");
                }, 3000);
              }
            }, 500);
          }
        }
      }, 100);
    }

    // Handle profile tabs
    const tab = params.get("tab");
    if (tab && location.pathname.includes("/profile/")) {
      setTimeout(() => {
        const tabElement = document.querySelector(`[data-tab="${tab}"]`);
        if (tabElement) {
          tabElement.click();
        }
      }, 100);
    }

    // Handle chat user selection
    const userId = params.get("user");
    if (userId && location.pathname === "/chat") {
      // This would need to be implemented based on your chat component structure
      // Example: selectChatUser(userId);
      console.log("Select chat user:", userId);
    }

    // Handle challenge highlighting
    const challengeId = params.get("challenge");
    if (challengeId && location.pathname.includes("/challenges")) {
      setTimeout(() => {
        const challengeElement = document.getElementById(`challenge-${challengeId}`);
        if (challengeElement) {
          challengeElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          challengeElement.classList.add("notification-highlight");
          setTimeout(() => {
            challengeElement.classList.remove("notification-highlight");
          }, 3000);
        }
      }, 100);
    }
  }, [location, navigate]);
};

// CSS classes for highlighting (add to your global CSS)
export const notificationHighlightStyles = `
.notification-highlight {
  animation: notificationGlow 3s ease-in-out;
  border: 2px solid hsl(var(--primary));
  border-radius: 8px;
}

@keyframes notificationGlow {
  0% {
    box-shadow: 0 0 0 0 hsla(var(--primary), 0.7);
    background-color: hsla(var(--primary), 0.1);
  }
  50% {
    box-shadow: 0 0 0 10px hsla(var(--primary), 0);
    background-color: hsla(var(--primary), 0.05);
  }
  100% {
    box-shadow: 0 0 0 0 hsla(var(--primary), 0);
    background-color: transparent;
  }
}
`;
