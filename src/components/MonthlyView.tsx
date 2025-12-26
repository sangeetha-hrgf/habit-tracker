import { Habit, HabitCompletion } from '../lib/supabase';

type Props = {
  habits: Habit[];
  completions: HabitCompletion[];
  currentDate: Date;
  onToggle: (habitId: string, date: string) => void;
};

export default function MonthlyView({ habits, completions, currentDate, onToggle }: Props) {
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1 ,12);
    const lastDay = new Date(year, month + 1, 0,12);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
  days.push(null);
}

  const normalizeDate = (d: Date) => {
  const date = new Date(d);
  date.setHours(12, 0, 0, 0);
  return date;
};

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(normalizeDate(new Date(year, month, day)));

    }

    return days;
  };
  const formatLocalDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

  const isCompleted = (habitId: string, date: Date | null) => {
    if (!date) return false;
    const dateStr = formatLocalDate(date);
    return completions.some(c => c.habit_id === habitId && c.date === dateStr && c.completed);
  };

  const days = getDaysInMonth();
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-emerald-600 text-white text-center py-3 font-semibold text-lg">
        Monthly Habit Tracker
      </div>

      <div className="grid grid-cols-7 border-b border-slate-300">
        {dayNames.map((name) => (
          <div key={name} className="p-3 text-center font-semibold text-slate-700 bg-slate-50 border-r border-slate-300 last:border-r-0">
            {name}
          </div>
        ))}
      </div>

      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7">
          {week.map((date, dayIndex) => {
            const dateNum = date?.getDate();
            const isToday = date &&
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear();

            return (
              <div
                key={dayIndex}
                className={`border-r border-b border-slate-300 p-3 min-h-[140px] last:border-r-0 ${
                  !date ? 'bg-slate-50' : 'bg-white'
                } ${isToday ? 'bg-sky-50' : ''}`}
              >
                {date && (
                  <>
                    <div className={`text-right font-semibold mb-2 ${isToday ? 'text-sky-600' : 'text-slate-700'}`}>
                      {dateNum}
                    </div>
                    <div className="space-y-1.5">
                      {habits.map((habit) => {
                        const completed = isCompleted(habit.id, date);
                        return (
                          <div key={habit.id} className="flex items-center gap-2">
                            <button
                              onClick={() => onToggle(habit.id, formatLocalDate(date))}

                              className={`w-4 h-4 rounded border-2 transition-all flex-shrink-0 ${
                                completed
                                  ? 'border-transparent'
                                  : 'border-slate-400 bg-white hover:border-slate-600'
                              }`}
                              style={completed ? { backgroundColor: habit.color } : {}}
                            >
                              {completed && (
                                <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                            <span className="text-xs text-slate-600 truncate">{habit.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
