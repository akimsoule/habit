import { useState } from "react";
import Header from "@/components/Header";
import HabitCard from "@/components/HabitCard";
import FloatingAddButton from "@/components/FloatingAddButton";
import StatsOverview from "@/components/StatsOverview";
import ProgressChart from "@/components/ProgressChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Habit {
  id: string;
  name: string;
  progress: number;
}

const Index = () => {
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([
    { id: "1", name: "Drink 8 glasses of water", progress: 70 },
    { id: "2", name: "Read for 30 minutes", progress: 40 },
    { id: "3", name: "Exercise", progress: 90 },
    { id: "4", name: "Meditate", progress: 20 },
    { id: "5", name: "Learn a new language", progress: 60 },
  ]);

  const handleProgressUpdate = (habitId: string, newProgress: number) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId ? { ...habit, progress: newProgress } : habit
    ));
  };

  const handleAddHabit = () => {
    const habitNames = [
      "Practice gratitude",
      "Take vitamin D",
      "Walk 10,000 steps",
      "Eat healthy breakfast",
      "Limit screen time",
      "Call a friend",
      "Write in journal",
    ];
    
    const randomName = habitNames[Math.floor(Math.random() * habitNames.length)];
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: randomName,
      progress: 0,
    };

    setHabits(prev => [...prev, newHabit]);
    toast({
      title: "New habit added!",
      description: `"${randomName}" has been added to your habits.`,
    });
  };

  const totalHabits = habits.length;
  const completedHabits = habits.filter(habit => habit.progress >= 100).length;
  const averageProgress = Math.round(
    habits.reduce((sum, habit) => sum + habit.progress, 0) / habits.length
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Good morning! 👋
            </h2>
            <p className="text-muted-foreground">
              Keep building those positive habits. You're doing great!
            </p>
          </div>

          {/* Stats Overview */}
          <StatsOverview
            totalHabits={totalHabits}
            completedHabits={completedHabits}
            averageProgress={averageProgress}
          />

          {/* Progress Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Progression cette semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgressChart habits={habits} />
            </CardContent>
          </Card>

          {/* Habits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                name={habit.name}
                initialProgress={habit.progress}
                onProgressUpdate={(newProgress) => handleProgressUpdate(habit.id, newProgress)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Floating Add Button */}
      <FloatingAddButton onClick={handleAddHabit} />
    </div>
  );
};

export default Index;
