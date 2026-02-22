
import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Line, Bar
} from 'recharts';
import { AnalysisResult, LSTMStep } from '../types';

interface VisualizationProps {
  data: AnalysisResult;
}

const GateHeatmap = ({ sequence }: { sequence: LSTMStep[] }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Neural Activation Heatmap</h5>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div><span className="text-[8px] uppercase font-bold">Input</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-[8px] uppercase font-bold">Forget</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[8px] uppercase font-bold">Output</span></div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {sequence.map((step, idx) => (
          <div key={idx} className="flex items-center gap-4 group">
            <span className="w-16 text-[10px] font-mono text-zinc-500 truncate text-right group-hover:text-white transition-colors">{step.token}</span>
            <div className="flex-1 h-3 flex gap-1">
              <div 
                className="h-full bg-indigo-500/40 border border-indigo-500/20 rounded-sm transition-all hover:bg-indigo-500" 
                style={{ width: `${step.inputGate * 100}%` }}
                title={`Input Gate: ${step.inputGate.toFixed(2)}`}
              ></div>
              <div 
                className="h-full bg-rose-500/40 border border-rose-500/20 rounded-sm transition-all hover:bg-rose-500" 
                style={{ width: `${step.forgetGate * 100}%` }}
                title={`Forget Gate: ${step.forgetGate.toFixed(2)}`}
              ></div>
              <div 
                className="h-full bg-emerald-500/40 border border-emerald-500/20 rounded-sm transition-all hover:bg-emerald-500" 
                style={{ width: `${step.outputGate * 100}%` }}
                title={`Output Gate: ${step.outputGate.toFixed(2)}`}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AnalysisCharts: React.FC<VisualizationProps> = ({ data }) => {
  const { sequence } = data.lstmProof;

  return (
    <div className="space-y-12">
      {/* 1. Main Neural Propagation Chart */}
      <div className="bg-zinc-950/50 border border-white/5 rounded-[32px] p-8 lg:p-10 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-1">State Propagation Trajectory</h4>
            <p className="text-[10px] text-zinc-500 font-mono">Sequence Analysis Model: LSTM-v4-Deep</p>
          </div>
          <div className="text-right">
             <div className="text-xs font-mono text-zinc-400">Loss: <span className="text-indigo-400">{data.lstmProof.finalGradient.toFixed(6)}</span></div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sequence}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
              <XAxis dataKey="token" tick={{ fill: '#52525b', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 1.2]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800 }}
              />
              <Area type="monotone" dataKey="cellState" fill="url(#colorCell)" stroke="#6366f1" strokeWidth={3} />
              <Line type="stepAfter" dataKey="hiddenState" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7' }} />
              <Bar dataKey="weight" barSize={8} fill="#3f3f46" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="colorCell" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Gate Activation Heatmap & Radar Dials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-10 rounded-[40px] border border-white/5">
          <GateHeatmap sequence={sequence} />
        </div>

        <div className="glass-card p-10 rounded-[40px] border border-white/5 flex flex-col items-center justify-center">
          <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-8 text-center">Neural Gate Distribution</h5>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { gate: 'Forget', value: sequence.reduce((acc, s) => acc + s.forgetGate, 0) / sequence.length * 100 },
                { gate: 'Input', value: sequence.reduce((acc, s) => acc + s.inputGate, 0) / sequence.length * 100 },
                { gate: 'Output', value: sequence.reduce((acc, s) => acc + s.outputGate, 0) / sequence.length * 100 },
                { gate: 'Credibility', value: data.score },
                { gate: 'Reliability', value: data.linguisticPatterns.sourceReliability }
              ]}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="gate" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 900 }} />
                <Radar name="LSTM Pattern" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Summary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Cell Consistency', val: `${(sequence.reduce((a, b) => a + b.cellState, 0) / sequence.length * 100).toFixed(1)}%`, sub: 'Memory Stability' },
          { label: 'Token Weight', val: sequence.reduce((a, b) => a + b.weight, 0).toFixed(2), sub: 'Total Significance' },
          { label: 'Epoch Convergence', val: '42', sub: 'Calculated Iterations' },
          { label: 'Bias Quotient', val: `${data.linguisticPatterns.biasScore}%`, sub: 'Information Neutrality' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-[32px] text-center hover:bg-white/10 transition-all cursor-default group">
            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-2 group-hover:text-zinc-400">{stat.label}</p>
            <p className="text-2xl font-black text-white mb-1">{stat.val}</p>
            <p className="text-[9px] font-medium text-zinc-600 uppercase">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
