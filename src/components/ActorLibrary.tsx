import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Library, Plus, Trash2, FolderOpen, Save, AlertCircle } from "lucide-react";
import { getLibrary, saveToLibrary, removeFromLibrary, type LibraryEntry, verifyPermission } from "@/lib/storage";
import { type Actor } from "@/types/actor";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ActorLibraryProps {
  onLoadActor: (actor: Actor, id: string, handle?: FileSystemFileHandle) => void;
}

export function ActorLibrary({ onLoadActor }: ActorLibraryProps) {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [open, setOpen] = useState(false);

  const loadEntries = async () => {
    try {
      const data = await getLibrary();
      setEntries(data.sort((a, b) => b.lastModified - a.lastModified));
    } catch (error) {
      console.error("Failed to load library entries", error);
    }
  };

  useEffect(() => {
    if (open) {
      loadEntries();
    }
  }, [open]);

  const handleAddFile = async () => {
    try {
      if (!('showOpenFilePicker' in window)) {
        toast.error("File System Access API is not supported in this browser.");
        return;
      }

      const [handle] = await window.showOpenFilePicker({
        types: [{
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] },
        }],
      });

      const file = await handle.getFile();
      const text = await file.text();
      const actor = JSON.parse(text) as Actor;

      const entry: LibraryEntry = {
        id: crypto.randomUUID(),
        name: `${actor.race}-${actor.job}`,
        handle,
        actor,
        lastModified: Date.now(),
      };

      await saveToLibrary(entry);
      await loadEntries();
      toast.success(`Added ${entry.name} to library`);
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      console.error(error);
      toast.error("Failed to add file to library");
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (confirm(`Remove ${name} from library?`)) {
      await removeFromLibrary(id);
      await loadEntries();
      toast.success(`Removed ${name}`);
    }
  };

  const handleLoad = async (entry: LibraryEntry) => {
    let actor = entry.actor;
    const handle = entry.handle;

    if (handle) {
      const hasPermission = await verifyPermission(handle, false);
      if (hasPermission) {
        try {
          const file = await handle.getFile();
          const text = await file.text();
          actor = JSON.parse(text) as Actor;
          
          // Update library entry with latest data
          await saveToLibrary({
            ...entry,
            actor,
            lastModified: Date.now()
          });
        } catch (error) {
          console.error("Failed to read file from handle", error);
          toast.error("Could not read original file. Using cached version.");
        }
      } else {
        toast.warning("Permission denied. Using cached version.");
      }
    }

    onLoadActor(actor, entry.id, handle);
    setOpen(false);
    toast.success(`Loaded ${entry.name}`);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Library className="h-4 w-4 mr-1" /> Library
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Actor Library</span>
            <Button size="sm" onClick={handleAddFile}>
              <Plus className="h-4 w-4 mr-1" /> Add File
            </Button>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No files in library yet. Add your actor JSON files to track them.
            </p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent hover:border-primary/50 transition-all group cursor-pointer"
                onClick={() => handleLoad(entry)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate group-hover:text-primary transition-colors">{entry.name}</p>
                    {entry.handle ? (
                      <Badge variant="secondary" className="text-[10px] py-0 h-4">Local File</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] py-0 h-4">Cached</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Last sync: {new Date(entry.lastModified).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary hover:bg-primary/10"
                    title="Load"
                  >
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(entry.id, entry.name);
                    }}
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
