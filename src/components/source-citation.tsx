"use client";
import * as React from "react";
import Link from "next/link";
import { FileText, MapPin } from "lucide-react";
import { QuerySource } from "@/lib/types";
import { truncateText } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function SourceCitation({ source }: { source: QuerySource }) {
  return (
    <Link href={`/documents/${source.document_id}`}>
      <div className="flex flex-col gap-1.5 p-3 rounded-md border bg-card text-card-foreground hover:bg-accent/50 transition-colors cursor-pointer shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium truncate">{source.document_title}</span>
          </div>
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 shrink-0">
            {Math.round(source.relevance_score * 100)}% Match
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>Chunk {source.chunk_index}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
          {truncateText(source.content, 150)}
        </p>
      </div>
    </Link>
  );
}