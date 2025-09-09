import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  const data = generateWeekData();

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="day" 
            className="text-muted-foreground"
            fontSize={12}
          />
          <YAxis 
            className="text-muted-foreground"
            fontSize={12}
            domain={[0, 100]}
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