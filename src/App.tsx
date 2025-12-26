import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import HabitTracker from './components/HabitTracker';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return user ? <HabitTracker /> : <Auth />;
}

export default App;
