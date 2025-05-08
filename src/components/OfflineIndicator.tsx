import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Toast, ToastClose } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Keep the toast visible for a moment after coming back online
      setTimeout(() => setVisible(false), 2000);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setVisible(true);
    };
    
    // Initial check
    setIsOffline(!navigator.onLine);
    setVisible(!navigator.onLine);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!visible) return null;

  return (
    <Toast 
      className={cn(
        "fixed bottom-4 right-4 w-auto max-w-md border-destructive",
        isOffline ? "bg-destructive text-destructive-foreground" : "bg-green-600 text-white"
      )}
    >
      <div className="flex items-center gap-2">
        {isOffline ? (
          <>
            <WifiOff className="h-4 w-4" />
            <div>You're offline. Changes won't be saved to the server.</div>
          </>
        ) : (
          <div>You're back online! Changes will be synchronized.</div>
        )}
      </div>
      <ToastClose />
    </Toast>
  );
}
