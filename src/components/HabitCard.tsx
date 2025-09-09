import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface HabitCardProps {
  name: string;
  initialProgress: number;
}

const HabitCard = ({ name, initialProgress }: HabitCardProps) => {
  const [progress, setProgress] = useState(initialProgress);

  const handleProgressIncrease = () => {
    setProgress(prev => Math.min(prev + 10, 100));
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return "text-success";
    if (value >= 50) return "text-primary";
    return "text-muted-foreground";
  };

  return (
    <Card className="habit-card h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-card-foreground">
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Progression</span>
            <span className={`text-sm font-semibold ${getProgressColor(progress)}`}>
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-3" />
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