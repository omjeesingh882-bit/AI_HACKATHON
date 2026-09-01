"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Calendar, Building, Info, Sparkles, Brain } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Document, DocumentSummary } from '@/lib/types';
import { formatDate, getCategoryColor } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ChunkData {
  chunk_id: string;
  chunk_index: number;
  content: string;
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [doc, setDoc] = useState<(Document & { chunks?: ChunkData[] }) | null>(null);
  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await fetch(`/api/documents/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setDoc(data.data);
        } else {
          router.push('/documents');
        }
      } catch (error) {
        console.error("Fetch failed", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (params.id) fetchDoc();
  }, [params.id, router]);

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const res = await fetch(`/api/documents/${params.id}/summarize`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSummary(data.data);
        toast({ title: "Summary generated via Cortex Complete!" });
      }
    } catch (error) {
      toast({ title: "Summarization failed", variant: "destructive" });
    } finally {
      setIsSummarizing(false);
    }
  };

  if (isLoading) return (
    <div className="container mx-auto p-8 max-w-5xl">
      <Skeleton className="h-8 w-32 mb-8" />
      <Skeleton className="h-12 w-3/4 mb-4" />
      <Skeleton className="h-6 w-1/2 mb-8" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );

  if (!doc) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" asChild className="mb-6 -ml-4">
        <Link href="/documents">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Knowledge Base
        </Link>
      </Button>

      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant="outline" className={getCategoryColor(doc.category)}>
            {doc.category.toUpperCase()}
          </Badge>
          <Badge variant="secondary" className="flex items-center">
            <Building className="mr-1 h-3 w-3" /> {doc.department || 'General'}
          </Badge>
          {doc.created_at && (
            <span className="text-sm text-muted-foreground flex items-center">
              <Calendar className="mr-1 h-4 w-4" /> {formatDate(doc.created_at)}
            </span>
          )}
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{doc.title}</h1>
        
        {doc.source && (
          <p className="text-muted-foreground flex items-center">
            <Info className="mr-2 h-4 w-4" /> Source: {doc.source}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card className="border-blue-100 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-900/10">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Sparkles className="h-5 w-5" /> AI Summary
                  </CardTitle>
                  <CardDescription>Powered by Snowflake Cortex COMPLETE</CardDescription>
                </div>
                {!summary && (
                  <Button 
                    onClick={handleSummarize} 
                    disabled={isSummarizing}
                    className="bg-[#29B5E8] hover:bg-[#29B5E8]/90 text-white"
                  >
                    {isSummarizing ? (
                      <><Brain className="mr-2 h-4 w-4 animate-pulse" /> Summarizing...</>
                    ) : (
                      "Generate Summary"
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>
            {summary && (
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Overview</h4>
                  <p className="text-sm leading-relaxed">{summary.short_summary}</p>
                </div>
                
                {summary.key_points?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Key Points</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {summary.key_points.map((pt, i) => <li key={i}>{pt}</li>)}
                    </ul>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {summary.important_dates?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2"><Calendar className="h-4 w-4"/> Dates</h4>
                      <ul className="text-sm space-y-1">
                        {summary.important_dates.map((d, i) => <li key={i}>{d}</li>)}
                      </ul>
                    </div>
                  )}
                  {summary.required_actions?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Required Actions</h4>
                      <ul className="text-sm space-y-1 text-orange-600 dark:text-orange-400">
                        {summary.required_actions.map((a, i) => <li key={i}>• {a}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
                
                {summary.eligibility && summary.eligibility !== 'None' && (
                  <div>
                    <h4 className="font-semibold mb-2">Eligibility</h4>
                    <p className="text-sm">{summary.eligibility}</p>
                  </div>
                )}
                
                {summary.contact_info && summary.contact_info !== 'None' && (
                  <div>
                    <h4 className="font-semibold mb-2">Contact</h4>
                    <p className="text-sm">{summary.contact_info}</p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          <Tabs defaultValue="chunks">
            <TabsList>
              <TabsTrigger value="chunks">Vector Chunks ({doc.chunks?.length || 0})</TabsTrigger>
              <TabsTrigger value="raw">Raw Content</TabsTrigger>
            </TabsList>
            <TabsContent value="chunks" className="space-y-4 mt-4">
              {doc.chunks?.map((chunk, i) => (
                <Card key={i}>
                  <CardHeader className="py-3 px-4 bg-muted/50">
                    <CardTitle className="text-xs font-mono text-muted-foreground flex justify-between">
                      <span>Chunk #{chunk.chunk_index}</span>
                      <span className="text-[#29B5E8]">1024-d embedding</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-sm whitespace-pre-wrap">{chunk.content}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="raw">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm whitespace-pre-wrap font-mono bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
                    {doc.chunks?.map((c) => c.content).join('\n\n') || "No content available."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Document ID</span>
                <span className="font-mono text-xs break-all">{doc.document_id}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Filename</span>
                <span>{doc.filename}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Uploaded At</span>
                <span>{formatDate(doc.created_at)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Total Size</span>
                <span>{doc.chunks?.length || 0} vector chunks</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
