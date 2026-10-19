import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

type Props = {
  /** What crashed, in the reader's words ("Timeline"). Shown in the message and logged. */
  name: string;
  /** Replaces the default message. */
  fallback?: (error: Error) => ReactNode;
  /** Called after the error is logged, for reporting. */
  onError?: (error: Error, info: ErrorInfo) => void;
  children: ReactNode;
};
type State = { error: Error | null };

/**
 * One panel's crash shows an error in that panel instead of blanking the whole page.
 *
 *   <ErrorBoundary name="Timeline"><Timeline /></ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`${this.props.name} panel crashed`, error, info.componentStack);
    this.props.onError?.(error, info);
  }

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error);
    return (
      <div
        role="alert"
        className="rounded-md border border-destructive/40 bg-card p-4 text-card-foreground"
      >
        <b>{this.props.name} stopped working.</b>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message || "Unexpected error"}. The rest of the page still works; reload the page
          to try this panel again.
        </p>
      </div>
    );
  }
}
