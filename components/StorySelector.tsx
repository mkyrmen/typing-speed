"use client";

import stories from "@/content/stories.json";
import Leaderboard from "@/components/Leaderboard";

interface StorySelectorProps {
  onSelect: (text: string, title: string) => void;
}

export default function StorySelector({ onSelect }: StorySelectorProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-2xl font-semibold mb-6 text-gray-200">Select a Story</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => onSelect(story.text, story.title)}
            className="p-6 rounded-lg border border-gray-800 bg-gray-900/50 cursor-pointer transition-all duration-200 hover:border-yellow-500 hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] hover:-translate-y-1 flex flex-col justify-between h-40 group"
          >
            <div>
              <h3 className="text-xl font-medium text-white mb-2 group-hover:text-yellow-500 transition-colors">{story.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                {story.text}
              </p>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(story.difficulty)} font-medium`}>
                {story.difficulty}
              </span>
              <span className="text-xs text-gray-500 font-mono">
                {story.text.split(" ").length} words
              </span>
            </div>
          </div>
        ))}
      </div>

      <Leaderboard />
    </div>
  );
}
