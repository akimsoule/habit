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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/hooks/use-toast";
import { useHabitApp } from "@/providers/habitContext";
import { Priority } from "habit.app";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const DAYS: { label: string; value: number }[] = [
  { label: "Dim", value: 0 },
  { label: "Lun", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Mer", value: 3 },
  { label: "Jeu", value: 4 },
  { label: "Ven", value: 5 },
  { label: "Sam", value: 6 },
];

export function AddHabitModal({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const { categories, createHabit } = useHabitApp();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1]); // default Monday
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const reset = () => {
    setName("");
    setCategoryId(undefined);
    setFrequency("daily");
    setPriority(Priority.Medium);
    setDaysOfWeek([1]);
    setDayOfMonth(1);
  };

  const onSubmit = () => {
    if (!canSubmit) return;
    const habit = createHabit({
      name: name.trim(),
      categoryId,
      frequency,
      priority,
      daysOfWeek: frequency === "weekly" ? daysOfWeek : undefined,
      dayOfMonth: frequency === "monthly" ? dayOfMonth : undefined,
    });
    toast({ title: "Habitude ajoutée", description: habit.name });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une habitude</DialogTitle>
          <DialogDescription>
            Définissez le nom, la fréquence, la catégorie et la priorité.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm">Nom</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Paperasse immigration 15 min"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm">Catégorie</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Optionnel" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Fréquence</label>
              <Select
                value={frequency}
                onValueChange={(v: "daily" | "weekly" | "monthly") =>
                  setFrequency(v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Quotidienne</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuelle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {frequency === "weekly" && (
            <div className="space-y-2">
              <label className="text-sm">Jours (UTC)</label>
              <ToggleGroup
                type="multiple"
                value={daysOfWeek.map(String)}
                onValueChange={(vals) =>
                  setDaysOfWeek(vals.map((v) => Number(v)))
                }
                className="flex flex-wrap gap-2"
              >
                {DAYS.map((d) => (
                  <ToggleGroupItem
                    key={d.value}
                    value={String(d.value)}
                    className="w-10 justify-center"
                  >
                    {d.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}

          {frequency === "monthly" && (
            <div className="space-y-2">
              <label className="text-sm">Jour du mois</label>
              <Input
                type="number"
                min={1}
                max={31}
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(Number(e.target.value))}
              />
            </div>
          )}

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

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={onSubmit} disabled={!canSubmit}>
              Ajouter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddHabitModal;
