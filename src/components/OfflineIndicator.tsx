
import { WifiOff } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className={cn(
      "fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-md",
      "bg-destructive text-destructive-foreground shadow-md animate-pulse"
    )}>
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">You are offline</span>
    </div>
  );
}
