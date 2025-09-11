import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trophy, Star, MoreVertical } from "lucide-react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useHabitApp } from "@/providers/habitContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HabitCardProps {
  id: string;
  name: string;
  initialProgress: number; // 0 or 100 for due-today display
  onProgressUpdate?: (newProgress: number) => void;
  isDueToday?: boolean;
}

const HabitCard = ({ id, name, initialProgress, onProgressUpdate, isDueToday = true }: HabitCardProps) => {
  const [progress, setProgress] = useState(initialProgress);
  const [isCompleted, setIsCompleted] = useState(initialProgress >= 100);
  const [showCelebration, setShowCelebration] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(name);
  const [descOpen, setDescOpen] = useState(false);
  const [descValue, setDescValue] = useState<string>("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [weeklyDays, setWeeklyDays] = useState<number[]>([]);
  const [monthlyDay, setMonthlyDay] = useState<number>(1);
  const [removeOpen, setRemoveOpen] = useState(false);
  const {
    manager,
    categories,
    goals,
    setCompletionNote,
    getCompletionNote,
    setHabitCategory,
    addHabitToGoal,
    renameHabit,
    setHabitDescription,
    setHabitWeeklyDays,
    setHabitMonthlyDay,
    archiveHabit,
    unarchiveHabit,
    removeHabit,
    nextAvailableDate,
  } = useHabitApp();
  const habit = manager.getHabit(id);
  const hasCategory = Boolean(habit?.category?.id);
  const isInAnyGoal = goals.some((g) => (g.getHabits?.() ?? []).some((h) => h.id === id));
  const todayISO = new Date().toISOString().slice(0, 10);
  const isArchived = (habit as unknown as { archived?: boolean })?.archived ?? false;
  const frequency = (habit as unknown as { frequency?: string })?.frequency as
    | "daily"
    | "weekly"
    | "monthly"
    | undefined;

  useEffect(() => {
    if (progress >= 100 && !isCompleted) {
      setIsCompleted(true);
      setShowCelebration(true);

      // Confetti celebration (gamification)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        // green + violet, remove blue
        colors: ["#10b981", "#8b5cf6"],
      });

      // Remove celebration animation after it completes
      setTimeout(() => setShowCelebration(false), 600);
    }
  }, [progress, isCompleted]);

  // Réactiver automatiquement à la prochaine journée/fréquence
  useEffect(() => {
    setProgress(initialProgress);
    setIsCompleted(initialProgress >= 100);
  }, [initialProgress]);

  const handleProgressIncrease = () => {
  if (isCompleted || !isDueToday) return; // désactivé si déjà fait ou non due
    // Si on passe de non fait -> fait, exiger une note
    if (progress < 100) {
      const existing = getCompletionNote?.(id, todayISO);
      setNoteText(existing ?? "");
      setNoteOpen(true);
      return;
    }
  };

  const submitNoteAndComplete = () => {
    // Enregistrer la note (même vide, mais on peut exiger min 1 char)
    setCompletionNote?.(id, todayISO, noteText.trim());
    const newProgress = 100;
    setProgress(newProgress);
    onProgressUpdate?.(newProgress);
    setNoteText("");
    setNoteOpen(false);
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return "text-success";
    if (value >= 50) return "text-primary";
    return "text-muted-foreground";
  };

  const nextAvailable = isCompleted ? nextAvailableDate?.(id, todayISO) : undefined;

  // Pré-remplir description et horaires selon la fréquence quand on ouvre les dialogues
  useEffect(() => {
    const h = manager.getHabit(id);
    const currentDesc = (h as unknown as { description?: string })?.description ?? "";
    setDescValue(currentDesc);
  }, [id, manager]);

  const openScheduleForHabit = () => {
    if (frequency === "weekly") {
      const days = (habit as unknown as { daysOfWeek?: number[] })?.daysOfWeek ?? [];
      setWeeklyDays([...days]);
    } else if (frequency === "monthly") {
      const dom = (habit as unknown as { dayOfMonth?: number })?.dayOfMonth ?? 1;
      setMonthlyDay(dom);
    }
    setScheduleOpen(true);
  };

  const toggleDay = (idx: number) => {
    setWeeklyDays((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx].sort()
    );
  };

  return (
    <Card
      className={`habit-card h-full ${showCelebration ? "celebration-bounce" : ""} ${
        isCompleted ? "opacity-60" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            {name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <Badge
                variant="secondary"
                className="bg-success/10 text-success border-success/20 badge-pulse"
              >
                <Trophy className="h-3 w-3 mr-1" />
                Complété
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Options">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                  Renommer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDescOpen(true)}>
                  Modifier la description
                </DropdownMenuItem>
                {frequency === "weekly" && (
                  <DropdownMenuItem onClick={openScheduleForHabit}>
                    Configurer les jours
                  </DropdownMenuItem>
                )}
                {frequency === "monthly" && (
                  <DropdownMenuItem onClick={openScheduleForHabit}>
                    Configurer le jour du mois
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {isArchived ? (
                  <DropdownMenuItem onClick={() => unarchiveHabit?.(id)}>
                    Désarchiver
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => archiveHabit?.(id)}>
                    Archiver
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setRemoveOpen(true)}
                >
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Progression</span>
            <span
              className={`text-sm font-semibold ${getProgressColor(progress)}`}
            >
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-3 progress-indicator" />
          {isCompleted && nextAvailable && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>Prochaine date disponible</span>
              <span>{nextAvailable}</span>
            </div>
          )}
        </div>

        {(!hasCategory || !isInAnyGoal) && (
          <>
            <Separator />
            <div className="space-y-3">
              {!hasCategory && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Assigner une catégorie</div>
                  {categories.length > 0 ? (
                    <Select
                      onValueChange={(catId) => setHabitCategory(id, catId)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Aucune catégorie — créez-en une depuis le tiroir d’actions.
                    </div>
                  )}
                </div>
              )}

              {!isInAnyGoal && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Associer à un objectif</div>
                  {goals.length > 0 ? (
                    <Select onValueChange={(goalId) => addHabitToGoal(goalId, id)}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Choisir un objectif" />
                      </SelectTrigger>
                      <SelectContent>
                        {goals.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Aucun objectif — créez-en un depuis le tiroir d’actions.
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <Button
          onClick={handleProgressIncrease}
          variant="success"
          size="sm"
          className="w-full"
          disabled={isCompleted || !isDueToday}
        >
          <Plus className="h-4 w-4 mr-1" />
          {isCompleted ? "Déjà fait aujourd'hui" : isDueToday ? "Marquer fait" : "Non due aujourd'hui"}
        </Button>
      </CardContent>
      {/* Dialog note obligatoire pour valider */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une note</DialogTitle>
            <DialogDescription>
              Décrivez brièvement ce que vous avez fait pour {name} aujourd'hui.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            <Textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ex: 15 min de lecture, chapitre 2."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNoteOpen(false)}>
                Annuler
              </Button>
              <Button onClick={submitNoteAndComplete} disabled={noteText.trim().length === 0}>
                Valider et marquer fait
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Renommer */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renommer l'habitude</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRenameOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => {
                  if (renameValue.trim().length === 0) return;
                  renameHabit?.(id, renameValue.trim());
                  setRenameOpen(false);
                }}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Description */}
      <Dialog open={descOpen} onOpenChange={setDescOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la description</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Textarea
              rows={5}
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              placeholder="Décrivez l'habitu de manière concise"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDescOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => {
                  setHabitDescription?.(id, descValue.trim() || undefined);
                  setDescOpen(false);
                }}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Configurer récurrence (hebdo/mensuel) */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {frequency === "weekly" ? "Configurer les jours" : "Configurer le jour du mois"}
            </DialogTitle>
            <DialogDescription>
              {frequency === "weekly"
                ? "Choisissez les jours où l'habitude est due."
                : "Choisissez le jour du mois où l'habitude est due."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {frequency === "weekly" ? (
              <div className="grid grid-cols-7 gap-1">
                {["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"].map((lab, i) => {
                  const active = weeklyDays.includes(i);
                  return (
                    <Button
                      key={lab}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className="h-8 px-2"
                      onClick={() => toggleDay(i)}
                    >
                      {lab}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={monthlyDay}
                  onChange={(e) => setMonthlyDay(Math.max(1, Math.min(31, Number(e.target.value || 1))))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">Jour du mois</span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setScheduleOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => {
                  if (frequency === "weekly") setHabitWeeklyDays?.(id, weeklyDays);
                  else if (frequency === "monthly") setHabitMonthlyDay?.(id, monthlyDay);
                  setScheduleOpen(false);
                }}
              >
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert: Supprimer */}
      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'habitude</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible et supprimera aussi l'association avec les objectifs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                removeHabit?.(id);
                setRemoveOpen(false);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default HabitCard;
