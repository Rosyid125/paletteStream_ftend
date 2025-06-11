// components/WebSocketStatus.jsx
import React from "react";
import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNotifications } from "@/contexts/NotificationContext";

export default function WebSocketStatus() {
  const { isConnected } = useNotifications();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={isConnected ? "default" : "destructive"} className="h-6 px-2 flex items-center gap-1">
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span className="text-xs">{isConnected ? "Online" : "Offline"}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isConnected ? "Real-time notifications active" : "Connection lost - notifications may be delayed"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
