"use client";
import * as React from "react";
import Link from "next/link";
import { FileText, Trash2, Calendar, Folder } from "lucide-react";
import { Document } from "@/lib/types";
import { formatRelativeDate, getCategoryColor } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DocumentCard({ document, onDelete }: { document: Document; onDelete?: (id: string) => void }) {
  return (
    <Card className="group flex flex-col hover:border-primary/50 transition-colors">
      <Link href={`/documents/${document.document_id}`} className="flex-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base font-semibold line-clamp-2 leading-tight">
              {document.title}
            </CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
          </div>
        </CardHeader>
        <CardContent className="pb-4 flex-1">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={getCategoryColor(document.category)} variant="outline">
              {document.category.charAt(0).toUpperCase() + document.category.slice(1)}
            </Badge>
            {document.chunk_count !== undefined && (
              <Badge variant="secondary" className="text-[10px]">
                {document.chunk_count} Chunks
              </Badge>
            )}
          </div>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Folder className="h-3.5 w-3.5" />
              <span className="truncate">{document.department}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatRelativeDate(document.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Link>
      <CardFooter className="pt-0 flex justify-between items-center border-t px-6 py-3 bg-muted/20">
        <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={document.filename}>
          {document.filename}
        </span>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (window.confirm("Are you sure you want to delete this document?")) {
                onDelete(document.document_id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}