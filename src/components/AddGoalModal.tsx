import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useHabitApp } from "@/providers/habitContext";
import { Priority } from "habit.app";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AddGoalModal({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const { habits, addGoal } = useHabitApp();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [priority, setPriority] = useState<Priority>(Priority.High);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const canSubmit = useMemo(
    () => name.trim().length > 0 && Object.values(selected).some(Boolean),
    [name, selected]
  );
  const selectedIds = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v)
        .map(([id]) => id),
    [selected]
  );

  const reset = () => {
    setName("");
    setDescription("");
    setDueDate("");
    setPriority(Priority.High);
    setSelected({});
  };

  const onSubmit = () => {
    if (!canSubmit) return;
    const g = addGoal({
      name: name.trim(),
      habitIds: selectedIds,
      dueDate: dueDate || undefined,
      priority,
      description: description || undefined,
    });
    toast({ title: "Objectif créé", description: g.name });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Créer un objectif SMART</DialogTitle>
          <DialogDescription>
            Associez des habitudes et une date butoir pour piloter votre
            progression.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm">Nom</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Faire venir ma femme (2 ans)"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm">Date butoir</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Priorité</label>
              {(() => {
                const toKey = (p: Priority) =>
                  p === Priority.High ? "High" : p === Priority.Low ? "Low" : "Medium";
                const fromKey = (k: string): Priority =>
                  k === "High" ? Priority.High : k === "Low" ? Priority.Low : Priority.Medium;
                return (
                  <Select value={toKey(priority)} onValueChange={(k) => setPriority(fromKey(k))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">Haute</SelectItem>
                      <SelectItem value="Medium">Moyenne</SelectItem>
                      <SelectItem value="Low">Basse</SelectItem>
                    </SelectContent>
                  </Select>
                );
              })()}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm">Description (optionnel)</label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contexte, critères SMART, etc."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Sélectionnez des habitudes</label>
            <div className="max-h-60 overflow-auto rounded-md border p-2 space-y-2">
              {habits.length === 0 && (
                <div className="text-sm text-muted-foreground px-1">
                  Aucune habitude — commencez par en créer une.
                </div>
              )}
              {habits.map((h) => (
                <label key={h.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={!!selected[h.id]}
                    onCheckedChange={(v) =>
                      setSelected((s) => ({ ...s, [h.id]: Boolean(v) }))
                    }
                  />
                  <span>{h.name}</span>
                </label>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              {selectedIds.length} habitude(s) sélectionnée(s)
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={onSubmit} disabled={!canSubmit}>
              Créer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
