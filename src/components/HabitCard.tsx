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
  const { setCompletionNote, getCompletionNote } = useHabitApp();

  useEffect(() => {
    if (progress >= 100 && !isCompleted) {
      setIsCompleted(true);
      setShowCelebration(true);

      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#8b5cf6"],
      });

      // Remove celebration animation after it completes
      setTimeout(() => setShowCelebration(false), 600);
    }
  }, [progress, isCompleted]);

  const handleProgressIncrease = () => {
    // Si on passe de non fait -> fait, exiger une note
    if (progress < 100) {
      // Pré-remplir si une note existe déjà pour aujourd'hui
      const todayISO = new Date().toISOString().slice(0, 10);
      const existing = getCompletionNote?.(id, todayISO);
      setNoteText(existing ?? "");
      setNoteOpen(true);
      return;
    }
    // Si on passe de fait -> non fait
    const newProgress = 0;
    setProgress(newProgress);
    onProgressUpdate?.(newProgress);
  };

  const submitNoteAndComplete = () => {
    const todayISO = new Date().toISOString().slice(0, 10);
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

  return (
    <Card
      className={`habit-card h-full ${
        showCelebration ? "celebration-bounce" : ""
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
        </div>

        <Button
          onClick={handleProgressIncrease}
          variant="success"
          size="sm"
          className="w-full"
          // act as toggle button
        >
          <Plus className="h-4 w-4 mr-1" />
          {progress >= 100 ? "Marquer non fait" : "Marquer fait"}
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
