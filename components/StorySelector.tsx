"use client";

import React, { useState } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { GENRES, GenreName, Story } from "@/constants/stories";
import Leaderboard from "@/components/Leaderboard";
import { BookOpen, Code2, Rocket, ArrowLeft, ChevronRight } from "lucide-react";

type StorySelectorProps = {
  onSelect: (text: string, title: string) => void;
};

export default function StorySelector({ onSelect }: StorySelectorProps) {
  const [selectedGenre, setSelectedGenre] = useState<GenreName | null>(null);

  const getIcon = (genreName: string) => {
    switch (genreName) {
      case "classic": return <BookOpen className="w-8 h-8" />;
      case "code": return <Code2 className="w-8 h-8" />;
      case "scifi": return <Rocket className="w-8 h-8" />;
      default: return <BookOpen className="w-8 h-8" />;
    }
  };

  const getAccentColor = (genreName: string) => {
    switch (genreName) {
      case "classic": return "from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30 hover:border-amber-500/60";
      case "code": return "from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60";
      case "scifi": return "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30 hover:border-purple-500/60";
      default: return "from-gray-500/20 to-slate-500/20 text-gray-400 border-gray-500/30 hover:border-gray-500/60";
    }
  };

  const currentGenreData = GENRES.find(g => g.name === selectedGenre);

  if (selectedGenre && currentGenreData) {
    return (
      <div className="w-full max-w-5xl flex flex-col items-center gap-8">
        <div className="w-full flex items-center justify-between">
          <button
            onClick={() => setSelectedGenre(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Genres</span>
          </button>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${getAccentColor(selectedGenre).split(" ")[2]}`}>
              {getIcon(selectedGenre)}
            </div>
            <h2 className="text-2xl font-bold text-white">{currentGenreData.label} Library</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {currentGenreData.stories.map((story) => (
            <button
              key={story.id}
              onClick={() => onSelect(story.text, story.title)}
              className="group text-left p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex flex-col gap-4 relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-white group-hover:text-[color:var(--caret)] transition-colors">{story.title}</h3>
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[color:var(--caret)] transition-all group-hover:translate-x-1" />
              </div>
              <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed italic">
                "{story.text.substring(0, 120)}..."
              </p>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {story.text.length} characters
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl flex flex-col items-center gap-12">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold tracking-tight text-white">Story Library</h2>
        <p className="text-gray-400 text-lg">Choose a genre to explore immersive stories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {GENRES.map((g) => (
          <button
            key={g.name}
            onClick={() => setSelectedGenre(g.name)}
            className={`group relative p-8 rounded-2xl border bg-gradient-to-br ${getAccentColor(g.name)} transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col items-center gap-6 overflow-hidden`}
          >
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
              Browse Genre
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
