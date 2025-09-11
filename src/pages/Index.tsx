import { useMemo, useState, useEffect, useRef } from "react";
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
  // Heures de rappel quotidiennes (HH:MM, 24h)
  const [notifyTimes, setNotifyTimes] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("habit.app.notifyTimes");
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.every((t) => typeof t === "string"))
          return arr;
      }
      const single = localStorage.getItem("habit.app.notifyTime");
      return [single || "06:30"]; // rétrocompatibilité
    } catch {
      return ["06:30"];
    }
  });
  // Jours actifs (0=Dimanche..6=Samedi)
  const [notifyDays, setNotifyDays] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem("habit.app.notifyDays");
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.every((n) => typeof n === "number"))
          return arr;
      }
    } catch (e) {
      console.warn("[Rituos] Impossible de lire notifyDays", e);
    }
    return [0, 1, 2, 3, 4, 5, 6]; // par défaut tous les jours
  });

  const [todayISO, setTodayISO] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  // Tick à minuit pour rafraîchir la date du jour (réactivation auto)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toISOString().slice(0, 10);
      setTodayISO((prev) => (prev !== now ? now : prev));
    }, 60 * 1000); // vérif min
    return () => clearInterval(interval);
  }, []);

  // Pop d'alerte en début de journée + rappels si activés
  const lastDayToastRef = useRef<string>(
    (typeof window !== "undefined" &&
      localStorage.getItem("habit.app.lastDayToast")) ||
      new Date().toISOString().slice(0, 10)
  );
  useEffect(() => {
    // Ne déclenche que lorsqu'on passe à une nouvelle journée (app ouverte)
    if (todayISO !== lastDayToastRef.current) {
      lastDayToastRef.current = todayISO;
      try {
        localStorage.setItem("habit.app.lastDayToast", todayISO);
      } catch (e) {
        console.warn("[Rituos] Impossible d'enregistrer lastDayToast", e);
      }
      // Si une des heures configurées est 00:00, on pop à minuit; sinon, on attend le scheduler
      if (notifyTimes.includes("00:00")) {
        if (
          notifyOnLoad &&
          typeof Notification !== "undefined" &&
          Notification.permission === "granted"
        ) {
          sendReminders();
        }
        const due = habits.filter(
          (h) => h.isDueOn?.(todayISO) && !h.isCompletedOn?.(todayISO)
        ).length;
        toast({
          title: "Nouvelle journée",
          description:
            due > 0
              ? `${due} habitudes à accomplir aujourd'hui.`
              : "Aucune habitude due aujourd'hui.",
        });
      }
    }
  }, [todayISO, notifyOnLoad, notifyTimes, habits, sendReminders, toast]);

  // Scheduler: pop aux heures configurées (locales), selon jours actifs, une fois par jour et par heure
  const lastDailyAlertMapRef = useRef<Record<string, string>>({});
  if (
    typeof window !== "undefined" &&
    Object.keys(lastDailyAlertMapRef.current).length === 0
  ) {
    try {
      const raw = localStorage.getItem("habit.app.lastDailyAlertMap");
      lastDailyAlertMapRef.current = raw
        ? (JSON.parse(raw) as Record<string, string>)
        : {};
    } catch (e) {
      console.warn("[Rituos] Impossible de lire lastDailyAlertMap", e);
    }
  }
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");
      const current = `${hh}:${mm}`;
      const today = now.toISOString().slice(0, 10);
      // Si le jour n'est pas actif, on ne fait rien
      const dayIdx = now.getDay();
      if (!notifyDays.includes(dayIdx)) return;
      // Pour chaque heure configurée, déclencher si match et non encore déclenchée aujourd'hui
      for (const t of notifyTimes) {
        if (t === current) {
          const last = lastDailyAlertMapRef.current[t];
          if (last !== today) {
            lastDailyAlertMapRef.current[t] = today;
            try {
              localStorage.setItem(
                "habit.app.lastDailyAlertMap",
                JSON.stringify(lastDailyAlertMapRef.current)
              );
            } catch (e) {
              console.warn(
                "[Rituos] Impossible d'enregistrer lastDailyAlertMap",
                e
              );
            }
            if (
              notifyOnLoad &&
              typeof Notification !== "undefined" &&
              Notification.permission === "granted"
            ) {
              sendReminders();
            }
            const due = habits.filter(
              (h) => h.isDueOn?.(today) && !h.isCompletedOn?.(today)
            ).length;
            toast({
              title: t === "00:00" ? "Nouvelle journée" : "Rappel quotidien",
              description:
                due > 0
                  ? `${due} habitudes à accomplir aujourd'hui.`
                  : "Aucune habitude due aujourd'hui.",
            });
          }
        }
      }
    };
    const id = setInterval(tick, 15 * 1000); // vérif toutes les 15s
    // tick immédiat au montage pour gérer les reloads proches de l'heure
    tick();
    return () => clearInterval(id);
  }, [notifyTimes, notifyDays, notifyOnLoad, sendReminders, habits, toast]);
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
  const completedHabits = dueToday.filter((h) =>
    h.isCompletedOn(todayISO)
  ).length;

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
  // Filtre d'affichage: mémorisé (par défaut: Toutes)
  const [showAllHabits, setShowAllHabits] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("habit.app.showAllHabits");
      if (raw !== null) return raw === "1";
    } catch (e) {
      console.warn("[Rituos] lecture showAllHabits échouée", e);
    }
    return true;
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "habit.app.showAllHabits",
        showAllHabits ? "1" : "0"
      );
    } catch (e) {
      console.warn("[Rituos] écriture showAllHabits échouée", e);
    }
  }, [showAllHabits]);

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

          {/* Vue habitudes: Aujourd'hui / Toutes */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {showAllHabits
                ? "Toutes les habitudes"
                : "Habitudes dues aujourd'hui"}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>Aujourd'hui</span>
              <Switch
                checked={!showAllHabits}
                onCheckedChange={(v) => setShowAllHabits(!v)}
              />
            </div>
          </div>

          {/* Message d'état si aucune habitude due aujourd'hui */}
          {!showAllHabits && dueToday.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-6 text-sm text-muted-foreground flex items-center justify-between">
                <span>Aucune habitude due aujourd'hui.</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAllHabits(true)}
                >
                  Afficher toutes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Habits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              const base = showAllHabits ? [...habits] : [...dueToday];
              // Tri: dues d'abord (incomplètes avant complétées), puis non dues
              const key = (h: (typeof habits)[number]) => {
                const due = h.isDueOn(todayISO);
                const completed = h.isCompletedOn(todayISO);
                return showAllHabits
                  ? `${due ? "0" : "1"}-${
                      completed ? "1" : "0"
                    }-${h.name.toLowerCase()}`
                  : `${completed ? "1" : "0"}-${h.name.toLowerCase()}`;
              };
              base.sort((a, b) => key(a).localeCompare(key(b)));
              return base;
            })().map((h) => (
              <HabitCard
                key={h.id}
                id={h.id}
                name={h.name}
                initialProgress={h.isCompletedOn(todayISO) ? 100 : 0}
                isDueToday={h.isDueOn(todayISO)}
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
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Heures de rappel
                </p>
                <div className="flex flex-wrap gap-2">
                  {notifyTimes.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
                    >
                      {t}
                      <button
                        aria-label={`Supprimer ${t}`}
                        className="ml-1 rounded px-1 hover:bg-muted"
                        onClick={() => {
                          const next = notifyTimes.filter((x) => x !== t);
                          setNotifyTimes(next);
                          try {
                            localStorage.setItem(
                              "habit.app.notifyTimes",
                              JSON.stringify(next)
                            );
                          } catch (e) {
                            console.warn(
                              "[Rituos] Impossible d'enregistrer notifyTimes",
                              e
                            );
                          }
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) return;
                      if (!notifyTimes.includes(v)) {
                        const next = [...notifyTimes, v].sort();
                        setNotifyTimes(next);
                        try {
                          localStorage.setItem(
                            "habit.app.notifyTimes",
                            JSON.stringify(next)
                          );
                        } catch (e) {
                          console.warn(
                            "[Rituos] Impossible d'enregistrer notifyTimes",
                            e
                          );
                        }
                      }
                    }}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Ajouter une heure par défaut si rien n'a été choisi (sécurité)
                      if (notifyTimes.length === 0) {
                        const next = ["06:30"];
                        setNotifyTimes(next);
                        try {
                          localStorage.setItem(
                            "habit.app.notifyTimes",
                            JSON.stringify(next)
                          );
                        } catch (e) {
                          console.warn(
                            "[Rituos] Impossible d'enregistrer notifyTimes",
                            e
                          );
                        }
                      }
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Jours actifs</p>
                {(() => {
                  const labels = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"]; // 0..6
                  const toggle = (idx: number) => {
                    const next = notifyDays.includes(idx)
                      ? notifyDays.filter((d) => d !== idx)
                      : [...notifyDays, idx].sort();
                    setNotifyDays(next);
                    try {
                      localStorage.setItem(
                        "habit.app.notifyDays",
                        JSON.stringify(next)
                      );
                    } catch (e) {
                      console.warn(
                        "[Rituos] Impossible d'enregistrer notifyDays",
                        e
                      );
                    }
                  };
                  return (
                    <div className="grid grid-cols-7 gap-1">
                      {labels.map((lab, i) => {
                        const active = notifyDays.includes(i);
                        return (
                          <button
                            key={lab}
                            type="button"
                            onClick={() => toggle(i)}
                            className={`h-8 rounded-md text-xs border ${
                              active
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-foreground hover:bg-muted"
                            }`}
                          >
                            {lab}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
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
