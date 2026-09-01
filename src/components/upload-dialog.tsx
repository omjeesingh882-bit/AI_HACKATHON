"use client";
import * as React from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { DOCUMENT_CATEGORIES, DocumentCategory } from "@/lib/types";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

export function UploadDialog({ open, onOpenChange, onUploadComplete }: UploadDialogProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<DocumentCategory>("general");
  const [department, setDepartment] = React.useState("");
  const [source, setSource] = React.useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: "Error", description: "Please select a file to upload.", variant: "destructive" });
      return;
    }
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title || file.name);
      formData.append("category", category);
      formData.append("department", department);
      formData.append("source", source);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload document");
      
      toast({ title: "Success", description: "Document uploaded and indexed successfully!" });
      onUploadComplete();
      onOpenChange(false);
      
      // Reset form
      setFile(null);
      setTitle("");
      setCategory("general");
      setDepartment("");
      setSource("");
    } catch (error) {
      console.error(error);
      toast({ title: "Upload Failed", description: "There was an error uploading your document.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleUpload}>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new PDF, TXT, or DOCX file to the knowledge base.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Leave blank to use filename"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(val) => setCategory(val as DocumentCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="e.g. CSE, ECE"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  placeholder="e.g. Website"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !file}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}