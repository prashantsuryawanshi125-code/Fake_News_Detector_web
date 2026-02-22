
import React, { useState, useEffect, useRef } from 'react';
import { HistoryItem, AnalysisResult, TrendingArticle, User } from '../types';
import { analyzeNewsArticle, getTrendingNews } from '../services/geminiService';
import { AnalysisCharts } from './Visualizations';
import { DatasetAnalysis } from './DatasetAnalysis';
import { APP_NAME } from '../constants';

interface SavedArticle {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  result: AnalysisResult;
}

const FORENSIC_SAMPLES = [
  {
    label: "Real News Example",
    title: "Global Climate Accord Reached in Paris",
    content: "World leaders have officially signed a landmark agreement to reduce carbon emissions by 40% over the next decade. The treaty includes binding targets for major industrial nations and a multi-billion dollar fund to support developing economies in their transition to green energy.",
    type: "REAL"
  },
  {
    label: "Fake News Example",
    title: "Hidden Moon Base Discovered by Amateur Astronomers",
    content: "Breaking: A group of amateur astronomers using modified telescopes claim to have found a secret city on the dark side of the moon. They allege that world governments have been hiding this civilization for decades, and that the lights of the city are visible if you use special filters.",
    type: "FAKE"
  }
];

export const Dashboard: React.FC<{ user: string; onLogout: () => void }> = ({ user, onLogout }) => {
  const [inputTitle, setInputTitle] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [trendingArticles, setTrendingArticles] = useState<TrendingArticle[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [showHistory, setShowHistory] = useState(true); // Default open on large screens
  const [activeTab, setActiveTab] = useState<'ANALYZE' | 'DATASET'>('ANALYZE');

  const [autoSentryEnabled, setAutoSentryEnabled] = useState(true);
  const [latestAutoResult, setLatestAutoResult] = useState<{title: string, result: AnalysisResult} | null>(null);
  const sentryTimerRef = useRef<number>(null);

  // Initialize History and Trends
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const trends = await getTrendingNews();
        setTrendingArticles(trends);
      } catch (err: any) {
        if (err.message === "QUOTA_EXCEEDED") setIsBusy(true);
      } finally {
        setIsLoadingTrends(false);
      }
    };
    fetchTrends();

    const savedHistory = localStorage.getItem(`news_forensic_history_${user}`);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, [user]);

  // Persist history whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(`news_forensic_history_${user}`, JSON.stringify(history));
    }
  }, [history, user]);

  const runAutoSentry = async () => {
    if (!autoSentryEnabled || isBusy) return;
    try {
      const trends = await getTrendingNews();
      if (trends?.length > 0) {
        const random = trends[Math.floor(Math.random() * trends.length)];
        const result = await analyzeNewsArticle(random.title, random.description);
        const res = { ...result, imageUrl: random.imageUrl };
        setLatestAutoResult({ title: random.title, result: res });
        
        // Auto-sentry items also go to history
        addToHistory(random.title, res);
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (autoSentryEnabled) {
      runAutoSentry();
      sentryTimerRef.current = window.setInterval(runAutoSentry, 3600000);
    } else if (sentryTimerRef.current) clearInterval(sentryTimerRef.current);
    return () => { if (sentryTimerRef.current) clearInterval(sentryTimerRef.current); };
  }, [autoSentryEnabled]);

  const addToHistory = (title: string, result: AnalysisResult) => {
    setHistory(prev => {
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        title: title || 'Deep Scan Result',
        timestamp: Date.now(),
        result: result
      };
      // Keep unique by title to prevent clutter, and limit to 50
      const filtered = prev.filter(h => h.title !== title);
      return [newItem, ...filtered].slice(0, 50);
    });
  };

  const handleAnalyze = async (title?: string, content?: string, imageUrl?: string) => {
    const targetTitle = title || inputTitle;
    const targetContent = content || inputContent;

    if (!targetContent.trim() || targetContent.length < 20) {
      setError("Content payload too light (min 20 chars).");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeNewsArticle(targetTitle, targetContent);
      const res = { ...result, imageUrl: imageUrl || result.imageUrl };
      setCurrentResult(res);
      addToHistory(targetTitle, res);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message === "QUOTA_EXCEEDED" ? "Neural Core Calibrating. Wait 10s." : "Forensic stream interrupted.");
      if (err.message === "QUOTA_EXCEEDED") {
        setIsBusy(true);
        setTimeout(() => setIsBusy(false), 10000);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setCurrentResult(item.result);
    setInputTitle(item.title);
    setInputContent(item.result.summary);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToDataset = (item: HistoryItem) => {
    const saved = localStorage.getItem('custom_dataset');
    const customArticles = saved ? JSON.parse(saved) : [];
    
    // Check if already exists
    if (customArticles.some((a: any) => a.title === item.title)) {
      alert("Article already in dataset.");
      return;
    }

    const newArticle = {
      id: `custom-${Math.random().toString(36).substr(2, 5)}`,
      title: item.title,
      content: item.result.summary,
      label: item.result.category === 'REAL' ? 'REAL' : 'FAKE'
    };

    const updated = [...customArticles, newArticle];
    localStorage.setItem('custom_dataset', JSON.stringify(updated));
    alert("Added to Dataset Lab for benchmarking.");
  };

  return (
    <div className="flex h-screen bg-[#020203] text-zinc-400 font-inter overflow-hidden relative">
      {/* LEFT NAVIGATION */}
      <aside className="w-20 lg:w-24 bg-zinc-950 border-r border-white/5 flex flex-col items-center py-8 z-40 shrink-0">
        <div 
          onClick={() => setCurrentResult(null)}
          className="w-12 h-12 bg-white rounded-[20px] flex items-center justify-center mb-12 shadow-2xl cursor-pointer hover:scale-105 transition-all"
        >
           <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <nav className="space-y-8 flex-1">
          <button 
            onClick={() => { setActiveTab('ANALYZE'); setCurrentResult(null); }} 
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'ANALYZE' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
          >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          </button>
          <button 
            onClick={() => { setActiveTab('DATASET'); setCurrentResult(null); }} 
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'DATASET' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-zinc-500 hover:text-white'}`}
          >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2zm0 0l8 7 8-7" /></svg>
          </button>
          <button onClick={() => setShowHistory(!showHistory)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${showHistory ? 'bg-indigo-600/20 text-indigo-400' : 'bg-white/5 text-zinc-500 hover:text-white'}`}>
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
        </nav>
        <button onClick={onLogout} className="w-12 h-12 flex items-center justify-center text-zinc-600 hover:text-white transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </aside>

      {/* CENTER MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-12 scroll-smooth">
        <div className="max-w-5xl mx-auto space-y-12 pb-24">
          <header className="flex items-center justify-between">
            <div className="space-y-1">
               <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">{APP_NAME}</h2>
               <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]">Forensic HD Node</p>
            </div>
            <div className="flex items-center gap-6 bg-white/5 border border-white/5 px-6 py-3 rounded-full shadow-lg backdrop-blur-md">
               <span className={`text-[8px] font-black uppercase tracking-widest ${isBusy ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`}>
                 {isBusy ? 'Core Hot' : autoSentryEnabled ? 'Sentry Stream Active' : 'Manual Mode'}
               </span>
               <button onClick={() => setAutoSentryEnabled(!autoSentryEnabled)} className={`w-10 h-5 rounded-full transition-all relative flex items-center ${autoSentryEnabled ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
                 <div className={`w-4 h-4 bg-white rounded-full transition-all transform shadow-sm ${autoSentryEnabled ? 'translate-x-5' : 'translate-x-1'}`}></div>
               </button>
            </div>
          </header>

          {activeTab === 'DATASET' ? (
            <DatasetAnalysis />
          ) : currentResult ? (
            <section className="animate-in fade-in slide-in-from-top-6 duration-500">
               <div className="flex items-center justify-between mb-8">
                  <button onClick={() => setCurrentResult(null)} className="px-6 py-3 bg-white/5 border border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-3">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Discard Report
                  </button>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Operator: {user}</span>
                  </div>
               </div>

               <div className="relative aspect-video w-full rounded-[48px] overflow-hidden mb-12 border border-white/10 shadow-2xl bg-zinc-900 group">
                 <img 
                    src={currentResult.imageUrl} 
                    className="w-full h-full object-cover object-center transition-transform duration-[12s] group-hover:scale-110" 
                    alt="Scan Focus" 
                    onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                    style={{ opacity: 0, transition: 'opacity 0.8s' }}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                 <div className="absolute inset-0 flex flex-col justify-end p-12 lg:p-16">
                    <div className="max-w-4xl space-y-6">
                      <div className="flex items-center gap-4">
                        <span className={`px-5 py-2 rounded-full text-[11px] font-black uppercase border tracking-[0.2em] shadow-2xl ${currentResult.category === 'REAL' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/20' : 'border-rose-500 text-rose-400 bg-rose-500/20'}`}>
                          {currentResult.category} VERDICT
                        </span>
                        <div className="h-px w-12 bg-white/10"></div>
                        <span className="text-[11px] font-black text-white uppercase tracking-widest drop-shadow-lg">{currentResult.score}% Neural Confidence</span>
                      </div>
                      <h3 className="text-3xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-2xl italic">{currentResult.summary}</h3>
                    </div>
                 </div>
                 <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 rounded-[48px]"></div>
               </div>

               <div className="glass-card p-10 lg:p-16 rounded-[48px] border border-white/5 glow-indigo">
                 <div className="flex flex-col items-center mb-12 text-center">
                   <h4 className="text-xs font-black text-zinc-600 uppercase tracking-[0.5em] mb-4">LSTM Forensic Sequence</h4>
                   <div className="w-16 h-1 bg-indigo-500/30 rounded-full animate-pulse"></div>
                 </div>
                 <AnalysisCharts data={currentResult} />
               </div>
            </section>
          ) : (
            <section className="space-y-16 py-8 animate-in fade-in duration-700">
               <div className="text-center space-y-4">
                  <h1 className="text-6xl lg:text-9xl font-black text-white tracking-tighter uppercase italic leading-none">FORENSIC<span className="text-zinc-900 ml-4">HD</span></h1>
                  <p className="text-[11px] font-black text-zinc-700 uppercase tracking-[1em]">Neural Core Authentication Interface</p>
               </div>

               {/* Quick Forensic Samples */}
               <div className="max-w-4xl mx-auto grid grid-cols-2 gap-6">
                  {FORENSIC_SAMPLES.map((sample, idx) => (
                    <button 
                      key={idx}
                      onClick={() => { setInputTitle(sample.title); setInputContent(sample.content); }}
                      className={`p-6 rounded-[32px] border text-left transition-all hover:scale-105 active:scale-95 group relative overflow-hidden ${sample.type === 'REAL' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}
                    >
                       <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${sample.type === 'REAL' ? 'text-emerald-500' : 'text-rose-500'}`}>{sample.label}</p>
                       <h5 className="text-white font-bold text-sm leading-tight line-clamp-1 italic">{sample.title}</h5>
                    </button>
                  ))}
               </div>

               <div className="glass-card p-10 rounded-[48px] border border-white/5 group relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none"></div>
                 <div className="space-y-10 relative">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] ml-2">Authenticity Headline</label>
                      <input 
                        className="w-full bg-transparent text-2xl lg:text-4xl font-black text-white placeholder:text-zinc-900 border-none outline-none focus:ring-0" 
                        placeholder="Subject identifier..." 
                        value={inputTitle} 
                        onChange={(e) => setInputTitle(e.target.value)} 
                        disabled={isBusy}
                      />
                    </div>
                    <div className="h-px bg-white/5 w-full"></div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] ml-2">Neural Payload (Content Body)</label>
                      <textarea 
                        className="w-full h-44 bg-transparent text-lg font-medium text-zinc-500 placeholder:text-zinc-900 border-none outline-none resize-none leading-relaxed focus:ring-0" 
                        placeholder="Paste article body for forensic verification..." 
                        value={inputContent} 
                        onChange={(e) => setInputContent(e.target.value)} 
                        disabled={isBusy}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-6">
                       <div className="flex items-center gap-4">
                         <div className={`w-3 h-3 rounded-full ${isBusy ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}></div>
                         <span className="text-[10px] font-black uppercase text-zinc-700 tracking-[0.2em]">{isBusy ? 'System Busy' : 'Neural Core Ready'}</span>
                       </div>
                       <button 
                        onClick={() => handleAnalyze()} 
                        disabled={isAnalyzing || isBusy} 
                        className="px-16 py-7 bg-white text-black rounded-[32px] font-black uppercase tracking-[0.3em] text-[12px] hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl"
                       >
                         {isAnalyzing ? 'Analyzing...' : 'Execute Scan'}
                       </button>
                    </div>
                 </div>
               </div>

               {error && (
                 <div className="flex items-center justify-center p-6 bg-rose-500/5 border border-rose-500/10 rounded-[24px] animate-pulse">
                   <p className="text-[11px] font-black uppercase tracking-widest text-rose-500 text-center">{error}</p>
                 </div>
               )}

               <div className="space-y-16">
                  <div className="flex items-center justify-between border-b border-white/5 pb-8">
                    <h3 className="text-sm font-black uppercase tracking-[0.5em] text-white italic">Live Trending Stream</h3>
                    <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">Real-time Data Fetching: Online</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {isLoadingTrends ? (
                       [1,2,3,4,5,6].map(i => <div key={i} className="aspect-[4/5] bg-white/5 rounded-[48px] animate-pulse"></div>)
                    ) : (
                      trendingArticles.map((article) => (
                        <div key={article.id} className="glass-card group overflow-hidden rounded-[48px] border border-white/5 transition-all flex flex-col cursor-pointer hover:border-indigo-500/30 shadow-xl" onClick={() => handleAnalyze(article.title, article.description, article.imageUrl)}>
                          <div className="aspect-video w-full relative overflow-hidden bg-zinc-900">
                             <img 
                                src={article.imageUrl} 
                                className="w-full h-full object-cover transition-transform duration-[4s] group-hover:scale-110" 
                                alt={article.title} 
                                onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                                style={{ opacity: 0, transition: 'opacity 0.5s' }}
                             />
                             <div className="absolute top-6 right-6 px-4 py-2 rounded-full text-[10px] font-black uppercase border border-white/20 bg-black/60 backdrop-blur-md text-white">{article.type}</div>
                          </div>
                          <div className="p-8 space-y-4 flex-1 flex flex-col">
                             <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600 uppercase tracking-widest">
                                <span>{article.source}</span>
                                <span>{article.timestamp}</span>
                             </div>
                             <h4 className="text-xl font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2 tracking-tight italic">{article.title}</h4>
                             <p className="text-[13px] text-zinc-500 line-clamp-2 leading-relaxed font-medium">{article.description}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
               </div>
            </section>
          )}
        </div>
      </main>

      {/* RIGHT HISTORY SIDEBAR */}
      {showHistory && (
        <aside className="w-80 lg:w-96 bg-zinc-950/50 border-l border-white/5 flex flex-col z-40 shrink-0 backdrop-blur-3xl animate-in slide-in-from-right duration-500">
           <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white">Forensic History</h3>
              <button onClick={() => setShowHistory(false)} className="p-2 text-zinc-700 hover:text-white transition-colors">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
           <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {history.length > 0 ? history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => loadFromHistory(item)}
                  className="group bg-white/5 border border-white/5 p-4 rounded-[28px] hover:bg-white/10 transition-all cursor-pointer hover:border-indigo-500/30"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-zinc-900 border border-white/5">
                      <img src={item.result.imageUrl} className="w-full h-full object-cover" alt="Thumb" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${item.result.category === 'REAL' ? 'border-emerald-500/30 text-emerald-400' : 'border-rose-500/30 text-rose-400'}`}>{item.result.category}</span>
                          <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToDataset(item); }}
                          className="p-2 bg-white/5 rounded-lg hover:bg-indigo-600/20 hover:text-indigo-400 transition-all"
                          title="Add to Dataset Lab"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                      <h5 className="text-[13px] font-bold text-zinc-200 group-hover:text-white line-clamp-1 truncate">{item.title}</h5>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                   <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em]">No forensic data</p>
                </div>
              )}
           </div>
           <div className="p-8 border-t border-white/5">
              <button 
                onClick={() => { setHistory([]); localStorage.removeItem(`news_forensic_history_${user}`); }}
                className="w-full py-4 border border-white/5 text-zinc-700 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-all"
              >
                Clear Forensic Log
              </button>
           </div>
        </aside>
      )}
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
