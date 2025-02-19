"use client";

import { cn } from '@/lib/utils';

interface ClientComponentWrapperProps {
  children: React.ReactNode;
}

export default function ClientComponentWrapper({ children }: ClientComponentWrapperProps) {
  return (
    <div className={cn(
      "min-h-screen",
      "bg-cyber-darker",
      "text-cyber-green"
    )}>
      {children}
    </div>
  );
}