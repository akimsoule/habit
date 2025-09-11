import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react'

interface ProgressChartProps {
  habits: Array<{ id: string; name: string; progress: number }>;
}

const ProgressChart = ({ habits }: ProgressChartProps) => {
  // Simuler des données historiques pour les 7 derniers jours
  const generateWeekData = () => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return days.map((day, index) => {
      const averageProgress = habits.reduce((sum, habit) => {
        // Simuler des variations pour créer une progression réaliste
        const variation = Math.random() * 20 - 10; // +/- 10%
        const dayProgress = Math.max(0, Math.min(100, habit.progress + variation - (6 - index) * 5));
        return sum + dayProgress;
      }, 0) / habits.length;

      return {
        day,
        progress: Math.round(averageProgress),
      };
    });
  };

  const data = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    return days.map((day, index) => {
      const averageProgress = habits.reduce((sum, habit) => {
        const variation = Math.random() * 20 - 10
        const dayProgress = Math.max(0, Math.min(100, habit.progress + variation - (6 - index) * 5))
        return sum + dayProgress
      }, 0) / Math.max(1, habits.length)
      return { day, progress: Math.round(averageProgress) }
    })
  }, [habits])

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="day"
            tickMargin={8}
            axisLine={false}
            tickLine={false}
            padding={{ left: 8, right: 8 }}
            stroke={'hsl(var(--muted-foreground))'}
            fontSize={12}
          />
          <YAxis
            domain={[0, 100]}
            width={36}
            tickMargin={8}
            axisLine={false}
            tickLine={false}
            stroke={'hsl(var(--muted-foreground))'}
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--card-foreground))'
            }}
            formatter={(value) => [`${value}%`, 'Progression moyenne']}
          />
          <Line 
            type="monotone" 
            dataKey="progress" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;