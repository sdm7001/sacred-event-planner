"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Upload, Search, Download, Trash2, Eye, Loader2, AlertCircle } from "lucide-react";
import { uploadDocument, deleteDocument, listDocuments } from "@/app/actions/documents";

interface Document {
  id: string;
  filename: string;
  storage_url: string;
  linked_entity_type?: string;
  event_id?: string;
  uploaded_at: string;
  events?: { title?: string } | null;
  size_display?: string;
}

const DOC_TYPES = ["waiver", "contract", "protocol", "insurance", "other"];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("other");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startTransition(async () => {
      const result = await listDocuments();
      if (!result.error) setDocuments(result.documents as Document[]);
    });
  }, []);

  const filtered = documents.filter(
    (d) =>
      d.filename.toLowerCase().includes(search.toLowerCase()) ||
      (d.events?.title ?? "General").toLowerCase().includes(search.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null);
  };

  const handleUpload = () => {
    if (!selectedFile) { setActionError("Please select a file."); return; }
    setActionError(null);
    const fd = new FormData();
    fd.append("file", selectedFile);
    fd.append("doc_type", docType);

    startTransition(async () => {
      const result = await uploadDocument(fd);
      if (result.error) {
        setActionError(result.error);
      } else {
        const newDoc: Document = {
          id: (result.data as { id: string }).id,
          filename: selectedFile.name,
          storage_url: (result.data as { storage_url: string }).storage_url,
          linked_entity_type: docType,
          uploaded_at: new Date().toISOString(),
          events: null,
        };
        setDocuments((prev) => [newDoc, ...prev]);
        setIsUploadOpen(false);
        setSelectedFile(null);
        setDocType("other");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  };

  const handleDelete = (doc: Document) => {
    if (!confirm(`Delete "${doc.filename}"? This cannot be undone.`)) return;
    startTransition(async () => {
      // Extract storage path from URL (everything after /documents/ bucket segment)
      const urlObj = (() => { try { return new URL(doc.storage_url); } catch { return null; } })();
      const pathSegments = urlObj?.pathname.split("/documents/") ?? [];
      const storagePath = pathSegments.length > 1 ? decodeURIComponent(pathSegments[1]) : "";
      const result = await deleteDocument(doc.id, storagePath);
      if (result.error) {
        setActionError(result.error);
      } else {
        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1">{documents.length} files</p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark" onClick={() => { setIsUploadOpen(true); setActionError(null); }}>
          <Upload className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{actionError}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="w-28"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-sm">{d.filename}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {d.events?.title ?? "General"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{d.linked_entity_type ?? "other"}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(d.uploaded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {d.storage_url !== "#" && (
                        <>
                          <a href={d.storage_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Preview">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </a>
                          <a href={d.storage_url} download={d.filename}>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Download">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(d)}
                        disabled={isPending}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No documents found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={(open) => { if (!isPending) setIsUploadOpen(open); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {actionError && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />{actionError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="doc-file">File *</Label>
              <div
                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 cursor-pointer hover:border-sage/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                {selectedFile ? (
                  <div className="text-center">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Click to select a file</p>
                )}
                <input
                  ref={fileInputRef}
                  id="doc-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.csv"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={isPending}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleUpload} disabled={isPending || !selectedFile}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {isPending ? "Uploading…" : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
