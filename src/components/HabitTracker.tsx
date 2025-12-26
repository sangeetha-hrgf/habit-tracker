import { useState, useEffect } from 'react';
import { supabase, Habit, HabitCompletion } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import WeeklyView from './WeeklyView';
import MonthlyView from './MonthlyView';

export default function HabitTracker() {
  const { user, signOut } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#a78bfa');

  const PRESET_COLORS = [
    '#a78bfa', '#fbbf24', '#86efac', '#60a5fa', '#f472b6', '#fb923c', '#a3e635', '#c084fc'
  ];

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('order');

      if (habitsData) setHabits(habitsData);
      const formatLocalDate = (date: Date) => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        };

                const startOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1,
            12
          );

          const endOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0,
            12
          );


      const { data: completionsData } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', formatLocalDate(startOfMonth))
        .lte('date', formatLocalDate(endOfMonth));


      if (completionsData) setCompletions(completionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async () => {
    if (!user || !newHabitName.trim()) return;

    const { error } = await supabase
      .from('habits')
      .insert({
        user_id: user.id,
        name: newHabitName.trim(),
        color: newHabitColor,
        order: habits.length,
      });

    if (!error) {
      setNewHabitName('');
      setShowAddHabit(false);
      loadData();
    }
  };

  const deleteHabit = async (habitId: string) => {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId);

    if (!error) loadData();
  };

  const toggleCompletion = async (habitId: string, date: string) => {
    if (!user) return;

    const existing = completions.find(
      (c) => c.habit_id === habitId && c.date === date
    );

    if (existing) {
      await supabase
        .from('habit_completions')
        .delete()
        .eq('id', existing.id);
    } else {
      await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          user_id: user.id,
          date,
          completed: true,
        });
    }

    loadData();
  };

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Monthly Habit Tracker</h1>
            <p className="text-slate-600 mt-1">{user?.email}</p>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Your Habits</h2>
            <button
              onClick={() => setShowAddHabit(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
            >
              <Plus size={20} />
              Add Habit
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="relative p-3 rounded-lg text-white font-medium group"
                style={{ backgroundColor: habit.color }}
              >
                {habit.name}
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black/20 hover:bg-black/40 rounded p-1 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {showAddHabit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Add New Habit</h3>
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Habit name"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                autoFocus
              />
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">Choose a color:</p>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewHabitColor(color)}
                      className={`w-10 h-10 rounded-lg transition ${
                        newHabitColor === color ? 'ring-2 ring-slate-800 ring-offset-2' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addHabit}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddHabit(false);
                    setNewHabitName('');
                  }}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="text-center">
              <div className="text-sm text-slate-600">Year:</div>
              <div className="text-2xl font-bold text-sky-500">{currentDate.getFullYear()}</div>
              <div className="text-sm text-slate-600 mt-2">Month:</div>
              <div className="text-2xl font-bold text-sky-500">
                {currentDate.toLocaleString('default', { month: 'long' })}
              </div>
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <WeeklyView
            habits={habits}
            completions={completions}
            currentDate={currentDate}
          />
        </div>

        <MonthlyView
          habits={habits}
          completions={completions}
          currentDate={currentDate}
          onToggle={toggleCompletion}
        />
      </div>
    </div>
  );
}
