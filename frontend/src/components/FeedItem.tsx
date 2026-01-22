
import React from 'react';
import { NewsItem } from '../types';

interface FeedItemProps {
  item: NewsItem;
}

const FeedItem: React.FC<FeedItemProps> = ({ item }) => {
  return (
    <article className="h-full w-full snap-start relative flex flex-col overflow-hidden bg-black">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          alt={item.title} 
          className="w-full h-full object-cover brightness-75 contrast-110" 
          src={item.image} 
        />
        <div className="absolute inset-0 moody-gradient"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col pt-32 pb-24 px-5 pointer-events-none">
        
        {/* Main Text Area */}
        <div className="w-full pr-16 pointer-events-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className={`flex h-6 px-3 items-center justify-center rounded-full ${item.categoryColor} backdrop-blur-sm border border-white/20 shadow-lg`}>
              <p className="text-white text-[10px] font-black tracking-widest">{item.category}</p>
            </div>
            <span className="text-xs text-gray-300 font-medium drop-shadow-md">{item.time}</span>
          </div>

          <h2 className="text-white text-4xl leading-[1.1] font-display font-black tracking-tight mb-5 drop-shadow-2xl">
            {item.title}
          </h2>

          <ul className="space-y-3 mb-6">
            {item.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${item.categoryColor} flex-shrink-0 shadow-lg`}></span>
                <p className="text-gray-100 text-sm font-bold leading-snug drop-shadow-sm">{bullet}</p>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
              <span className="text-black font-bold text-[10px]">{item.sourceLogo}</span>
            </div>
            <p className="text-gray-200 text-xs font-bold">{item.source}</p>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 mt-16 flex flex-col gap-6 items-center z-20 pointer-events-auto">
          <ActionButton label="W" count={item.stats.w} />
          <ActionButton label="mid" count={item.stats.mid} />
          <ActionButton label={item.stats.reactionEmoji} count={item.stats.reaction} highlight />
          <ActionButton label="cap" count={item.stats.cap} />
          
          <button className="mt-2 flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-white text-3xl drop-shadow-lg">share</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Share</span>
          </button>
        </div>

        {/* Bottom CTA */}
        <div className="mt-auto w-full pointer-events-auto">
          <a 
            href="#" 
            className="w-fit px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs font-extrabold hover:bg-white/20 flex items-center gap-2 transition-all shadow-xl active:scale-95"
          >
            Read Original
            <span className="material-symbols-outlined text-sm">arrow_outward</span>
          </a>
        </div>
      </div>
    </article>
  );
};

const ActionButton = ({ label, count, highlight }: { label: string, count: string, highlight?: boolean }) => (
  <button className="flex flex-col items-center gap-1 group">
    <div className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-90 transition-all ${highlight ? 'ring-2 ring-primary' : ''}`}>
      <span className={`text-xl font-bold font-display ${highlight ? 'text-primary' : 'text-white'}`}>{label}</span>
    </div>
    <span className={`text-[10px] font-bold ${highlight ? 'text-primary' : 'text-gray-300'}`}>{count}</span>
  </button>
);

export default FeedItem;
