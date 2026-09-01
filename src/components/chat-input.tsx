"use client";
import * as React from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = React.useState("");
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit(value.trim());
        setValue("");
      }
    }
  };

  return (
    <div className="relative flex w-full items-center">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask TMSL AI anything about your college..."
        className="min-h-[60px] w-full resize-none pr-14 py-4"
        disabled={disabled}
        rows={1}
      />
      <div className="absolute right-2 bottom-2">
        <Button
          size="icon"
          disabled={!value.trim() || disabled}
          onClick={() => {
            onSubmit(value.trim());
            setValue("");
          }}
          className="h-8 w-8"
        >
          {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}