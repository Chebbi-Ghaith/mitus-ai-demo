import { AlertTriangle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";

interface ErrorStateProps {
  /**
   * The error object or message to display
   */
  error?: Error | { message?: string } | string | null;

  /**
   * Optional custom title for the error
   * @default "Failed to load data"
   */
  title?: string;

  /**
   * Optional retry callback function
   * If provided, shows a retry button
   */
  onRetry?: () => void;

  /**
   * Optional custom retry button text
   * @default "Try Again"
   */
  retryText?: string;

  /**
   * Show the retry button in loading state
   */
  isRetrying?: boolean;

  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * Reusable error state component with glassmorphic styling
 * Follows the Mitus AI design system
 */
export function ErrorState({
  error,
  title = "Failed to load data",
  onRetry,
  retryText = "Try Again",
  isRetrying = false,
  className,
}: ErrorStateProps) {
  const errorMessage =
    typeof error === "string"
      ? error
      : error?.message || "An unexpected error occurred. Please try again.";

  return (
    <Alert
      variant="destructive"
      className={cn(
        "border-rose-500/20 bg-rose-950/20 backdrop-blur-sm",
        className,
      )}
    >
      <AlertTriangle className="h-5 w-5 text-rose-400" />
      <AlertTitle className="text-rose-200">{title}</AlertTitle>
      <AlertDescription className="text-rose-300/80">
        <p className="mb-3">{errorMessage}</p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="border-rose-500/30 bg-rose-950/40 hover:bg-rose-900/60 text-rose-200"
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", isRetrying && "animate-spin")}
            />
            {retryText}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Helper function for cn (import from utils)
import { cn } from "@/lib/utils";
