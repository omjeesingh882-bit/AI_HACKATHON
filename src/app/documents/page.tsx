"use client";

import { useState, useEffect } from 'react';
import { Plus, Database, Inbox } from 'lucide-react';
import { Document, DOCUMENT_CATEGORIES } from '@/lib/types';
import { DocumentCard } from '@/components/document-card';
import { UploadDialog } from '@/components/upload-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const { toast } = useToast();

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDocuments((docs) => docs.filter((d) => d.document_id !== id));
        toast({ title: "Document deleted" });
      }
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleSeedDemoData = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/demo/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Demo data seeded successfully!" });
        fetchDocuments();
      }
    } catch (error) {
      toast({ title: "Failed to seed data", variant: "destructive" });
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doc.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground mt-1">Manage all college documents processed by TMSL AI.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleSeedDemoData} disabled={isSeeding}>
            <Database className="mr-2 h-4 w-4" />
            {isSeeding ? "Seeding..." : "Seed Demo Data"}
          </Button>
          <Button onClick={() => setIsUploading(true)} className="bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white">
            <Plus className="mr-2 h-4 w-4" /> Upload Document
          </Button>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <Input
          placeholder="Search by title or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {DOCUMENT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredDocs.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDocs.map((doc) => (
            <DocumentCard key={doc.document_id} document={doc} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center bg-slate-50 dark:bg-slate-900/50">
          <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
            <Inbox className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="mb-2 text-xl font-bold">No documents found</h3>
          <p className="mb-6 max-w-sm text-muted-foreground">
            {documents.length === 0 
              ? "Your knowledge base is empty. Upload documents or seed demo data to get started."
              : "No documents match your filters. Try adjusting your search query."}
          </p>
          {documents.length === 0 && (
            <div className="flex gap-4">
              <Button onClick={() => setIsUploading(true)}>Upload First Document</Button>
              <Button variant="outline" onClick={handleSeedDemoData} disabled={isSeeding}>
                Seed Data
              </Button>
            </div>
          )}
        </div>
      )}

      <UploadDialog 
        open={isUploading} 
        onOpenChange={setIsUploading} 
        onUploadComplete={fetchDocuments}
      />
    </div>
  );
}
