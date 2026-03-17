"use client";

import React, { useEffect, useRef, useLayoutEffect, useState } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import TimerSelector from "./TimerSelector";
import ProgressBar from "./ProgressBar";
import TestComplete from "./TestComplete";
import StatsBar from "./StatsBar";
import ThemeToggle from "./ThemeToggle";
import SoundToggle from "./SoundToggle";
import AudioPreload from "./AudioPreload";
import { typingSound } from "@/lib/audio/typingSound";
import { useSettingsStore } from "@/store/useSettingsStore";
import { ArrowLeft } from "lucide-react";

export default function TypingArena() {
  const { targetText, userInput, updateInput, backspace, status, resetGame, tick, resetToMenu } = useTypingStore();
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [caretPos, setCaretPos] = useState({ top: 0, left: 0 });
  const [inputValue, setInputValue] = useState("");
  const [shake, setShake] = useState(false);

  // Focus initially
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "typing") {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, tick]);

  // Global Shortcuts (Tab for reset, Enter for restart)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        resetGame();
        inputRef.current?.focus();
      }
      if (e.key === "Enter" && status === "finished") {
        resetGame();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        resetToMenu();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [resetGame, resetToMenu, status]);

  const handleClick = () => {
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length > 0) {
      const char = val.slice(-1);
      const targetChar = targetText[userInput.length];
      
      if (char !== targetChar) {
          setShake(true);
          setTimeout(() => setShake(false), 200);
      }
      
      updateInput(char);
    }
    setInputValue(""); // Keep it empty
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (soundEnabled) {
      const k = e.key;
      const isModifier = k === "Shift" || k === "Alt" || k === "Control" || k === "Meta";
      const isNav = k === "Tab" || k === "Escape" || k === "Enter";
      if (!isModifier && !isNav) {
        // Ensure context is resumed then play; no await to keep it tight.
        void typingSound.unlock();
        typingSound.play();
      }
    }
    if (e.key === "Backspace") {
      backspace();
    }
  };

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    
    const charElements = containerRef.current.querySelectorAll("span.char-span");
    const targetIndex = Math.min(userInput.length, targetText.length - 1);
    
    if (charElements.length === 0) return;

    const activeSpan = charElements[targetIndex] as HTMLElement;
    
    if (activeSpan) {
       const spanRect = activeSpan.getBoundingClientRect();
       const containerRect = containerRef.current.getBoundingClientRect();
       
       if (userInput.length === targetText.length && targetText.length > 0) {
          // If we finished typing
          const lastSpan = charElements[targetText.length - 1] as HTMLElement;
          const lastRect = lastSpan.getBoundingClientRect();
          setCaretPos({
             top: lastRect.top - containerRect.top,
             left: lastRect.right - containerRect.left
          });
       } else {
           // Normal typing position
           setCaretPos({
              top: spanRect.top - containerRect.top,
              left: spanRect.left - containerRect.left
           });
           
           // Smooth scroll active line into view
           activeSpan.scrollIntoView({ behavior: "smooth", block: "center" });
       }
    }
  }, [userInput.length, targetText.length]);

  const handleBackClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent focusing the input
    resetToMenu();
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 bg-[var(--background)] text-[color:var(--foreground)] selection:bg-[color:var(--caret)]/25">
      <AudioPreload />
      <StatsBar />
      <div className="fixed top-6 left-6 z-50">
        <button
          type="button"
          onClick={handleBackClick}
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--foreground)]/12 bg-[color:var(--foreground)]/6 px-3 py-2 text-xs font-medium text-[color:var(--foreground)]/70 hover:text-[color:var(--foreground)] transition backdrop-blur"
          aria-label="Back to menu"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
          <span className="text-[10px] opacity-60 ml-1 border border-current/30 px-1.5 py-0.5 rounded">Esc</span>
        </button>
      </div>

      <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
        <SoundToggle />
        <ThemeToggle />
      </div>

      <div className="w-[70%] max-w-[70vw] flex flex-col gap-12">

        <div className="flex flex-col items-center w-full">
          <TimerSelector />
          <ProgressBar />
          
          {status === "finished" ? (
            <TestComplete />
          ) : (
            <div 
              className={`relative w-full p-0 cursor-text text-3xl font-mono leading-relaxed transition-all duration-500 ${shake ? 'animate-shake' : ''}`} 
              onClick={handleClick}
            >
              <input 
                ref={inputRef}
                type="text"
                className="absolute w-0 h-0 opacity-0 pointer-events-none"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="off"
                spellCheck="false"
              />
              
              <div ref={containerRef} className="relative z-10 flex flex-wrap gap-y-6 tracking-tight">
                {targetText.length > 0 && (
                    <div 
                      className={`absolute w-[3px] h-7 bg-[color:var(--caret)] z-20 ${status === 'idle' ? 'animate-pulse' : ''}`}
                      style={{ 
                         top: caretPos.top, 
                         left: caretPos.left,
                         boxShadow: "0 0 12px var(--caret)",
                         transition: "all 75ms cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                      }}
                    />
                )}

                {/* Group targetText into words */}
                {(() => {
                    const words: { chars: string[]; startIndex: number }[] = [];
                    let currentWord: { chars: string[]; startIndex: number } = { chars: [], startIndex: 0 };
                    
                    targetText.forEach((char, index) => {
                      currentWord.chars.push(char);
                      if (char === " " || index === targetText.length - 1) {
                        words.push(currentWord);
                        currentWord = { chars: [], startIndex: index + 1 };
                      }
                    });

                    return words.map((word, wordIndex) => (
                      <div key={wordIndex} className="flex whitespace-nowrap">
                        {word.chars.map((char, charIndex) => {
                          const globalIndex = word.startIndex + charIndex;
                          let colorClass = "text-untyped";
                          let animClass = "";
                          
                          if (globalIndex < userInput.length) {
                             if (userInput[globalIndex] === char) {
                                colorClass = "text-correct";
                                if (globalIndex === userInput.length - 1) {
                                    animClass = "animate-pop inline-block";
                                }
                             } else {
                                colorClass = "text-wrong underline";
                                if (globalIndex === userInput.length - 1 && shake) {
                                    animClass = "animate-shake inline-block";
                                }
                             }
                          }

                          return (
                            <span 
                              key={globalIndex} 
                              className={`char-span ${colorClass} transition-colors duration-150 ${animClass}`}
                            >
                              {char === " " ? "\u00A0" : char}
                            </span>
                          );
                        })}
                      </div>
                    ));
                 })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
