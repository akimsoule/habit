import { useMemo, useState, useEffect } from "react";
import Header from "@/components/Header";
import HabitCard from "@/components/HabitCard";
import FloatingAddButton from "@/components/FloatingAddButton";
import StatsOverview from "@/components/StatsOverview";
import ProgressChart from "@/components/ProgressChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// removed inline inputs/selects for quick actions; creation now via modals only
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useHabitApp } from "@/providers/habitContext";
// Priority no longer used here
import AddHabitModal from "@/components/AddHabitModal";
import AddGoalModal from "@/components/AddGoalModal";
import AddCategoryModal from "@/components/AddCategoryModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import StatsHero from "@/components/StatsHero";
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

const Index = () => {
  const { toast } = useToast();
  const {
    manager,
    categories,
    habits,
    goals,
    removeGoal,
    toggleHabitToday,
    requestNotifications,
    sendReminders,
    resetAll,
  } = useHabitApp();

  // Notifications prefs
  const [notifyOnLoad, setNotifyOnLoad] = useState<boolean>(
    () => localStorage.getItem("habit.app.notifyOnLoad") === "1"
  );

  const [todayISO, setTodayISO] = useState<string>(new Date().toISOString().slice(0, 10));
  // Tick à minuit pour rafraîchir la date du jour (réactivation auto)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toISOString().slice(0, 10);
      setTodayISO((prev) => (prev !== now ? now : prev));
    }, 60 * 1000); // vérif min
    return () => clearInterval(interval);
  }, []);
  // Inclure toutes les habitudes dues aujourd'hui, même si déjà complétées
  const dueToday = useMemo(
    () => habits.filter((h) => h.isDueOn(todayISO)),
    [habits, todayISO]
  );
  const nearest = manager.getNearestDueDateProgress(todayISO, todayISO);

  const totalHabits = habits.length;
  const averageProgress = Math.round(
    habits.reduce(
      (sum, h) => sum + Math.round(h.getProgress(todayISO, todayISO) * 100),
      0
    ) / Math.max(1, habits.length)
  );
  const completedHabits = dueToday.filter((h) => h.isCompletedOn(todayISO)).length;

  const askNotifications = async () => {
    const perm = await requestNotifications();
    toast({ title: "Notifications", description: `Permission: ${perm}` });
  };

  const onToggleNotify = (v: boolean) => {
    setNotifyOnLoad(v);
    localStorage.setItem("habit.app.notifyOnLoad", v ? "1" : "0");
    if (v && Notification.permission === "granted") sendReminders();
  };

  const [openAddHabit, setOpenAddHabit] = useState(false);
  const [openAddGoal, setOpenAddGoal] = useState(false);
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [openQuickDrawer, setOpenQuickDrawer] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenQuickActions={() => setOpenQuickDrawer(true)} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero stats header */}
          <StatsHero />

          {/* Categories */}
          {showAdvanced && categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Catégories</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Badge key={c.id} variant="secondary">
                    {c.name} · {manager.getHabitsByCategory(c.id).length}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Goals */}
          {showAdvanced && goals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Objectifs SMART{" "}
                  {nearest ? (
                    <span className="text-sm text-muted-foreground">
                      · Prioritaire: {nearest.goalName} avant {nearest.dueDate}{" "}
                      ({nearest.progress.toFixed(1)}%)
                    </span>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {goals.map((g) => {
                  const p = Math.round(g.getProgress(todayISO) * 100);
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const due = (g as any).dueDate as string | undefined;
                  return (
                    <div
                      key={g.id}
                      className="flex flex-col gap-2 p-3 rounded-md border"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{g.name}</div>
                        <div className="flex items-center gap-2">
                          {due ? (
                            <Badge variant="outline">Due: {due}</Badge>
                          ) : null}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeGoal(g.id)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>
                      <Progress value={p} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Stats Overview */}
          {showAdvanced && (
            <StatsOverview
              totalHabits={totalHabits}
              completedHabits={completedHabits}
              averageProgress={averageProgress}
            />
          )}

          {/* Progress Chart */}
          {showAdvanced && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Progression cette semaine
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const today = new Date(todayISO);
                  const yesterday = new Date(today);
                  yesterday.setDate(today.getDate() - 1);
                  const weekStart = new Date(today);
                  weekStart.setDate(today.getDate() - 6);
                  const yISO = yesterday.toISOString().slice(0, 10);
                  const wsISO = weekStart.toISOString().slice(0, 10);
                  return (
                    <ProgressChart
                      habits={habits.map((h) => ({
                        id: h.id,
                        name: h.name,
                        // Exclure la journée en cours du calcul
                        progress: Math.round(h.getProgress(wsISO, yISO) * 100),
                      }))}
                    />
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Habits Grid (due today) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dueToday.map((h) => (
              <HabitCard
                key={h.id}
                id={h.id}
                name={h.name}
                initialProgress={h.isCompletedOn(todayISO) ? 100 : 0}
                onProgressUpdate={() => toggleHabitToday(h.id)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Floating Add Button adds a quick daily habit */}
      <FloatingAddButton onClick={() => setOpenAddHabit(true)} />
      <AddHabitModal open={openAddHabit} onOpenChange={setOpenAddHabit} />
      <AddGoalModal open={openAddGoal} onOpenChange={setOpenAddGoal} />
      <AddCategoryModal
        open={openAddCategory}
        onOpenChange={setOpenAddCategory}
      />

      {/* Right drawer for quick actions */}
      <Sheet open={openQuickDrawer} onOpenChange={setOpenQuickDrawer}>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Actions rapides</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Catégorie</p>
              <Button
                className="w-full"
                onClick={() => {
                  setOpenAddCategory(true);
                  setOpenQuickDrawer(false);
                }}
              >
                Créer une catégorie
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Habitude</p>
              <Button
                className="w-full"
                onClick={() => {
                  setOpenAddHabit(true);
                  setOpenQuickDrawer(false);
                }}
              >
                Créer une habitude
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Objectif SMART</p>
              <Button
                className="w-full"
                onClick={() => {
                  setOpenAddGoal(true);
                  setOpenQuickDrawer(false);
                }}
              >
                Créer un objectif
              </Button>
            </div>
            <div className="pt-2 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={askNotifications}
                >
                  Autoriser les notifications
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={sendReminders}
                >
                  Envoyer les rappels
                </Button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch
                  checked={notifyOnLoad}
                  onCheckedChange={onToggleNotify}
                />
                <span>Rappels au chargement</span>
              </div>
              <div className="pt-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Réinitialiser toutes les données
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Confirmer la réinitialisation
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action va supprimer toutes vos catégories,
                        habitudes, objectifs et préférences locales. Cette
                        opération est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex justify-end gap-2">
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          resetAll();
                          setOpenQuickDrawer(false);
                          toast({
                            title: "Données réinitialisées",
                            description:
                              "Votre application a été réinitialisée. Vous pouvez repartir de zéro.",
                          });
                        }}
                      >
                        Oui, réinitialiser
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
