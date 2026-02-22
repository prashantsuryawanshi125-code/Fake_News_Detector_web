
import React from 'react';
import { TrendingArticle } from '../types';

interface TrendingSidebarProps {
  articles: TrendingArticle[];
  onArticleClick: (text: string) => void;
}

export const TrendingSidebar: React.FC<TrendingSidebarProps> = ({ articles, onArticleClick }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center">
          <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3 shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-pulse"></span>
          Live Feed
        </h3>
        <span className="text-[9px] font-bold text-zinc-600 uppercase">Synchronized</span>
      </div>
      
      <div className="space-y-4">
        {articles.length > 0 ? articles.map((article) => (
          <div 
            key={article.id} 
            className="group cursor-pointer bg-zinc-900/50 border border-white/5 p-5 hover:bg-zinc-900 transition-all rounded-[24px] hover:border-indigo-500/30 shadow-sm"
            onClick={() => onArticleClick(`${article.title}\n\n${article.description}`)}
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-lg border border-white/5">
                  {article.category}
                </span>
                <span className="text-[9px] font-bold text-zinc-600">
                  {article.source}
                </span>
              </div>
              <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors leading-snug">
                {article.title}
              </h4>
              <p className="text-[10px] text-zinc-500 line-clamp-2 leading-relaxed font-medium">
                {article.description}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
               <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">{article.timestamp}</span>
               <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                 <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               </div>
            </div>
          </div>
        )) : (
          [1,2,3,4].map(i => (
            <div key={i} className="h-32 w-full bg-zinc-900/30 rounded-[24px] animate-pulse border border-white/5"></div>
          ))
        )}
      </div>
      
      <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-[24px] relative overflow-hidden group">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all"></div>
        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-3">System Metrics</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-400">Scan Rate</span>
            <span className="text-[10px] font-black text-white">42/sec</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="w-2/3 bg-indigo-500 h-full rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
