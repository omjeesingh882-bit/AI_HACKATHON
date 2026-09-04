"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  FileText,
  Search,
  MessageSquare,
  Sparkles,
  Clock,
  MapPin,
  Building,
  Check,
  ArrowRight,
  ChevronRight,
  Filter,
  CheckCircle,
  Send,
  Loader2,
  Info,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { EventData, Document } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { formatDate, formatRelativeDate, getCategoryColor, truncateText } from '@/lib/utils';

export default function StudentPanelPage() {
  const router = useRouter();
  const { user, isStudent, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'notices' | 'events' | 'ai-chat'>('notices');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedEvents, setBookmarkedEvents] = useState<string[]>([]);

  // AI Assistant mini chat state
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);
  const [isAskingAI, setIsAskingAI] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        const [docsRes, eventsRes] = await Promise.all([
          fetch('/api/documents'),
          fetch('/api/events'),
        ]);

        const [docsData, eventsData] = await Promise.all([
          docsRes.json(),
          eventsRes.json(),
        ]);

        if (docsData.success) setDocuments(docsData.data || []);
        if (eventsData.success) setEvents(eventsData.data || []);
      } catch (e) {
        console.error('Failed to load student dashboard data', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();

    // Load saved bookmarks from localStorage
    try {
      const saved = localStorage.getItem('tmsl_saved_events');
      if (saved) setBookmarkedEvents(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const toggleBookmark = (eventId: string, title: string) => {
    let updated: string[];
    if (bookmarkedEvents.includes(eventId)) {
      updated = bookmarkedEvents.filter((id) => id !== eventId);
      toast({ title: 'Bookmark Removed', description: `Removed "${title}" from your saved events.` });
    } else {
      updated = [...bookmarkedEvents, eventId];
      toast({ title: 'Event Saved! 📌', description: `Saved "${title}" to your schedule.` });
    }
    setBookmarkedEvents(updated);
    localStorage.setItem('tmsl_saved_events', JSON.stringify(updated));
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuestion.trim()) return;

    setIsAskingAI(true);
    setChatAnswer(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: chatQuestion }),
      });

      const data = await res.json();
      if (data.success && data.data?.answer) {
        setChatAnswer(data.data.answer);
      } else {
        setChatAnswer(data.error || 'Unable to find an answer in the institutional documents.');
      }
    } catch (error) {
      setChatAnswer('Error querying the AI knowledge engine.');
    } finally {
      setIsAskingAI(false);
    }
  };

  const studentName = user?.name || 'Student';
  const studentDept = user?.department || 'Computer Science & Engineering';
  const studentRoll = user?.rollNumber || 'TMSL-2026';
  const studentYear = user?.year || 'Enrolled Student';

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.content && doc.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || evt.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (!authLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <Card className="p-8 shadow-xl border-slate-200 dark:border-slate-800">
          <div className="mx-auto w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-4 text-[#29B5E8]">
            <BookOpen className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold mb-2">Student Portal Access</CardTitle>
          <CardDescription className="text-sm mb-6">
            Sign in to your student account or create a new one to access your personalized institutional syllabus, notices, campus events, and AI assistant.
          </CardDescription>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white font-semibold">
              <Link href="/login?role=student">Sign In as Student</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/register">Create Student Account</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full text-xs text-muted-foreground">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Student Profile & Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-2xl border bg-gradient-to-r from-blue-600 via-[#29B5E8] to-blue-700 p-6 md:p-8 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-15">
          <BookOpen className="h-64 w-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Student Hub
              </Badge>
              <Badge className="bg-black/20 text-white border-0 font-mono text-xs">
                {studentRoll}
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Hello, {studentName} 👋
            </h1>
            <p className="mt-1 text-sm text-blue-100 max-w-2xl">
              {studentDept} • {studentYear}
            </p>
            <p className="mt-2 text-xs text-blue-100/90 flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Synchronized with Admin notices, events, and syllabus documents.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" className="bg-white text-blue-600 hover:bg-blue-50 border-0 font-semibold shadow-md">
              <Link href="/chat">
                <Sparkles className="mr-2 h-4 w-4 text-[#29B5E8]" /> Ask AI Assistant
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
              <Link href="/events">
                <Calendar className="mr-2 h-4 w-4" /> All Events
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-3 w-full md:w-[420px]">
            <TabsTrigger value="notices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notices ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events ({events.length})
            </TabsTrigger>
            <TabsTrigger value="ai-chat" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#29B5E8]" />
              Ask AI
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab !== 'ai-chat' && (
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab}...`}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: NOTICES & CIRCULARS (UPLOADED BY ADMIN - VISIBLE TO ALL STUDENTS) */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#29B5E8]" /> Official College Notices & Circulars
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Official documents published by Admin & Departments, automatically summarized by AI.
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {filteredDocs.length} Notices Available
            </Badge>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredDocs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocs.map((doc) => (
                <Card key={doc.document_id} className="flex flex-col h-full hover:shadow-lg transition-all border-l-4 border-l-[#29B5E8]">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getCategoryColor(doc.category)} variant="outline">
                        {doc.category.toUpperCase()}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {formatRelativeDate(doc.created_at)}
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold line-clamp-2 leading-snug">
                      {doc.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Published by {doc.department}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4 text-xs text-muted-foreground">
                    <p className="line-clamp-3">
                      {doc.content || 'Official institutional document indexed into TMSL AI.'}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-2 pb-4 border-t flex justify-between items-center bg-muted/20">
                    <Button asChild variant="ghost" size="sm" className="text-xs font-semibold text-[#29B5E8] hover:text-[#29B5E8]/80 p-0">
                      <Link href={`/documents/${doc.document_id}`} className="flex items-center gap-1">
                        Read Notice & AI Summary <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="text-xs h-7">
                      <Link href={`/chat?q=${encodeURIComponent(`Summarize ${doc.title}`)}`}>
                        <Sparkles className="h-3 w-3 mr-1 text-[#29B5E8]" /> Ask
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border rounded-2xl bg-slate-50 dark:bg-slate-900/50">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-bold">No Notices Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                No documents match your search. Notices uploaded by the Admin will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EVENTS & ACTIVITIES (ADDED BY ADMIN - VISIBLE TO ALL STUDENTS) */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#29B5E8]" /> Upcoming Campus Events & Competitions
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hackathons, workshops, placement drives, and exams published by Admin.
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {filteredEvents.length} Events Active
            </Badge>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => {
                const isSaved = bookmarkedEvents.includes(event.event_id);
                return (
                  <Card
                    key={event.event_id}
                    className="flex flex-col h-full hover:shadow-lg transition-all border-l-4 border-l-primary/70"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className={getCategoryColor(event.category)} variant="outline">
                          {event.category.toUpperCase()}
                        </Badge>
                          {isSaved ? (
                            <Check className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <Check className="h-5 w-5 opacity-40 hover:opacity-100" />
                          )}
                      </div>
                      <CardTitle className="text-lg font-bold leading-tight line-clamp-2">
                        {event.title}
                      </CardTitle>
                      {event.registration_deadline && (
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-[10px] flex items-center gap-1 w-max">
                            <Clock className="h-3 w-3" />
                            Reg Deadline: {formatDate(event.registration_deadline)}
                          </Badge>
                        </div>
                      )}
                    </CardHeader>

                    <CardContent className="flex-1 pb-4 text-sm space-y-3">
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {truncateText(event.description || 'No detailed description available.', 180)}
                      </p>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-[#29B5E8] shrink-0" />
                          <span className="font-semibold text-foreground">
                            {event.event_date ? formatDate(event.event_date) : 'Date TBA'}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.organizer && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>{event.organizer}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    {event.eligibility && (
                      <CardFooter className="bg-muted/30 py-2.5 px-6 border-t text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground mr-1">Eligibility:</span>
                        {event.eligibility}
                      </CardFooter>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center border rounded-2xl bg-slate-50 dark:bg-slate-900/50">
              <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-bold">No Events Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                No events match your search query. Events published by Admin will be displayed here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ASK AI ASSISTANT */}
      {activeTab === 'ai-chat' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#29B5E8] text-white">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">Student AI Knowledge Assistant</CardTitle>
                  <CardDescription>
                    Ask questions directly grounded in the official notices, guidelines, syllabus, and events uploaded by Admin.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <form onSubmit={handleAskAI} className="flex gap-2">
                <Input
                  placeholder="e.g. When is the registration deadline for Hack Days? or What are the attendance rules?"
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  className="flex-1"
                  disabled={isAskingAI}
                />
                <Button
                  type="submit"
                  className="bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white"
                  disabled={isAskingAI || !chatQuestion.trim()}
                >
                  {isAskingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>

              {/* Sample Quick Questions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs text-muted-foreground self-center">Try asking:</span>
                {[
                  'When are the mid-semester exams?',
                  'What are the eligibility criteria for the placement drive?',
                  'How many members per team in Hack Days?',
                ].map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      setChatQuestion(q);
                    }}
                  >
                    {q}
                  </Button>
                ))}
              </div>

              {/* AI Answer Display */}
              {chatAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-5 rounded-xl border bg-muted/40 space-y-3"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#29B5E8]">
                    <Sparkles className="h-4 w-4" /> AI Answer (Cortex RAG):
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                    {chatAnswer}
                  </p>
                  <div className="pt-2 border-t flex justify-between items-center text-xs text-muted-foreground">
                    <span>Source: Official Admin Documents</span>
                    <Button asChild variant="link" size="sm" className="p-0 h-auto text-xs text-[#29B5E8]">
                      <Link href={`/chat?q=${encodeURIComponent(chatQuestion)}`}>
                        Open in Full AI Chat <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
