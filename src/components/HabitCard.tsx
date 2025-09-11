import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trophy, Star } from "lucide-react";
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

interface HabitCardProps {
  id: string;
  name: string;
  initialProgress: number; // 0 or 100 for due-today display
  onProgressUpdate?: (newProgress: number) => void;
}

const HabitCard = ({ id, name, initialProgress, onProgressUpdate }: HabitCardProps) => {
  const [progress, setProgress] = useState(initialProgress);
  const [isCompleted, setIsCompleted] = useState(initialProgress >= 100);
  const [showCelebration, setShowCelebration] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const {
    manager,
    categories,
    goals,
    setCompletionNote,
    getCompletionNote,
    setHabitCategory,
    addHabitToGoal,
  } = useHabitApp();
  const habit = manager.getHabit(id);
  const hasCategory = Boolean(habit?.category?.id);
  const isInAnyGoal = goals.some((g) => (g.getHabits?.() ?? []).some((h) => h.id === id));
  const todayISO = new Date().toISOString().slice(0, 10);

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
    if (isCompleted) return; // désactivé une fois fait pour aujourd'hui
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

  // Calcule la prochaine date due non complétée (~365 jours max)
  const computeNextAvailableDate = () => {
    if (!habit) return undefined;
    const start = new Date(todayISO);
    for (let i = 1; i <= 365; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      if (habit.isDueOn?.(iso) && !habit.isCompletedOn?.(iso)) return iso;
    }
    return undefined;
  };
  const nextAvailable = isCompleted ? computeNextAvailableDate() : undefined;

  return (
    <Card
      className={`habit-card h-full ${showCelebration ? "celebration-bounce" : ""} ${
        isCompleted ? "opacity-60" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            {name}
          </CardTitle>
          {isCompleted && (
            <Badge
              variant="secondary"
              className="bg-success/10 text-success border-success/20 badge-pulse"
            >
              <Trophy className="h-3 w-3 mr-1" />
              Complété
            </Badge>
          )}
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
          disabled={isCompleted}
        >
          <Plus className="h-4 w-4 mr-1" />
          {isCompleted ? "Déjà fait aujourd'hui" : "Marquer fait"}
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
    </Card>
  );
};

export default HabitCard;
