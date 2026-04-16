"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, AlertCircle, CheckSquare, ChevronDown, ChevronRight } from "lucide-react";
import {
  getChecklists,
  createChecklist,
  deleteChecklist,
  getChecklistItems,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
} from "@/app/actions/checklists";

interface ChecklistItem {
  id: string;
  title: string;
  is_done: boolean;
  sort_order: number;
  assigned_to?: string | null;
}

interface Checklist {
  id: string;
  title: string;
  event_id?: string | null;
  created_at: string;
  events?: { title?: string } | null;
}

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [itemsByList, setItemsByList] = useState<Record<string, ChecklistItem[]>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getChecklists();
      if (!result.error) setChecklists(result.checklists as Checklist[]);
    });
  }, []);

  const loadItems = (checklistId: string) => {
    startTransition(async () => {
      const result = await getChecklistItems(checklistId);
      if (!result.error) {
        setItemsByList((prev) => ({ ...prev, [checklistId]: result.items as ChecklistItem[] }));
      }
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (!itemsByList[id]) loadItems(id);
      }
      return next;
    });
  };

  const handleCreate = () => {
    if (!newTitle.trim()) { setActionError("Title is required"); return; }
    setActionError(null);
    startTransition(async () => {
      const result = await createChecklist(newTitle.trim());
      if (result.error) {
        setActionError(result.error);
      } else {
        setChecklists((prev) => [result.data as Checklist, ...prev]);
        setIsCreateOpen(false);
        setNewTitle("");
      }
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete checklist "${title}" and all its items?`)) return;
    startTransition(async () => {
      const result = await deleteChecklist(id);
      if (result.error) setActionError(result.error);
      else setChecklists((prev) => prev.filter((c) => c.id !== id));
    });
  };

  const handleAddItem = (checklistId: string) => {
    const text = (newItemText[checklistId] ?? "").trim();
    if (!text) return;
    startTransition(async () => {
      const result = await addChecklistItem(checklistId, text);
      if (!result.error) {
        setItemsByList((prev) => ({
          ...prev,
          [checklistId]: [...(prev[checklistId] ?? []), result.data as ChecklistItem],
        }));
        setNewItemText((prev) => ({ ...prev, [checklistId]: "" }));
      }
    });
  };

  const handleToggleItem = (checklistId: string, itemId: string, current: boolean) => {
    // Optimistic update
    setItemsByList((prev) => ({
      ...prev,
      [checklistId]: (prev[checklistId] ?? []).map((item) =>
        item.id === itemId ? { ...item, is_done: !current } : item
      ),
    }));
    startTransition(async () => {
      await toggleChecklistItem(itemId, !current);
    });
  };

  const handleDeleteItem = (checklistId: string, itemId: string) => {
    setItemsByList((prev) => ({
      ...prev,
      [checklistId]: (prev[checklistId] ?? []).filter((item) => item.id !== itemId),
    }));
    startTransition(async () => {
      await deleteChecklistItem(itemId);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight">Checklists</h1>
          <p className="text-muted-foreground mt-1">Track preparation tasks and requirements</p>
        </div>
        <Button className="bg-sage hover:bg-sage-dark" onClick={() => { setIsCreateOpen(true); setActionError(null); }}>
          <Plus className="mr-2 h-4 w-4" /> New Checklist
        </Button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
        </div>
      )}

      {checklists.length === 0 && !isPending && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <CheckSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No checklists yet.</p>
          <button onClick={() => setIsCreateOpen(true)} className="text-sage hover:underline mt-1">
            Create your first checklist
          </button>
        </div>
      )}

      <div className="space-y-4">
        {checklists.map((checklist) => {
          const items = itemsByList[checklist.id] ?? [];
          const doneCount = items.filter((i) => i.is_done).length;
          const isExpanded = expandedIds.has(checklist.id);

          return (
            <Card key={checklist.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <button
                    className="flex items-center gap-2 flex-1 text-left"
                    onClick={() => toggleExpand(checklist.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <CardTitle className="text-base">{checklist.title}</CardTitle>
                    {checklist.events?.title && (
                      <Badge variant="outline" className="text-xs font-normal">{checklist.events.title}</Badge>
                    )}
                    {isExpanded && items.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {doneCount}/{items.length} done
                      </span>
                    )}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                    onClick={() => handleDelete(checklist.id, checklist.title)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 group">
                      <Checkbox
                        checked={item.is_done}
                        onCheckedChange={() => handleToggleItem(checklist.id, item.id, item.is_done)}
                        disabled={isPending}
                      />
                      <span className={`flex-1 text-sm ${item.is_done ? "line-through text-muted-foreground" : ""}`}>
                        {item.title}
                      </span>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteItem(checklist.id, item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Input
                      placeholder="Add item..."
                      className="h-8 text-sm"
                      value={newItemText[checklist.id] ?? ""}
                      onChange={(e) =>
                        setNewItemText((prev) => ({ ...prev, [checklist.id]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleAddItem(checklist.id)}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => handleAddItem(checklist.id)}
                      disabled={isPending || !(newItemText[checklist.id] ?? "").trim()}
                    >
                      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!isPending) setIsCreateOpen(open); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {actionError && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" /> {actionError}
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input
                placeholder="e.g., Pre-Event Setup"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isPending}>Cancel</Button>
            <Button className="bg-sage hover:bg-sage-dark" onClick={handleCreate} disabled={isPending || !newTitle.trim()}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
