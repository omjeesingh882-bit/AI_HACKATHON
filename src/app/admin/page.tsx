"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Shield,
  Calendar,
  FileText,
  Users,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  MapPin,
  Building,
  Sparkles,
  Database,
  ArrowRight,
  BookOpen,
  Upload,
  Search,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { EventData, Document, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { AddEventDialog } from '@/components/add-event-dialog';
import { UploadDialog } from '@/components/upload-dialog';
import { formatDate, formatRelativeDate, getCategoryColor } from '@/lib/utils';

export default function AdminPanelPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [events, setEvents] = useState<EventData[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('events');

  const [eventSearch, setEventSearch] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [eventsRes, docsRes, studentsRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/documents'),
        fetch('/api/auth/students'),
      ]);

      const [eventsData, docsData, studentsData] = await Promise.all([
        eventsRes.json(),
        docsRes.json(),
        studentsRes.json(),
      ]);

      if (eventsData.success) setEvents(eventsData.data || []);
      if (docsData.success) setDocuments(docsData.data || []);
      if (studentsData.success) setStudents(studentsData.data || []);
    } catch (e) {
      console.error('Failed to load admin data', e);
      toast({ title: 'Error', description: 'Failed to fetch latest data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteEvent = async (eventId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the event: "${title}"?`)) return;
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setEvents((prev) => prev.filter((e) => e.event_id !== eventId));
        toast({ title: 'Event Deleted', description: `"${title}" has been removed.` });
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to delete event', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete event', variant: 'destructive' });
    }
  };

  const handleDeleteDocument = async (docId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete document: "${title}"?`)) return;
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDocuments((prev) => prev.filter((d) => d.document_id !== docId));
        toast({ title: 'Document Deleted', description: `"${title}" has been removed.` });
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to delete document', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete document', variant: 'destructive' });
    }
  };

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
    e.category.toLowerCase().includes(eventSearch.toLowerCase()) ||
    e.organizer.toLowerCase().includes(eventSearch.toLowerCase())
  );

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(docSearch.toLowerCase()) ||
    d.category.toLowerCase().includes(docSearch.toLowerCase()) ||
    d.department.toLowerCase().includes(docSearch.toLowerCase())
  );

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.department && s.department.toLowerCase().includes(studentSearch.toLowerCase())) ||
    (s.rollNumber && s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  if (!authLoading && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <Card className="p-8 shadow-xl border-slate-200 dark:border-slate-800">
          <div className="mx-auto w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center mb-4 text-purple-600">
            <Shield className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold mb-2">Administrator Access Required</CardTitle>
          <CardDescription className="text-sm mb-6">
            This panel is restricted exclusively to administrators. Please sign in with the administrator account to manage institutional events, documents, and students.
          </CardDescription>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              <Link href="/login?role=admin">Sign In as Admin</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Banner */}
      <div className="mb-8 rounded-2xl border bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10">
          <Shield className="h-64 w-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-[#29B5E8] text-white hover:bg-[#29B5E8]/90">
                <Shield className="mr-1 h-3 w-3" /> Administrator Portal
              </Badge>
              <span className="text-xs text-blue-200">TMSL AI Enterprise</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Admin Control Center
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              Publish events, upload institutional notices & syllabus, and manage registered student accounts.
              <span className="text-[#29B5E8] font-semibold"> Anything uploaded or created here is automatically live for all students.</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setIsAddEventOpen(true)}
              className="bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white font-semibold shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Event
            </Button>
            <Button
              onClick={() => setIsUploadDocOpen(true)}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Document
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchData}
              className="text-white hover:bg-white/10"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Events</p>
              <h3 className="text-2xl font-bold mt-1">{events.length}</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Live for all students
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#29B5E8] flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Uploaded Documents</p>
              <h3 className="text-2xl font-bold mt-1">{documents.length}</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Cortex AI Indexed
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Registered Students</p>
              <h3 className="text-2xl font-bold mt-1">{students.length}</h3>
              <p className="text-xs text-muted-foreground mt-1">Individual student log-ins</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <BookOpen className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Snowflake Engine</p>
              <h3 className="text-lg font-bold mt-1 text-[#29B5E8]">TMSL_AI</h3>
              <p className="text-xs text-muted-foreground mt-1">Cortex LLM & RAG active</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center">
              <Database className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Manage Events ({events.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Manage Docs ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students ({students.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MANAGE EVENTS */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events by title, category..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background"
              />
            </div>
            <Button
              onClick={() => setIsAddEventOpen(true)}
              className="bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white font-medium"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Event
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid gap-4">
              {filteredEvents.map((event) => (
                <Card key={event.event_id} className="overflow-hidden hover:border-primary/50 transition-colors">
                  <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getCategoryColor(event.category)} variant="outline">
                          {event.category.toUpperCase()}
                        </Badge>
                        {event.registration_deadline && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            Reg Deadline: {formatDate(event.registration_deadline)}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{event.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Calendar className="h-3.5 w-3.5 text-[#29B5E8]" />
                          {event.event_date ? formatDate(event.event_date) : 'Date TBA'}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {event.location}
                          </span>
                        )}
                        {event.organizer && (
                          <span className="flex items-center gap-1">
                            <Building className="h-3.5 w-3.5 text-muted-foreground" />
                            {event.organizer}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.event_id, event.title)}
                        className="text-xs"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-bold">No Events Found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                Add an event to have it immediately broadcasted to all students.
              </p>
              <Button onClick={() => setIsAddEventOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add First Event
              </Button>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: MANAGE DOCUMENTS */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search documents by title, department..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background"
              />
            </div>
            <Button
              onClick={() => setIsUploadDocOpen(true)}
              className="bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white font-medium"
            >
              <Upload className="mr-2 h-4 w-4" /> Upload Document
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredDocs.length > 0 ? (
            <div className="grid gap-4">
              {filteredDocs.map((doc) => (
                <Card key={doc.document_id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(doc.category)} variant="outline">
                          {doc.category.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {doc.department} • Uploaded {formatRelativeDate(doc.created_at)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold">{doc.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {doc.content || 'Document content indexed into Snowflake vector store.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <Button asChild variant="outline" size="sm" className="text-xs">
                        <Link href={`/documents/${doc.document_id}`}>
                          <ArrowRight className="mr-1.5 h-3.5 w-3.5" /> View
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.document_id, doc.title)}
                        className="text-xs"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-bold">No Documents Uploaded</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                Upload institutional notices, exam schedules, or circulars for students.
              </p>
              <Button onClick={() => setIsUploadDocOpen(true)}>
                <Upload className="mr-2 h-4 w-4" /> Upload First Document
              </Button>
            </div>
          )}
        </TabsContent>

        {/* TAB 3: REGISTERED STUDENTS DIRECTORY */}
        <TabsContent value="students" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students by name, email, roll..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background"
              />
            </div>
            <Badge variant="secondary" className="text-xs py-1.5 px-3">
              Total Enrolled Students: {students.length}
            </Badge>
          </div>

          <div className="rounded-xl border overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3">Email Address</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3">Roll / ID</th>
                    <th className="px-6 py-3">Year</th>
                    <th className="px-6 py-3">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4 font-semibold flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-[#29B5E8] flex items-center justify-center font-bold text-xs">
                            {student.name.charAt(0)}
                          </div>
                          {student.name}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{student.email}</td>
                        <td className="px-6 py-4">{student.department || 'General'}</td>
                        <td className="px-6 py-4 font-mono text-xs">{student.rollNumber || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-xs">
                            {student.year || 'Student'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {formatDate(student.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        No registered students found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Modals */}
      <AddEventDialog
        open={isAddEventOpen}
        onOpenChange={setIsAddEventOpen}
        onEventCreated={fetchData}
      />

      <UploadDialog
        open={isUploadDocOpen}
        onOpenChange={setIsUploadDocOpen}
        onUploadComplete={fetchData}
      />
    </div>
  );
}
