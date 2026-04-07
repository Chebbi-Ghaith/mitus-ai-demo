import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 glass-panel border-primary/20">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-3 items-start">
            <AlertCircle className="h-8 w-8 text-rose shrink-0 mt-1" />
            <div>
              <h1 className="text-2xl font-bold text-foreground font-display">
                404 Page Not Found
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
          </div>

          <Link href="/">
            <Button className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
