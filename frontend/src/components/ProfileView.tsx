
import React from 'react';

const ProfileView: React.FC = () => {
  return (
    <div className="h-full w-full bg-black pt-28 pb-20 overflow-y-auto no-scrollbar">
      <div className="px-6 flex flex-col items-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full border-4 border-primary p-1">
            <img src="https://picsum.photos/200" className="w-full h-full rounded-full object-cover" alt="Profile" />
          </div>
          <div className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full flex items-center justify-center border-4 border-black">
            <span className="material-symbols-outlined text-[14px]">edit</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-display font-black">Alex Rivera</h2>
        <p className="text-gray-400 text-sm mb-6">@arivera_tech • Reader since 2023</p>

        <div className="flex w-full justify-around mb-8 bg-card-dark rounded-2xl py-4">
          <StatBox label="Slings" value="1.2k" />
          <StatBox label="Reaction" value="450" />
          <StatBox label="Rank" value="#42" />
        </div>

        <div className="w-full space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Your Saved Slings</h3>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-gray-900 overflow-hidden relative">
                <img src={`https://picsum.photos/seed/${i+10}/300/400`} className="w-full h-full object-cover opacity-70" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <p className="absolute bottom-2 left-2 right-2 text-[10px] font-bold line-clamp-2">The future of VR is closer than we thought</p>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full mt-8 bg-card-dark text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:bg-gray-800 transition-colors">
          <span className="material-symbols-outlined text-sm">logout</span>
          Logout
        </button>
      </div>
    </div>
  );
};

const StatBox = ({ label, value }: { label: string, value: string }) => (
  <div className="text-center">
    <p className="text-xl font-display font-black text-white">{value}</p>
    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">{label}</p>
  </div>
);

export default ProfileView;
