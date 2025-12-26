import { Habit, HabitCompletion } from '../lib/supabase';

type Props = {
  habits: Habit[];
  completions: HabitCompletion[];
  currentDate: Date;
};

export default function WeeklyView({ habits, completions, currentDate }: Props) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getWeekDates = () => {
    const normalizeDate = (d: Date) => {
  const date = new Date(d);
  date.setHours(12, 0, 0, 0);
  return date;
};

   const firstDay = normalizeDate(
  new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
);

const lastDay = normalizeDate(
  new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
);

    const dates: Date[] = [];

    for (let i = 0; i <= lastDay.getDate() - firstDay.getDate(); i++) {
  const d = normalizeDate(
    new Date(firstDay.getFullYear(), firstDay.getMonth(), i + 1)
  );
  dates.push(d);
}


    return dates;
  };
  const formatLocalDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

  const calculatePercentage = (habitId: string, dayOfWeek: number) => {
    const dates = getWeekDates();
    const daysInMonth = dates.filter(d => d.getDay() === dayOfWeek);

    const completedDays = daysInMonth.filter(date => {
      const dateStr = formatLocalDate(date);

      return completions.some(c => c.habit_id === habitId && c.date === dateStr && c.completed);
    });

    if (daysInMonth.length === 0) return 0;
    return Math.round((completedDays.length / daysInMonth.length) * 100);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-slate-300 bg-slate-50 p-3 text-left font-semibold text-slate-700">
              HABIT
            </th>
            {habits.map((habit) => (
              <th
                key={habit.id}
                className="border border-slate-300 p-3 text-white font-medium text-center min-w-[120px]"
                style={{ backgroundColor: habit.color }}
              >
                {habit.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {daysOfWeek.map((day, index) => {
            const dayIndex = index === 6 ? 0 : index + 1;

            return (
              <tr key={day}>
                <td className="border border-slate-300 bg-slate-50 p-3 font-medium text-slate-700">
                  {day}
                </td>
                {habits.map((habit) => {
                  const percentage = calculatePercentage(habit.id, dayIndex);
                  return (
                    <td
                      key={habit.id}
                      className="border border-slate-300 p-3 text-center"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 bg-white"></div>
                        <span className="text-slate-700 font-medium">{percentage}%</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
