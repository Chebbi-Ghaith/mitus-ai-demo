import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRiskColor(risk: string) {
  switch (risk?.toLowerCase()) {
    case 'high': return 'text-destructive border-destructive/30 bg-destructive/10';
    case 'medium': return 'text-warning border-warning/30 bg-warning/10';
    case 'low': return 'text-success border-success/30 bg-success/10';
    default: return 'text-muted-foreground border-border bg-muted/50';
  }
}

export function formatStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'active': return 'text-primary border-primary/30 bg-primary/10';
    case 'injured': return 'text-destructive border-destructive/30 bg-destructive/10';
    case 'recovering': return 'text-warning border-warning/30 bg-warning/10';
    default: return 'text-muted-foreground border-border bg-muted/50';
  }
}
