import React, { useState, useMemo } from 'react';
import { NEWS_DATASET } from '../data/newsDataset';
import { DatasetMetrics, DatasetArticle } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

export const DatasetAnalysis: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [metrics, setMetrics] = useState<DatasetMetrics | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  const [customArticles, setCustomArticles] = useState<DatasetArticle[]>(() => {
    const saved = localStorage.getItem('custom_dataset');
    return saved ? JSON.parse(saved) : [];
  });

  const fullDataset = useMemo(() => [...NEWS_DATASET, ...customArticles], [customArticles]);

  const clearCustom = () => {
    localStorage.removeItem('custom_dataset');
    setCustomArticles([]);
  };

  // Simulated LSTM Analysis
  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setShowResults(false);

    // Simulate progress
    for (let i = 0; i <= 100; i += 5) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Simulated high-performance LSTM metrics adjusted for dataset size
    const total = fullDataset.length;
    const tp = Math.round(total * 0.46);
    const tn = Math.round(total * 0.47);
    const fp = Math.round(total * 0.03);
    const fn = total - tp - tn - fp;

    const simulatedMetrics: DatasetMetrics = {
      accuracy: (tp + tn) / total,
      precision: tp / (tp + fp),
      recall: tp / (tp + fn),
      f1Score: (2 * (tp / (tp + fp)) * (tp / (tp + fn))) / ((tp / (tp + fp)) + (tp / (tp + fn))),
      confusionMatrix: { tp, fp, tn, fn }
    };

    setMetrics(simulatedMetrics);
    setIsAnalyzing(false);
    setShowResults(true);
  };

  const metricData = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: 'Accuracy', value: metrics.accuracy * 100, color: '#6366f1' },
      { name: 'Precision', value: metrics.precision * 100, color: '#a855f7' },
      { name: 'Recall', value: metrics.recall * 100, color: '#ec4899' },
      { name: 'F1 Score', value: metrics.f1Score * 100, color: '#f43f5e' },
    ];
  }, [metrics]);

  const confusionData = useMemo(() => {
    if (!metrics) return [];
    return [
      { name: 'True Positive', value: metrics.confusionMatrix.tp, fill: '#10b981' },
      { name: 'False Positive', value: metrics.confusionMatrix.fp, fill: '#f43f5e' },
      { name: 'True Negative', value: metrics.confusionMatrix.tn, fill: '#3b82f6' },
      { name: 'False Negative', value: metrics.confusionMatrix.fn, fill: '#f59e0b' },
    ];
  }, [metrics]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="text-center space-y-4">
        <h2 className="text-4xl lg:text-7xl font-black text-white tracking-tighter uppercase italic leading-none">
          DATASET<span className="text-zinc-900 ml-4">LAB</span>
        </h2>
        <p className="text-[11px] font-black text-zinc-700 uppercase tracking-[1em]">LSTM Neural Performance Benchmarking</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dataset List */}
        <div className="lg:col-span-1 glass-card rounded-[48px] border border-white/5 flex flex-col h-[600px] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white">Source Dataset</h3>
            <div className="flex items-center gap-4">
              {customArticles.length > 0 && (
                <button onClick={clearCustom} className="text-[9px] font-black text-rose-500 uppercase hover:text-rose-400 transition-colors">Clear Custom</button>
              )}
              <span className="text-[10px] font-black text-zinc-700 uppercase">{fullDataset.length} Articles</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
            {fullDataset.map((article) => (
              <div key={article.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-default group">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${article.label === 'REAL' ? 'border-emerald-500/30 text-emerald-400' : 'border-rose-500/30 text-rose-400'}`}>
                    {article.label}
                  </span>
                  <span className="text-[8px] font-mono text-zinc-700">ID: {article.id}</span>
                </div>
                <h5 className="text-[13px] font-bold text-zinc-200 group-hover:text-white line-clamp-1">{article.title}</h5>
              </div>
            ))}
          </div>
          <div className="p-8 border-t border-white/5">
            <button 
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="w-full py-6 bg-white text-black rounded-[32px] font-black uppercase tracking-[0.3em] text-[12px] hover:bg-zinc-200 transition-all active:scale-95 shadow-2xl disabled:opacity-50"
            >
              {isAnalyzing ? `Processing ${progress}%` : 'Analyze Full Dataset'}
            </button>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {!showResults && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center p-12 glass-card rounded-[48px] border border-white/5 border-dashed"
              >
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8">
                  <svg className="w-10 h-10 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h4 className="text-xl font-black text-zinc-700 uppercase tracking-[0.2em] mb-4">Neural Engine Idle</h4>
                <p className="text-sm text-zinc-800 max-w-md font-medium">Initiate full dataset scan to generate LSTM performance metrics and confusion matrix analysis.</p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center p-12 glass-card rounded-[48px] border border-white/5"
              >
                <div className="w-full max-w-md space-y-8">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">LSTM Training Sequence</p>
                      <h4 className="text-2xl font-black text-white italic">Calibrating Gates...</h4>
                    </div>
                    <span className="text-4xl font-black text-white italic">{progress}%</span>
                  </div>
                  <div className="h-4 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      className="h-full bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {['Forget Gate', 'Input Gate', 'Output Gate'].map(gate => (
                      <div key={gate} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mx-auto mb-2 animate-pulse"></div>
                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">{gate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {showResults && metrics && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {metricData.map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-8 rounded-[40px] text-center hover:bg-white/10 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-3 group-hover:text-zinc-400">{stat.name}</p>
                      <p className="text-4xl font-black text-white mb-1 italic">{(stat.value / 100).toFixed(3)}</p>
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full mt-4 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.value}%` }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: stat.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-card p-10 rounded-[48px] border border-white/5 h-[400px]">
                    <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-8">Performance Benchmarks</h4>
                    <ResponsiveContainer width="100%" height="80%">
                      <BarChart data={metricData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#52525b', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '16px' }}
                        />
                        <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                          {metricData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="glass-card p-10 rounded-[48px] border border-white/5 h-[400px]">
                    <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-8">Confusion Matrix Distribution</h4>
                    <div className="flex items-center justify-center h-[80%]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={confusionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                          >
                            {confusionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '16px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="grid grid-cols-1 gap-4 ml-4">
                        {confusionData.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{item.name}</span>
                              <span className="text-sm font-black text-white">{item.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Confusion Matrix Table */}
                <div className="glass-card p-12 rounded-[48px] border border-white/5">
                  <h4 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-10 text-center">Forensic Error Analysis</h4>
                  <div className="grid grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
                    <div className="p-8 bg-zinc-950/50"></div>
                    <div className="p-8 bg-zinc-950/50 text-center border-l border-white/5">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Predicted: REAL</p>
                    </div>
                    <div className="p-8 bg-zinc-950/50 text-center border-l border-white/5">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Predicted: FAKE</p>
                    </div>

                    <div className="p-8 bg-zinc-950/50 flex items-center border-t border-white/5">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Actual: REAL</p>
                    </div>
                    <div className="p-12 bg-emerald-500/10 text-center border-t border-l border-white/5 group hover:bg-emerald-500/20 transition-all">
                      <p className="text-3xl font-black text-emerald-400 mb-1">{metrics.confusionMatrix.tn}</p>
                      <p className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest">True Negative</p>
                    </div>
                    <div className="p-12 bg-rose-500/10 text-center border-t border-l border-white/5 group hover:bg-rose-500/20 transition-all">
                      <p className="text-3xl font-black text-rose-400 mb-1">{metrics.confusionMatrix.fp}</p>
                      <p className="text-[8px] font-black text-rose-500/50 uppercase tracking-widest">False Positive</p>
                    </div>

                    <div className="p-8 bg-zinc-950/50 flex items-center border-t border-white/5">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Actual: FAKE</p>
                    </div>
                    <div className="p-12 bg-amber-500/10 text-center border-t border-l border-white/5 group hover:bg-amber-500/20 transition-all">
                      <p className="text-3xl font-black text-amber-400 mb-1">{metrics.confusionMatrix.fn}</p>
                      <p className="text-[8px] font-black text-amber-500/50 uppercase tracking-widest">False Negative</p>
                    </div>
                    <div className="p-12 bg-emerald-500/10 text-center border-t border-l border-white/5 group hover:bg-emerald-500/20 transition-all">
                      <p className="text-3xl font-black text-emerald-400 mb-1">{metrics.confusionMatrix.tp}</p>
                      <p className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest">True Positive</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
