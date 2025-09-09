import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trophy, Star } from "lucide-react";
import confetti from 'canvas-confetti';

interface HabitCardProps {
  name: string;
  initialProgress: number;
  onProgressUpdate?: (newProgress: number) => void;
}

const HabitCard = ({ name, initialProgress, onProgressUpdate }: HabitCardProps) => {
  const [progress, setProgress] = useState(initialProgress);
  const [isCompleted, setIsCompleted] = useState(initialProgress >= 100);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (progress >= 100 && !isCompleted) {
      setIsCompleted(true);
      setShowCelebration(true);
      
      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6']
      });
      
      // Remove celebration animation after it completes
      setTimeout(() => setShowCelebration(false), 600);
    }
  }, [progress, isCompleted]);

  const handleProgressIncrease = () => {
    const newProgress = Math.min(progress + 10, 100);
    setProgress(newProgress);
    onProgressUpdate?.(newProgress);
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return "text-success";
    if (value >= 50) return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <Card className={`habit-card h-full ${showCelebration ? 'celebration-bounce' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-card-foreground">
            {name}
          </CardTitle>
          {isCompleted && (
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20 badge-pulse">
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
            <span className={`text-sm font-semibold ${getProgressColor(progress)}`}>
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
          disabled={progress >= 100}
        >
          <Plus className="h-4 w-4 mr-1" />
          +10% Progress
        </Button>
      </CardContent>
    </Card>
  );
};

export default HabitCard;