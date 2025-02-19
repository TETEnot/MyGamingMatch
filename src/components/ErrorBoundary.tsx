"use client";

import React, { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cyber-black flex items-center justify-center p-4">
          <div className={cn(
            "max-w-md w-full",
            "bg-cyber-darker rounded-lg",
            "border border-cyber-accent",
            "shadow-neon-card",
            "p-8 text-center"
          )}>
            <AlertTriangle className="w-16 h-16 text-cyber-accent mx-auto mb-4" />
            <h1 className={cn(
              "text-2xl font-cyber text-cyber-green mb-4",
              "animate-neon-pulse"
            )}>
              エラーが発生しました
            </h1>
            {this.state.error && (
              <p className="text-cyber-green/70 font-cyber mb-6">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className={cn(
                "px-6 py-2 rounded-lg",
                "bg-cyber-darker",
                "border border-cyber-green",
                "text-cyber-green font-cyber",
                "hover:bg-cyber-green hover:text-cyber-black",
                "transition-all duration-300",
                "shadow-neon-green"
              )}
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 