"use client";

import { useState } from 'react';
import { Search as SearchIcon, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchResult } from '@/lib/types';
import { formatDate, getCategoryColor } from '@/lib/utils';
import { motion } from 'framer-motion';

const SUGGESTIONS = [
  "AI workshops",
  "ECE events",
  "upcoming competitions",
  "semester 1 syllabus",
  "internship opportunities",
  "exam schedule",
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setQuery(searchQuery);
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Smart Search</h1>
        <p className="text-lg text-muted-foreground">
          Semantic search powered by Snowflake Cortex embeddings. Finds meaning, not just keywords.
        </p>
      </div>

      <div className="mx-auto mb-10 max-w-2xl">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}
          className="relative flex items-center"
        >
          <SearchIcon className="absolute left-4 h-5 w-5 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, notices, guidelines..."
            className="h-14 rounded-full pl-12 pr-24 text-lg shadow-sm"
          />
          <Button 
            type="submit" 
            className="absolute right-2 rounded-full px-6"
            disabled={isLoading || !query.trim()}
          >
            Search
          </Button>
        </form>

        {!hasSearched && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">Try:</span>
            {SUGGESTIONS.map((s) => (
              <Badge 
                key={s} 
                variant="secondary" 
                className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                onClick={() => handleSearch(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {isLoading && (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between mb-4">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {!isLoading && hasSearched && results.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="py-20 text-center"
          >
            <SearchIcon className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-xl font-semibold">No results found</h3>
            <p className="text-muted-foreground mt-2">Try a different search query or use different keywords.</p>
          </motion.div>
        )}

        {!isLoading && results.length > 0 && (
          <motion.div 
            initial="hidden" 
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            className="space-y-4"
          >
            <div className="mb-4 text-sm font-medium text-muted-foreground">
              Found {results.length} relevant results
            </div>
            {results.map((result, idx) => (
              <motion.div key={idx} variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}>
                <Link href={`/documents/${result.document_id}`}>
                  <Card className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
                    <CardContent className="p-6">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <h3 className="text-xl font-semibold">{result.document_title}</h3>
                        </div>
                        <Badge variant={result.relevance_score > 0.8 ? "default" : "secondary"}>
                          {Math.round(result.relevance_score * 100)}% Match
                        </Badge>
                      </div>
                      
                      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                        {result.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge variant="outline" className={getCategoryColor(result.category)}>
                            {result.category}
                          </Badge>
                          {result.created_at && (
                            <span className="text-xs text-muted-foreground flex items-center">
                              {formatDate(result.created_at)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-sm font-medium text-[#29B5E8]">
                          View Document <ChevronRight className="ml-1 h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
