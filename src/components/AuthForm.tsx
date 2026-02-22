
import React, { useState } from 'react';
import { LOGIN_CREDENTIALS, APP_NAME } from '../constants';

interface AuthFormProps {
  onAuthSuccess: (username: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === LOGIN_CREDENTIALS.username && password === LOGIN_CREDENTIALS.password) {
      onAuthSuccess(username);
    } else {
      setError('Invalid credentials. Use: admin / password123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020203] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-sm relative z-10 space-y-12">
        <div className="text-center space-y-6">
           <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/20 mb-8 transform hover:scale-105 transition-transform">
             <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
           </div>
           <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{APP_NAME}</h1>
           <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Advanced Content Authentication</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                required
                className="w-full px-6 py-5 bg-zinc-900/50 border border-white/5 rounded-[24px] text-white placeholder:text-zinc-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all font-bold"
                placeholder="User ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <input
                type="password"
                required
                className="w-full px-6 py-5 bg-zinc-900/50 border border-white/5 rounded-[24px] text-white placeholder:text-zinc-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none transition-all font-bold"
                placeholder="Secure Token"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-[18px]">
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-6 bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-[0.3em] text-[11px] rounded-[24px] transition-all active:scale-[0.98] shadow-2xl shadow-indigo-500/10"
          >
            Access Portal
          </button>
        </form>

        <div className="pt-12 border-t border-white/5 flex justify-between items-center opacity-30 text-[9px] font-black uppercase tracking-[0.2em]">
           <span>Secure Gateway v5.0</span>
           <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Encrypted</span>
        </div>
      </div>
    </div>
  );
};
