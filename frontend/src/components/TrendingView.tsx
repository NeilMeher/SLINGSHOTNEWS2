
import React from 'react';

const TrendingView: React.FC = () => {
  const trends = [
    { title: "#VisionPro", posts: "12.4k slings", color: "bg-blue-500" },
    { title: "#TikTokBan", posts: "89.1k slings", color: "bg-purple-500" },
    { title: "#GTAVI", posts: "55.2k slings", color: "bg-emerald-500" },
    { title: "#SpaceX", posts: "8.1k slings", color: "bg-orange-500" },
    { title: "#AIGen", posts: "34.5k slings", color: "bg-pink-500" },
  ];

  return (
    <div className="h-full w-full bg-black pt-28 pb-20 px-6 overflow-y-auto no-scrollbar">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-black mb-4">Trending</h2>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input 
            type="text" 
            placeholder="Search news, topics..." 
            className="w-full bg-card-dark border-none rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {trends.map((trend, i) => (
          <div key={i} className="bg-card-dark rounded-2xl p-5 flex items-center justify-between group active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${trend.color} flex items-center justify-center font-display font-black text-xl`}>
                #
              </div>
              <div>
                <p className="font-bold text-lg">{trend.title}</p>
                <p className="text-xs text-gray-400">{trend.posts}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-600 group-hover:text-primary transition-colors">chevron_right</span>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Recommended for you</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="min-w-[280px] h-40 rounded-2xl bg-gray-900 relative overflow-hidden flex-shrink-0">
              <img src={`https://picsum.photos/seed/${i+40}/400/200`} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-bold text-sm leading-tight line-clamp-2">How generative AI is changing the landscape of journalism in 2024</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingView;
