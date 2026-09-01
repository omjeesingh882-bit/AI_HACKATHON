"use client";

import { useState, useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { ChatMessage as ChatMessageType, QuerySource } from '@/lib/types';
import { ChatMessage } from '@/components/chat-message';
import { ChatInput } from '@/components/chat-input';
import { SuggestedQuestions } from '@/components/suggested-questions';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\u2019m the **TMSL AI Assistant**. I can help you find information about college notices, events, exams, hackathons, and guidelines. What would you like to know?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (question: string) => {
    if (!question.trim()) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to get a response');
      }

      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.data.answer,
        sources: data.data.sources as QuerySource[],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${message}. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#29B5E8] text-white">
                <Bot className="h-6 w-6 animate-pulse" />
              </div>
              <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 sm:max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-slate-300" />
                </div>
              </div>
            </div>
          )}

          {messages.length === 1 && !isLoading && (
            <div className="mt-8">
              <SuggestedQuestions onSelect={handleSubmit} />
            </div>
          )}
        </div>
      </div>

      {/* Chat input */}
      <div className="border-t bg-white p-4 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl">
          <ChatInput onSubmit={handleSubmit} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
