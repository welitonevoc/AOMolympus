import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-lg border border-amber-400/50 bg-[#1a150a]/95 px-3 py-1.5 text-xs font-medium text-amber-200 shadow-lg backdrop-blur-sm"
    >
      <WifiOff className="h-3.5 w-3.5 text-amber-400 shrink-0" />
      <span>Modo Offline — usando dados em cache</span>
    </div>
  );
};
