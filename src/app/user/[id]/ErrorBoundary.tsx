"use client";

import { Component, ErrorInfo } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={cn(
          "min-h-screen flex items-center justify-center",
          "bg-cyber-darker p-4"
        )}>
          <div className={cn(
            "max-w-md w-full",
            "bg-cyber-black rounded-lg",
            "border border-cyber-red",
            "shadow-neon-red",
            "p-8",
            "text-center"
          )}>
            <AlertTriangle className={cn(
              "w-12 h-12 mx-auto mb-4",
              "text-cyber-red",
              "animate-pulse"
            )} />
            <h1 className={cn(
              "text-2xl font-cyber text-cyber-red mb-4",
              "animate-neon-pulse"
            )}>
              エラーが発生しました
            </h1>
            <p className="text-cyber-red/80 font-cyber mb-6">
              {this.state.error?.message || '予期せぬエラーが発生しました'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className={cn(
                "px-6 py-2 rounded",
                "bg-cyber-darker",
                "border border-cyber-red",
                "text-cyber-red font-cyber",
                "hover:bg-cyber-red hover:text-cyber-black",
                "transition-colors duration-300"
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