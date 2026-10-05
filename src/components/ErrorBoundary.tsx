import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  moduleName?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  userFriendlyMessage: string;
}

/**
 * Enterprise React Error Boundary
 * Prevents UI crashes across surveillance modules (Map, Live Feeds, Telemetry)
 * from crashing the entire application.
 * Never exposes raw stack traces, API keys, or internal tokens.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    userFriendlyMessage: '',
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Generate clean, safe, non-revealing message
    const rawMsg = error?.message || '';
    let cleanMessage = 'An unexpected render or telemetry synchronization anomaly occurred in this module.';

    if (rawMsg.includes('Leaflet') || rawMsg.includes('map')) {
      cleanMessage = 'GIS Map rendering encountered an initialization or tile container error. Please retry.';
    } else if (rawMsg.includes('camera') || rawMsg.includes('MediaStream')) {
      cleanMessage = 'Camera hardware feed interface encountered a device access interruption.';
    } else if (rawMsg.includes('network') || rawMsg.includes('fetch')) {
      cleanMessage = 'Remote sensor network synchronization was temporarily interrupted.';
    }

    return {
      hasError: true,
      userFriendlyMessage: cleanMessage,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Safe logging without exposing secrets
    console.error(`[Surveillance System ErrorBoundary] Caught in ${this.props.moduleName || 'Module'}:`, {
      message: error?.message,
      componentStack: errorInfo?.componentStack?.slice(0, 300),
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, userFriendlyMessage: '' });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-4 my-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-700/60 text-red-400 mx-auto flex items-center justify-center">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              {this.props.fallbackTitle || `${this.props.moduleName || 'Module'} Unavailable`}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {this.state.userFriendlyMessage}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-950"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Module</span>
            </button>

            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Reload Application</span>
            </button>
          </div>

          <div className="text-[10px] text-slate-500 font-mono pt-2">
            Automated conflict alert telemetry daemon continues background operations.
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
