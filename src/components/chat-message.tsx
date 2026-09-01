"use client";
import * as React from "react";
import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage as IChatMessage } from "@/lib/types";
import { SourceCitation } from "./source-citation";
import { motion } from "framer-motion";

export function ChatMessage({ message }: { message: IChatMessage }) {
  const isUser = message.role === "user";

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch { return ''; }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex w-full mb-6", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex max-w-[80%] gap-4", isUser ? "flex-row-reverse" : "flex-row")}>
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow">
          {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5 text-primary" />}
        </div>
        <div className={cn("flex flex-col gap-2", isUser ? "items-end" : "items-start")}>
          <div
            className={cn(
              "rounded-lg px-4 py-3 text-sm shadow-sm whitespace-pre-wrap",
              isUser ? "bg-primary text-primary-foreground" : "bg-card border text-card-foreground"
            )}
          >
            {message.content}
          </div>
          {message.sources && message.sources.length > 0 && (
            <div className="flex flex-col gap-2 mt-2 w-full max-w-md">
              <span className="text-xs font-semibold text-muted-foreground">Sources:</span>
              <div className="flex flex-col gap-2">
                {message.sources.map((source, idx) => (
                  <SourceCitation key={idx} source={source} />
                ))}
              </div>
            </div>
          )}
          <span className="text-xs text-muted-foreground mt-1">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}