// components/NotificationSoundToggle.jsx
import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import notificationSocket from "@/services/notificationSocket";
import { toast } from "sonner";

export default function NotificationSoundToggle() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioStatus, setAudioStatus] = useState({});

  useEffect(() => {
    // Get initial sound preference
    setSoundEnabled(notificationSocket.getSoundPreference());
    setAudioStatus(notificationSocket.getAudioStatus());

    // Update audio status periodically
    const interval = setInterval(() => {
      setAudioStatus(notificationSocket.getAudioStatus());
    }, 2000);

    return () => clearInterval(interval);
  }, []);
  const toggleSound = async () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    notificationSocket.setSoundPreference(newState);

    // Initialize audio if enabling and not already done
    if (newState && !audioStatus.hasUserInteracted) {
      try {
        await notificationSocket.initializeAudio();
        setAudioStatus(notificationSocket.getAudioStatus());
        toast.success("Notification sounds enabled and audio initialized");
      } catch (error) {
        toast.error("Failed to initialize audio");
        return;
      }
    } else {
      toast.success(`Notification sounds ${newState ? "enabled" : "disabled"}`);
    }

    // Test sound if enabling
    if (newState) {
      setTimeout(() => {
        notificationSocket.playNotificationSound();
      }, 100);
    }
  };

  const testSound = () => {
    notificationSocket.playNotificationSound();
    toast.info("Playing test notification sound");
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={toggleSound} className={`h-8 w-8 p-0 ${soundEnabled ? "text-green-600" : "text-gray-400"}`}>
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p>{soundEnabled ? "Disable" : "Enable"} notification sounds</p>
              {!audioStatus.hasUserInteracted && <p className="text-xs text-muted-foreground mt-1">Click to enable audio</p>}
            </div>
          </TooltipContent>
        </Tooltip>

        {soundEnabled && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={testSound} className="h-8 w-8 p-0 text-blue-600">
                <Play className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Test notification sound</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Audio Status Badge (for debugging) */}
        {/*
        {process.env.NODE_ENV === 'development' && (
          <Badge 
            variant={audioStatus.hasUserInteracted ? "default" : "secondary"}
            className="text-xs"
          >
            {audioStatus.hasUserInteracted ? "Audio Ready" : "Need Interaction"}
          </Badge>
        )}
        */}
      </div>
    </TooltipProvider>
  );
}
