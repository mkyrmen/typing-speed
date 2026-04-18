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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[var(--background)] text-[color:var(--foreground)] selection:bg-[color:var(--caret)]/25">
      <AudioPreload />

      {view === "menu" ? (
        <div className="w-full flex flex-col items-center flex-1 justify-start pt-4 md:pt-8 relative">
          <div className="w-full flex flex-wrap items-center justify-between max-w-5xl gap-4 px-4 min-h-[80px] z-50">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              <span className="text-[color:var(--caret)]">Typing</span>App
            </h1>
            <div className="flex items-center gap-2">
              <SoundToggle />
              <ThemeToggle />
            </div>
          </div>
          <div className="mt-8 md:mt-12 w-full flex flex-1 items-center justify-center">
            <StorySelector onSelect={(text: string, title: string) => setStory(text, title)} />
          </div>
        </div>
      ) : (
        <TypingArena />
      )}
    </main>
  );
}
