"use client";

import { useState, useEffect } from 'react';
import { FileText, Database, MessageSquare, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCard } from '@/components/stats-card';
import { AnalyticsData } from '@/lib/types';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#29B5E8', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">System Analytics</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard 
          title="Total Documents" 
          value={data.total_documents} 
          icon={<FileText className="h-5 w-5" />} 
        />
        <StatsCard 
          title="Knowledge Chunks" 
          value={data.total_chunks} 
          icon={<Database className="h-5 w-5" />} 
          description="Vector embeddings stored"
        />
        <StatsCard 
          title="Questions Asked" 
          value={data.total_queries} 
          icon={<MessageSquare className="h-5 w-5" />} 
        />
        <StatsCard 
          title="AI Interactions" 
          value={Math.round(data.total_queries * 2.5)} 
          icon={<Brain className="h-5 w-5" />} 
          description="Embed + Search + Complete"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Queries Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.queries_by_day} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="#29B5E8" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.popular_categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="category"
                  label
                >
                  {data.popular_categories.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Queries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recent_queries?.length > 0 ? data.recent_queries.map((query: { question: string; created_at: string }, i: number) => (
                <div key={i} className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/50">
                    <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{query.question}</p>
                    <p className="text-xs text-muted-foreground">{new Date(query.created_at).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No queries yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Referenced Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.top_documents?.length > 0 ? data.top_documents.map((doc: { title: string; query_count: number }, i: number) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="h-5 w-5 text-slate-400" />
                    <p className="truncate text-sm font-medium">{doc.title}</p>
                  </div>
                  <div className="font-mono text-sm text-[#29B5E8] bg-blue-50 px-2 py-1 rounded dark:bg-blue-900/30">
                    {doc.query_count} hits
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
