"use client";

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ClientComponentWrapperProps {
  children: ReactNode;
}

export default function ClientComponentWrapper({ children }: ClientComponentWrapperProps) {
  return (
    <div className={cn(
      "fixed inset-0 pointer-events-none z-50",
      "bg-cyber-grid bg-[length:20px_20px]",
      "animate-matrix-bg"
    )}>
      <div className="pointer-events-auto">
        {children}
      </div>
    </div>
  );
} 