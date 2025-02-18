"use client";

import { ReactNode } from 'react';

interface ClientComponentWrapperProps {
  children: ReactNode;
}

export default function ClientComponentWrapper({ children }: ClientComponentWrapperProps) {
  return <>{children}</>;
} 