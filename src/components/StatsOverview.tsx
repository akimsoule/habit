import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StatsOverviewProps {
  totalHabits: number;
  completedHabits: number;
  averageProgress: number;
}

const StatsOverview = ({ totalHabits, completedHabits, averageProgress }: StatsOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Habits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{totalHabits}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Completed Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{completedHabits}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Average Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-2xl font-bold text-primary">{averageProgress}%</div>
          <Progress value={averageProgress} className="h-2" />
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;