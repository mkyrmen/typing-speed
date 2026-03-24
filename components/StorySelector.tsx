"use client";

import { useTypingStore, GenreName } from "@/store/useTypingStore";
import { GENRES } from "@/constants/stories";
import Leaderboard from "@/components/Leaderboard";
import { BookOpen, Cpu, Rocket } from "lucide-react";

export default function StorySelector() {
  const setGenre = useTypingStore((s) => s.setGenre);

  const getIcon = (genreName: string) => {
    switch (genreName) {
      case "classic": return <BookOpen className="w-8 h-8" />;
      case "tech": return <Cpu className="w-8 h-8" />;
      case "scifi": return <Rocket className="w-8 h-8" />;
      default: return <BookOpen className="w-8 h-8" />;
    }
  };

  const getAccentColor = (genreName: string) => {
    switch (genreName) {
      case "classic": return "from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30 hover:border-amber-500/60";
      case "tech": return "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30 hover:border-blue-500/60";
      case "scifi": return "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30 hover:border-purple-500/60";
      default: return "from-gray-500/20 to-slate-500/20 text-gray-400 border-gray-500/30 hover:border-gray-500/60";
    }
  };

  return (
    <div className="w-full max-w-5xl flex flex-col items-center gap-12">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold tracking-tight text-white">Choose Your Story</h2>
        <p className="text-gray-400 text-lg">Select a genre to begin your typing journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {GENRES.map((g) => (
          <button
            key={g.name}
            onClick={() => setGenre(g.name as GenreName)}
            className={`group relative p-8 rounded-2xl border bg-gradient-to-br ${getAccentColor(g.name)} transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 overflow-hidden`}
          >
            {/* Visual Flare */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/5 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150" />
            
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors duration-300">
              {getIcon(g.name)}
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">{g.label}</h3>
              <p className="text-sm opacity-60 leading-relaxed font-medium">
                {g.stories.length} immersive stories
              </p>
            </div>

            <div className="mt-4 px-6 py-2 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 border border-white/10">
              Start Mode
            </div>
          </button>
        ))}
      </div>

      <div className="w-full mt-8">
        <Leaderboard />
      </div>
    </div>
  );
}
