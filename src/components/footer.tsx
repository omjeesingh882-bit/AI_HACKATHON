import * as React from "react";
import { Snowflake } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t py-6 md:py-8 bg-muted/20 mt-auto">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-muted-foreground font-medium">
          Built for MLH Hack Days — Best Use of Snowflake
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Powered by Snowflake AI</span>
          <Snowflake className="h-4 w-4 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground/60 mt-2">
          © {new Date().getFullYear()} TMSL AI
        </p>
      </div>
    </footer>
  );
}