"use client";

import TypingArena from "@/components/TypingArena";
import StorySelector from "@/components/StorySelector";
import ThemeToggle from "@/components/ThemeToggle";
import SoundToggle from "@/components/SoundToggle";
import AudioPreload from "@/components/AudioPreload";
import { useTypingStore } from "@/store/useTypingStore";

export default function Home() {
  const view = useTypingStore((s) => s.view);
  const setStory = useTypingStore((s) => s.setStory);

  const handleSelectStory = (text: string, title: string) => {
    setStory(text, title);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[var(--background)] text-[color:var(--foreground)] selection:bg-[color:var(--caret)]/25">
      <AudioPreload />

      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        <SoundToggle />
        <ThemeToggle />
      </div>

      <h1 className="text-5xl font-semibold mb-12 tracking-tight">
        <span className="text-[color:var(--caret)]">Typing</span>App
      </h1>
      
      {view === "menu" ? (
        <StorySelector onSelect={handleSelectStory} />
      ) : (
        <TypingArena />
      )}
    </main>
  );
}
