
import React, { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User>({
    username: '',
    isLoggedIn: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('news_integrity_session');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const handleAuth = (username: string) => {
    const newUser = { username, isLoggedIn: true };
    setUser(newUser);
    localStorage.setItem('news_integrity_session', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser({ username: '', isLoggedIn: false });
    localStorage.removeItem('news_integrity_session');
  };

  if (!user.isLoggedIn) {
    return <AuthForm onAuthSuccess={handleAuth} />;
  }

  return <Dashboard user={user.username} onLogout={handleLogout} />;
};

export default App;
